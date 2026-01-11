/**
 * InsightsModal
 * Displays reading insights and suggests permanent note topics
 */

import { Modal, Notice, setIcon, normalizePath, TFolder } from 'obsidian';
import { ReadingItem } from '../core/domain/entities/reading-item';
import { SuggestNoteTopicsUseCase, NoteTopic } from '../core/application/use-cases/suggest-note-topics';
import type { SuggestedNoteTopic } from '../core/domain/entities/content-analysis';
import type ReadingQueuePlugin from '../main';

export class InsightsModal extends Modal {
  private plugin: ReadingQueuePlugin;
  private item: ReadingItem;
  private isLoadingTopics = false;
  private noteTopics: NoteTopic[] = [];

  constructor(plugin: ReadingQueuePlugin, item: ReadingItem) {
    super(plugin.app);
    this.plugin = plugin;
    this.item = item;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('reading-queue-insights-modal');

    // Load existing note topics from analysis (persistence)
    if (this.item.analysis?.hasSuggestedNoteTopics()) {
      this.noteTopics = this.item.analysis.suggestedNoteTopics as NoteTopic[];
    }

    // Header
    contentEl.createEl('h2', { text: '💡 Insights & Note Suggestions' });
    contentEl.createEl('p', {
      text: this.item.title,
      cls: 'insights-modal-title',
    });

    // Analysis section
    if (this.item.analysis) {
      this.renderAnalysisSection(contentEl);
    } else {
      this.renderNoAnalysisState(contentEl);
    }

    // Note topics section
    this.renderNoteTopicsSection(contentEl);

    // Close button
    const buttonContainer = contentEl.createDiv({
      cls: 'modal-button-container',
    });
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.textAlign = 'center';

    const closeBtn = buttonContainer.createEl('button', {
      text: 'Close',
      cls: 'mod-cta',
    });
    closeBtn.addEventListener('click', () => this.close());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private renderAnalysisSection(container: HTMLElement): void {
    const analysis = this.item.analysis!;
    const section = container.createDiv({ cls: 'insights-section' });

    // Summary
    section.createEl('h3', { text: '📝 Summary' });
    section.createEl('p', { text: analysis.summary });

    // Key Insights
    if (analysis.keyInsights.length > 0) {
      section.createEl('h3', { text: '🔑 Key Insights' });
      const list = section.createEl('ul', { cls: 'insights-list' });
      for (const insight of analysis.keyInsights) {
        const li = list.createEl('li');
        li.createSpan({ text: insight });

        // Copy button for each insight
        const copyBtn = li.createEl('button', { cls: 'insights-copy-btn' });
        setIcon(copyBtn, 'copy');
        copyBtn.addEventListener('click', async () => {
          await navigator.clipboard.writeText(insight);
          new Notice('Insight copied to clipboard.');
        });
      }
    }

    // Tags
    if (analysis.suggestedTags.length > 0) {
      section.createEl('h3', { text: '🏷️ Suggested Tags' });
      const tagsEl = section.createDiv({ cls: 'insights-tags' });
      for (const tag of analysis.suggestedTags) {
        tagsEl.createSpan({ cls: 'reading-queue-tag', text: `#${tag}` });
      }
    }

    // Metadata
    const metaEl = section.createDiv({ cls: 'insights-meta' });
    metaEl.createEl('small', {
      text: `Analyzed: ${analysis.analyzedAt.toLocaleString()} | Model: ${analysis.model}`,
    });
  }

  private renderNoAnalysisState(container: HTMLElement): void {
    const section = container.createDiv({ cls: 'insights-section empty' });
    section.createEl('p', {
      text: 'No analysis results available for this item.',
    });
    section.createEl('p', {
      text: 'Run analysis from the edit screen.',
      cls: 'muted',
    });
  }

  private renderNoteTopicsSection(container: HTMLElement): void {
    const section = container.createDiv({ cls: 'note-topics-section' });
    section.createEl('h3', { text: '📝 Permanent Note Topic Suggestions' });

    const topicsContainer = section.createDiv({ cls: 'note-topics-container' });

    if (this.noteTopics.length > 0) {
      this.renderNoteTopics(topicsContainer);
    } else {
      this.renderGenerateTopicsButton(topicsContainer);
    }
  }

  private renderGenerateTopicsButton(container: HTMLElement): void {
    container.empty();

    if (this.isLoadingTopics) {
      const loadingEl = container.createDiv({ cls: 'note-topics-loading' });
      loadingEl.createSpan({ text: 'Generating note topics...' });
      return;
    }

    const description = container.createEl('p', {
      text: 'Get suggestions for permanent note topics based on what you read.',
    });

    const generateBtn = container.createEl('button', {
      text: '📝 Get Note Topic Suggestions',
      cls: 'mod-cta',
    });
    generateBtn.style.marginTop = '10px';

    generateBtn.addEventListener('click', async () => {
      await this.generateNoteTopics(container);
    });
  }

  private async generateNoteTopics(container: HTMLElement): Promise<void> {
    if (!this.plugin.costTracker) {
      new Notice('AI service not initialized.');
      return;
    }

    this.isLoadingTopics = true;
    this.renderGenerateTopicsButton(container);

    try {
      const useCase = new SuggestNoteTopicsUseCase(this.app, this.plugin.costTracker);
      const result = await useCase.execute({
        itemId: this.item.id,
        title: this.item.title,
        url: this.item.url,
        analysis: this.item.analysis,
        userNotes: this.item.notes,
      });

      if (result.success && result.topics.length > 0) {
        this.noteTopics = result.topics;

        // Persist topics to analysis
        if (this.item.analysis) {
          this.item.analysis.setSuggestedNoteTopics(result.topics as SuggestedNoteTopic[]);
          await this.plugin.repository.save(this.item);
        }

        this.renderNoteTopics(container);
        new Notice(`${result.topics.length} note topics suggested.`);
      } else {
        new Notice(result.error || 'Failed to generate note topics.');
        this.isLoadingTopics = false;
        this.renderGenerateTopicsButton(container);
      }
    } catch (error) {
      new Notice('Error generating note topics.');
      console.error('Note topic generation error:', error);
      this.isLoadingTopics = false;
      this.renderGenerateTopicsButton(container);
    }
  }

  private renderNoteTopics(container: HTMLElement): void {
    container.empty();

    // Combined note creation button
    const actionRow = container.createDiv({ cls: 'note-topics-actions' });
    actionRow.style.marginBottom = '16px';
    actionRow.style.display = 'flex';
    actionRow.style.gap = '10px';
    actionRow.style.flexWrap = 'wrap';

    const createAllBtn = actionRow.createEl('button', {
      text: '📄 Create Combined Note',
      cls: 'mod-cta',
    });
    createAllBtn.addEventListener('click', () => this.createCombinedNote());

    const regenerateBtn = actionRow.createEl('button', {
      text: '🔄 Regenerate',
    });
    regenerateBtn.addEventListener('click', async () => {
      this.noteTopics = [];
      this.isLoadingTopics = false;
      this.renderGenerateTopicsButton(container);
      await this.generateNoteTopics(container);
    });

    for (const topic of this.noteTopics) {
      const topicCard = container.createDiv({ cls: 'note-topic-card' });

      // Title with create button
      const titleRow = topicCard.createDiv({ cls: 'note-topic-title-row' });
      titleRow.createEl('h4', { text: topic.title });

      const createBtn = titleRow.createEl('button', { text: 'Create Note' });
      createBtn.addEventListener('click', () => this.createNoteFromTopic(topic));

      // Description
      topicCard.createEl('p', {
        text: topic.description,
        cls: 'note-topic-description',
      });

      // Key points
      if (topic.keyPoints.length > 0) {
        const pointsList = topicCard.createEl('ul', { cls: 'note-topic-points' });
        for (const point of topic.keyPoints) {
          pointsList.createEl('li', { text: point });
        }
      }

      // Tags
      if (topic.suggestedTags.length > 0) {
        const tagsEl = topicCard.createDiv({ cls: 'note-topic-tags' });
        for (const tag of topic.suggestedTags) {
          tagsEl.createSpan({ cls: 'reading-queue-tag', text: `#${tag}` });
        }
      }
    }
  }

  private async createNoteFromTopic(topic: NoteTopic): Promise<void> {
    // Generate note content
    const content = this.generateNoteContent(topic);

    // Create file with folder support (cross-platform safe)
    const fileName = `${topic.title.replace(/[\\/:*?"<>|]/g, '')}.md`;
    const folderPath = this.plugin.settings.defaultNoteFolder;
    const filePath = normalizePath(folderPath ? `${folderPath}/${fileName}` : fileName);

    try {
      // Ensure folder exists if specified (cross-platform safe)
      if (folderPath) {
        await this.ensureFolder(normalizePath(folderPath));
      }

      // Check if file exists (with adapter fallback for sync scenarios)
      const fileExists = await this.fileExists(filePath);
      if (fileExists) {
        new Notice('A note with the same name already exists.');
        return;
      }

      await this.createFile(filePath, content);

      // Link to reading item
      this.item.addLinkedNote(filePath);
      await this.plugin.repository.save(this.item);

      new Notice(`Note created: ${fileName}`);

      // Open the created note
      await this.app.workspace.openLinkText(filePath, '', true);
    } catch (error) {
      new Notice('Failed to create note.');
      console.error('Note creation error:', error);
    }
  }

  /**
   * Ensure folder exists with cross-platform compatibility
   */
  private async ensureFolder(path: string): Promise<void> {
    const normalizedPath = normalizePath(path);
    const existing = this.app.vault.getAbstractFileByPath(normalizedPath);

    if (existing instanceof TFolder) {
      return;
    }

    try {
      await this.app.vault.createFolder(normalizedPath);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes('already exists')) {
        return;
      }
      throw error;
    }
  }

