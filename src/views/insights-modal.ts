/**
 * InsightsModal
 * Displays reading insights and suggests permanent note topics
 */

import { Modal, Notice, setIcon, normalizePath, TFolder } from 'obsidian';
import { ReadingItem } from '../core/domain/entities/reading-item';
import { SuggestNoteTopicsUseCase, NoteTopic } from '../core/application/use-cases/suggest-note-topics';
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

    // Header
    contentEl.createEl('h2', { text: '💡 인사이트 & 노트 추천' });
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
      text: '닫기',
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
    section.createEl('h3', { text: '📝 요약' });
    section.createEl('p', { text: analysis.summary });

    // Key Insights
    if (analysis.keyInsights.length > 0) {
      section.createEl('h3', { text: '🔑 핵심 인사이트' });
      const list = section.createEl('ul', { cls: 'insights-list' });
      for (const insight of analysis.keyInsights) {
        const li = list.createEl('li');
        li.createSpan({ text: insight });

        // Copy button for each insight
        const copyBtn = li.createEl('button', { cls: 'insights-copy-btn' });
        setIcon(copyBtn, 'copy');
        copyBtn.addEventListener('click', async () => {
          await navigator.clipboard.writeText(insight);
          new Notice('인사이트가 복사되었습니다.');
        });
      }
    }

    // Tags
    if (analysis.suggestedTags.length > 0) {
      section.createEl('h3', { text: '🏷️ 추천 태그' });
      const tagsEl = section.createDiv({ cls: 'insights-tags' });
      for (const tag of analysis.suggestedTags) {
        tagsEl.createSpan({ cls: 'reading-queue-tag', text: `#${tag}` });
      }
    }

    // Metadata
    const metaEl = section.createDiv({ cls: 'insights-meta' });
    metaEl.createEl('small', {
      text: `분석 일시: ${analysis.analyzedAt.toLocaleString()} | 모델: ${analysis.model}`,
    });
  }

  private renderNoAnalysisState(container: HTMLElement): void {
    const section = container.createDiv({ cls: 'insights-section empty' });
    section.createEl('p', {
      text: '이 아이템에 대한 분석 결과가 없습니다.',
    });
    section.createEl('p', {
      text: '수정 화면에서 분석을 실행해보세요.',
      cls: 'muted',
    });
  }

  private renderNoteTopicsSection(container: HTMLElement): void {
    const section = container.createDiv({ cls: 'note-topics-section' });
    section.createEl('h3', { text: '📝 영구 노트 주제 추천' });

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
      loadingEl.createSpan({ text: '노트 주제 생성 중...' });
      return;
    }

    const description = container.createEl('p', {
      text: '읽은 내용을 바탕으로 영구 노트로 정리할 주제를 추천받을 수 있습니다.',
    });

    const generateBtn = container.createEl('button', {
      text: '📝 노트 주제 추천 받기',
      cls: 'mod-cta',
    });
    generateBtn.style.marginTop = '10px';

    generateBtn.addEventListener('click', async () => {
      await this.generateNoteTopics(container);
    });
  }

  private async generateNoteTopics(container: HTMLElement): Promise<void> {
    if (!this.plugin.costTracker) {
      new Notice('AI 서비스가 초기화되지 않았습니다.');
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
        this.renderNoteTopics(container);
        new Notice(`${result.topics.length}개의 노트 주제가 추천되었습니다.`);
      } else {
        new Notice(result.error || '노트 주제 생성에 실패했습니다.');
        this.isLoadingTopics = false;
        this.renderGenerateTopicsButton(container);
      }
    } catch (error) {
      new Notice('노트 주제 생성 중 오류가 발생했습니다.');
      console.error('Note topic generation error:', error);
      this.isLoadingTopics = false;
      this.renderGenerateTopicsButton(container);
    }
  }

  private renderNoteTopics(container: HTMLElement): void {
    container.empty();

    for (const topic of this.noteTopics) {
      const topicCard = container.createDiv({ cls: 'note-topic-card' });

      // Title with create button
      const titleRow = topicCard.createDiv({ cls: 'note-topic-title-row' });
      titleRow.createEl('h4', { text: topic.title });

      const createBtn = titleRow.createEl('button', { text: '노트 생성' });
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
        new Notice('같은 이름의 노트가 이미 존재합니다.');
        return;
      }

      await this.createFile(filePath, content);

      // Link to reading item
      this.item.addLinkedNote(filePath);
      await this.plugin.repository.save(this.item);

      new Notice(`노트가 생성되었습니다: ${fileName}`);

      // Open the created note
      await this.app.workspace.openLinkText(filePath, '', true);
    } catch (error) {
      new Notice('노트 생성에 실패했습니다.');
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

  private generateNoteContent(topic: NoteTopic): string {
    const tags = topic.suggestedTags.map(t => `#${t}`).join(' ');
    const sourceLink = this.item.url ? `[${this.item.title}](${this.item.url})` : this.item.title;

    const keyPointsList = topic.keyPoints.map(p => `- ${p}`).join('\n');

    return `---
tags: [${topic.suggestedTags.join(', ')}]
source: "[[Reading Queue]]"
created: ${new Date().toISOString().split('T')[0]}
---

# ${topic.title}

${topic.description}

## 핵심 포인트

${keyPointsList}

## 출처

- ${sourceLink}

## 연결된 생각



`;
  }
}
