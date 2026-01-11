import { Modal, Setting, Notice } from 'obsidian';
import { ReadingItem } from '../core/domain/entities/reading-item';
import { ContentAnalysis } from '../core/domain/entities/content-analysis';
import { PriorityLevelType } from '../core/domain/value-objects/priority-level';
import { AddReadingItemUseCase, UpdateReadingItemUseCase, AnalyzeUrlContentUseCase } from '../core/application/use-cases';
import { getAIService } from '../core/application/services/ai-service';
import type ReadingQueuePlugin from '../main';

export class AddItemModal extends Modal {
  private plugin: ReadingQueuePlugin;
  private editItem?: ReadingItem;
  private onSave: () => void;

  // Form values
  private title = '';
  private url = '';
  private priority: PriorityLevelType = PriorityLevelType.MEDIUM;
  private estimatedMinutes?: number;
  private tagsInput = '';
  private notes = '';

  // AI Analysis state
  private analysis?: ContentAnalysis;
  private isAnalyzing = false;
  private analyzeButton?: HTMLButtonElement;
  private analysisContainer?: HTMLDivElement;
  private autoAnalyzeTimeout?: ReturnType<typeof setTimeout>;

  // Form input elements (for auto-apply updates)
  private titleInput?: HTMLInputElement;
  private priorityDropdown?: HTMLSelectElement;
  private tagsInputEl?: HTMLInputElement;
  private estimatedMinutesInput?: HTMLInputElement;

  constructor(
    plugin: ReadingQueuePlugin,
    onSave: () => void,
    editItem?: ReadingItem
  ) {
    super(plugin.app);
    this.plugin = plugin;
    this.onSave = onSave;
    this.editItem = editItem;

    // Load existing values for edit mode
    if (editItem) {
      this.title = editItem.title;
      this.url = editItem.url || '';
      this.priority = editItem.priority.getValue();
      this.estimatedMinutes = editItem.estimatedMinutes;
      this.tagsInput = editItem.tags.join(', ');
      this.notes = editItem.notes || '';
    }
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('reading-queue-modal');

    contentEl.createEl('h2', {
      text: this.editItem ? 'Edit Reading Item' : 'Add Reading Item',
    });

    // Title
    new Setting(contentEl)
      .setName('Title')
      .setDesc('Title of the reading material')
      .addText((text) => {
        this.titleInput = text.inputEl;
        text
          .setPlaceholder('e.g., Clean Architecture')
          .setValue(this.title)
          .onChange((value) => {
            this.title = value;
          });
        text.inputEl.style.width = '100%';
      });

    // URL with AI Analyze button
    const urlSetting = new Setting(contentEl)
      .setName('URL')
      .setDesc('Web link (optional)')
      .addText((text) => {
        text
          .setPlaceholder('https://...')
          .setValue(this.url)
          .onChange((value) => {
            this.url = value;
            this.updateAnalyzeButtonState();
            this.scheduleAutoAnalyze();
          });
        text.inputEl.style.width = '100%';
      });

    // AI Analyze button (only visible when AI service is available)
    const aiService = getAIService();
    if (aiService) {
      urlSetting.addButton((button) => {
        this.analyzeButton = button.buttonEl;
        button
          .setIcon('sparkles')
          .setTooltip('Analyze content with AI')
          .onClick(() => this.analyzeUrl());
        button.buttonEl.addClass('reading-queue-analyze-btn');
        this.updateAnalyzeButtonState();
      });
    }

    // AI Analysis results container
    this.analysisContainer = contentEl.createDiv({
      cls: 'reading-queue-analysis-container',
    });
    this.analysisContainer.style.display = 'none';

    // Priority
    new Setting(contentEl)
      .setName('Priority')
      .setDesc('Reading priority')
      .addDropdown((dropdown) => {
        this.priorityDropdown = dropdown.selectEl;
        dropdown
          .addOption(PriorityLevelType.HIGH, '🔴 High')
          .addOption(PriorityLevelType.MEDIUM, '🟡 Medium')
          .addOption(PriorityLevelType.LOW, '🟢 Low')
          .setValue(this.priority)
          .onChange((value) => {
            this.priority = value as PriorityLevelType;
          });
      });

    // Estimated time
    new Setting(contentEl)
      .setName('Estimated Time')
      .setDesc('In minutes (optional)')
      .addText((text) => {
        this.estimatedMinutesInput = text.inputEl;
        text
          .setPlaceholder('30')
          .setValue(this.estimatedMinutes?.toString() || '')
          .onChange((value) => {
            const parsed = parseInt(value, 10);
            this.estimatedMinutes = isNaN(parsed) ? undefined : parsed;
          });
        text.inputEl.type = 'number';
        text.inputEl.min = '1';
        text.inputEl.style.width = '80px';
      });

    // Tags
    new Setting(contentEl)
      .setName('Tags')
      .setDesc('Comma separated (optional)')
      .addText((text) => {
        this.tagsInputEl = text.inputEl;
        text
          .setPlaceholder('development, architecture, clean-code')
          .setValue(this.tagsInput)
          .onChange((value) => {
            this.tagsInput = value;
          });
        text.inputEl.style.width = '100%';
      });

    // Notes
    new Setting(contentEl)
      .setName('Notes')
      .setDesc('Quick notes (optional)')
      .addTextArea((textarea) => {
        textarea
          .setPlaceholder('Notes about this material...')
          .setValue(this.notes)
          .onChange((value) => {
            this.notes = value;
          });
        textarea.inputEl.style.width = '100%';
        textarea.inputEl.rows = 3;
      });

    // Buttons
    const buttonContainer = contentEl.createDiv({
      cls: 'modal-button-container',
    });
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '8px';
    buttonContainer.style.marginTop = '16px';

    const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
    cancelBtn.addEventListener('click', () => this.close());

    const saveBtn = buttonContainer.createEl('button', {
      text: this.editItem ? 'Update' : 'Add',
      cls: 'mod-cta',
    });
    saveBtn.addEventListener('click', () => this.save());
  }