  /**
   * Check if file exists with adapter fallback
   */
  private async fileExists(path: string): Promise<boolean> {
    const normalizedPath = normalizePath(path);
    const file = this.app.vault.getAbstractFileByPath(normalizedPath);
    if (file) return true;

    try {
      return await this.app.vault.adapter.exists(normalizedPath);
    } catch {
      return false;
    }
  }

  /**
   * Create file with cross-platform compatibility
   */
  private async createFile(path: string, content: string): Promise<void> {
    const normalizedPath = normalizePath(path);

    try {
      await this.app.vault.create(normalizedPath, content);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.toLowerCase().includes('already exists')) {
        await this.app.vault.adapter.write(normalizedPath, content);
        return;
      }
      throw error;
    }
  }

  /**
   * Create a combined note with all insights and note topics
   */
  private async createCombinedNote(): Promise<void> {
    const analysis = this.item.analysis;
    if (!analysis) {
      new Notice('No analysis results available.');
      return;
    }

    // Generate combined note content
    const content = this.generateCombinedNoteContent();

    // Create file
    const safeTitle = this.item.title.replace(/[\\/:*?"<>|]/g, '').substring(0, 50);
    const fileName = `${safeTitle} - Comprehensive Insights.md`;
    const folderPath = this.plugin.settings.defaultNoteFolder;
    const filePath = normalizePath(folderPath ? `${folderPath}/${fileName}` : fileName);

    try {
      if (folderPath) {
        await this.ensureFolder(normalizePath(folderPath));
      }

      const fileExists = await this.fileExists(filePath);
      if (fileExists) {
        new Notice('A note with the same name already exists.');
        return;
      }

      await this.createFile(filePath, content);

      // Link to reading item
      this.item.addLinkedNote(filePath);
      await this.plugin.repository.save(this.item);

      new Notice(`Combined note created: ${fileName}`);

      // Open the created note
      await this.app.workspace.openLinkText(filePath, '', true);
    } catch (error) {
      new Notice('Failed to create combined note.');
      console.error('Combined note creation error:', error);
    }
  }

  /**
   * Generate combined note content with all insights and topics
   */
  private generateCombinedNoteContent(): string {
    const analysis = this.item.analysis!;
    const sourceLink = this.item.url ? `[${this.item.title}](${this.item.url})` : this.item.title;

    // Collect all tags
    const allTags = new Set<string>();
    for (const tag of analysis.suggestedTags) {
      allTags.add(tag);
    }
    for (const topic of this.noteTopics) {
      for (const tag of topic.suggestedTags) {
        allTags.add(tag);
      }
    }
    const tagsArray = Array.from(allTags);

    // Key insights
    const insightsList = analysis.keyInsights.map(i => `- ${i}`).join('\n');

    // Note topics section
    let topicsSection = '';
    if (this.noteTopics.length > 0) {
      topicsSection = '\n## 📝 Permanent Note Topics\n\n';
      for (const topic of this.noteTopics) {
        topicsSection += `### ${topic.title}\n\n`;
        topicsSection += `${topic.description}\n\n`;
        if (topic.keyPoints.length > 0) {
          topicsSection += '**Key Points:**\n';
          topicsSection += topic.keyPoints.map(p => `- ${p}`).join('\n');
          topicsSection += '\n\n';
        }
      }
    }

    return `---
tags: [${tagsArray.join(', ')}]
source: "[[Reading Queue]]"
created: ${new Date().toISOString().split('T')[0]}
type: comprehensive-insight
---

# ${this.item.title} - Comprehensive Insights

## 📌 Source

- ${sourceLink}

## 📝 Summary

${analysis.summary}

## 🔑 Key Insights

${insightsList}
${topicsSection}
## 💭 Related Thoughts



## 📋 Metadata

- Analyzed: ${analysis.analyzedAt.toLocaleString()}
- Model: ${analysis.model}
${analysis.estimatedReadingTime ? `- Estimated reading time: ${analysis.getReadingTimeDisplay()}` : ''}
`;
  }

  private generateNoteContent(topic: NoteTopic): string {
    const sourceLink = this.item.url ? `[${this.item.title}](${this.item.url})` : this.item.title;

    const keyPointsList = topic.keyPoints.map(p => `- ${p}`).join('\n');

    return `---
tags: [${topic.suggestedTags.join(', ')}]
source: "[[Reading Queue]]"
created: ${new Date().toISOString().split('T')[0]}
---

# ${topic.title}

${topic.description}

## Key Points

${keyPointsList}

## Source

- ${sourceLink}

## Related Thoughts



`;
  }
}