  onClose(): void {
    if (this.autoAnalyzeTimeout) {
      clearTimeout(this.autoAnalyzeTimeout);
    }
    const { contentEl } = this;
    contentEl.empty();
  }

  private async save(): Promise<void> {
    // Validation
    if (!this.title.trim()) {
      new Notice('Please enter a title.');
      return;
    }

    const tags = this.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (this.editItem) {
        // Update existing item
        const useCase = new UpdateReadingItemUseCase(this.plugin.repository);
        const result = await useCase.execute({
          itemId: this.editItem.id,
          title: this.title.trim(),
          url: this.url.trim() || undefined,
          priority: this.priority,
          estimatedMinutes: this.estimatedMinutes,
          tags,
          notes: this.notes.trim() || undefined,
          analysis: this.analysis,
        });

        if (result.success) {
          new Notice('Item updated successfully.');
          this.onSave();
          this.close();
        } else {
          new Notice(result.error || 'Failed to update item.');
        }
      } else {
        // Add new item
        const useCase = new AddReadingItemUseCase(this.plugin.repository);
        const result = await useCase.execute({
          title: this.title.trim(),
          url: this.url.trim() || undefined,
          priority: this.priority,
          estimatedMinutes: this.estimatedMinutes,
          tags,
          notes: this.notes.trim() || undefined,
          analysis: this.analysis,
        });

        if (result.success) {
          new Notice('Item added successfully.');
          this.onSave();
          this.close();
        } else {
          new Notice(result.error || 'Failed to add item.');
        }
      }
    } catch (error) {
      new Notice('An error occurred.');
      console.error(error);
    }
  }

  private updateAnalyzeButtonState(): void {
    if (!this.analyzeButton) return;

    const hasValidUrl = this.url.trim().startsWith('http');
    this.analyzeButton.disabled = !hasValidUrl || this.isAnalyzing;

    if (this.isAnalyzing) {
      this.analyzeButton.addClass('is-loading');
    } else {
      this.analyzeButton.removeClass('is-loading');
    }
  }

  private scheduleAutoAnalyze(): void {
    // Clear existing timeout
    if (this.autoAnalyzeTimeout) {
      clearTimeout(this.autoAnalyzeTimeout);
      this.autoAnalyzeTimeout = undefined;
    }

    // Check if auto-analyze is enabled
    const aiSettings = this.plugin.settings.ai;
    if (!aiSettings.autoAnalyzeOnAdd) return;

    // Only auto-analyze for new items with valid URLs
    if (this.editItem) return;
    if (!this.url.trim().startsWith('http')) return;

    // Debounce: wait 1.5 seconds after typing stops
    this.autoAnalyzeTimeout = setTimeout(() => {
      this.analyzeUrl();
    }, 1500);
  }

  private async analyzeUrl(): Promise<void> {
    if (this.isAnalyzing || !this.url.trim()) return;

    const costTracker = this.plugin.costTracker;
    if (!costTracker) {
      new Notice('AI service not initialized.');
      return;
    }

    this.isAnalyzing = true;
    this.updateAnalyzeButtonState();
    new Notice('Analyzing content...');

    try {
      const useCase = new AnalyzeUrlContentUseCase(costTracker);
      const result = await useCase.execute({
        itemId: 'temp-' + Date.now(),
        url: this.url.trim(),
        existingTags: this.tagsInput.split(',').map(t => t.trim()).filter(t => t),
      });

      if (result.success && result.analysis) {
        this.analysis = result.analysis;
        this.renderAnalysisResults();
        this.autoApplySuggestions();
        new Notice('Analysis complete!');
      } else {
        new Notice(result.error || 'Analysis failed.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error during analysis';
      new Notice(message);
      console.error('Analysis error:', error);
    } finally {
      this.isAnalyzing = false;
      this.updateAnalyzeButtonState();
    }
  }

  private renderAnalysisResults(): void {
    if (!this.analysisContainer || !this.analysis) return;

    this.analysisContainer.empty();
    this.analysisContainer.style.display = 'block';
    this.analysisContainer.style.padding = '12px';
    this.analysisContainer.style.marginBottom = '12px';
    this.analysisContainer.style.border = '1px solid var(--background-modifier-border)';
    this.analysisContainer.style.borderRadius = '8px';
    this.analysisContainer.style.backgroundColor = 'var(--background-secondary)';

    // Header
    const header = this.analysisContainer.createDiv({ cls: 'analysis-header' });
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '12px';

    header.createEl('h4', { text: '✨ AI Analysis Results' }).style.margin = '0';

    // Apply all button
    const applyAllBtn = header.createEl('button', {
      text: 'Apply All',
      cls: 'mod-cta',
    });
    applyAllBtn.style.fontSize = '12px';
    applyAllBtn.style.padding = '4px 8px';
    applyAllBtn.addEventListener('click', () => this.applyAllSuggestions());

    // Title suggestion
    if (this.analysis.title && this.analysis.title !== this.title) {
      this.renderSuggestionItem('Title', this.analysis.title, () => {
        this.title = this.analysis!.title!;
        new Notice('Title applied.');
      });
    }

    // Summary
    const summarySection = this.analysisContainer.createDiv({ cls: 'analysis-section' });
    summarySection.createEl('strong', { text: '📝 Summary' });
    summarySection.createEl('p', { text: this.analysis.summary }).style.margin = '4px 0 12px 0';

    // Key insights
    if (this.analysis.keyInsights.length > 0) {
      const insightsSection = this.analysisContainer.createDiv({ cls: 'analysis-section' });
      insightsSection.createEl('strong', { text: '💡 Key Insights' });
      const insightsList = insightsSection.createEl('ul');
      insightsList.style.margin = '4px 0 12px 0';
      insightsList.style.paddingLeft = '20px';
      for (const insight of this.analysis.keyInsights) {
        insightsList.createEl('li', { text: insight });
      }
    }

    // Suggested tags
    if (this.analysis.suggestedTags.length > 0) {
      this.renderSuggestionItem(
        'Tags',
        this.analysis.suggestedTags.join(', '),
        () => this.applySuggestedTags()
      );
    }

    // Suggested priority
    if (this.analysis.suggestedPriority) {
      const priorityLabels: Record<string, string> = {
        high: '🔴 High',
        medium: '🟡 Medium',
        low: '🟢 Low',
      };
      this.renderSuggestionItem(
        'Priority',
        priorityLabels[this.analysis.suggestedPriority] || this.analysis.suggestedPriority,
        () => this.applySuggestedPriority()
      );
    }

    // Estimated reading time
    if (this.analysis.estimatedReadingTime) {
      this.renderSuggestionItem(
        'Estimated Time',
        `${this.analysis.estimatedReadingTime} min`,
        () => this.applySuggestedReadingTime()
      );
    }
  }

  private renderSuggestionItem(label: string, value: string, onApply: () => void): void {
    if (!this.analysisContainer) return;

    const item = this.analysisContainer.createDiv({ cls: 'suggestion-item' });
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.style.padding = '6px 0';
    item.style.borderBottom = '1px solid var(--background-modifier-border)';

    const labelSpan = item.createSpan({ cls: 'suggestion-label' });
    labelSpan.createEl('strong', { text: label + ': ' });
    labelSpan.createSpan({ text: value });

    const applyBtn = item.createEl('button', { text: 'Apply' });
    applyBtn.style.fontSize = '11px';
    applyBtn.style.padding = '2px 6px';
    applyBtn.addEventListener('click', () => {
      onApply();
      item.style.opacity = '0.5';
      applyBtn.disabled = true;
    });
  }

  private autoApplySuggestions(): void {
    if (!this.analysis) return;

    const aiSettings = this.plugin.settings.ai;
    let applied: string[] = [];

    // Auto-apply title if empty
    if (this.analysis.title && !this.title.trim()) {
      this.title = this.analysis.title;
      if (this.titleInput) {
        this.titleInput.value = this.title;
      }
      applied.push('Title');
    }

    // Auto-apply tags if setting enabled
    if (aiSettings.autoSuggestTags && this.analysis.suggestedTags.length > 0) {
      this.applySuggestedTags(false);
      applied.push('Tags');
    }

    // Auto-apply priority if setting enabled
    if (aiSettings.autoSuggestPriority && this.analysis.suggestedPriority) {
      this.applySuggestedPriority(false);
      applied.push('Priority');
    }

    // Always auto-apply reading time if available and not set
    if (this.analysis.estimatedReadingTime && !this.estimatedMinutes) {
      this.applySuggestedReadingTime(false);
      applied.push('Estimated Time');
    }

    if (applied.length > 0) {
      new Notice(`Auto-applied: ${applied.join(', ')}`);
    }
  }

  private applyAllSuggestions(): void {
    if (!this.analysis) return;

    if (this.analysis.title) {
      this.title = this.analysis.title;
      if (this.titleInput) {
        this.titleInput.value = this.title;
      }
    }
    this.applySuggestedTags(true);
    this.applySuggestedPriority(true);
    this.applySuggestedReadingTime(true);

    new Notice('All suggestions applied.');

    // Re-render to show applied state
    this.renderAnalysisResults();
  }

  private applySuggestedTags(showNotice = true): void {
    if (!this.analysis) return;

    const existingTags = this.tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t);

    const newTags = [...new Set([...existingTags, ...this.analysis.suggestedTags])];
    this.tagsInput = newTags.join(', ');

    // Update UI
    if (this.tagsInputEl) {
      this.tagsInputEl.value = this.tagsInput;
    }

    if (showNotice) {
      new Notice('Tags applied.');
    }
  }

  private applySuggestedPriority(showNotice = true): void {
    if (!this.analysis?.suggestedPriority) return;
    this.priority = this.analysis.suggestedPriority as PriorityLevelType;

    // Update UI
    if (this.priorityDropdown) {
      this.priorityDropdown.value = this.priority;
    }

    if (showNotice) {
      new Notice('Priority applied.');
    }
  }

  private applySuggestedReadingTime(showNotice = true): void {
    if (!this.analysis?.estimatedReadingTime) return;
    this.estimatedMinutes = this.analysis.estimatedReadingTime;

    // Update UI
    if (this.estimatedMinutesInput) {
      this.estimatedMinutesInput.value = this.estimatedMinutes.toString();
    }

    if (showNotice) {
      new Notice('Estimated time applied.');
    }
  }
}
