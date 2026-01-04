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

    // 수정 모드일 경우 기존 값 로드
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
      text: this.editItem ? '읽기 아이템 수정' : '읽기 아이템 추가',
    });

    // Title
    new Setting(contentEl)
      .setName('제목')
      .setDesc('읽을 자료의 제목')
      .addText((text) => {
        this.titleInput = text.inputEl;
        text
          .setPlaceholder('예: Clean Architecture')
          .setValue(this.title)
          .onChange((value) => {
            this.title = value;
          });
        text.inputEl.style.width = '100%';
      });

    // URL with AI Analyze button
    const urlSetting = new Setting(contentEl)
      .setName('URL')
      .setDesc('웹 링크 (선택)')
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
          .setTooltip('AI로 콘텐츠 분석')
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
      .setName('우선순위')
      .setDesc('읽기 우선순위')
      .addDropdown((dropdown) => {
        this.priorityDropdown = dropdown.selectEl;
        dropdown
          .addOption(PriorityLevelType.HIGH, '🔴 높음')
          .addOption(PriorityLevelType.MEDIUM, '🟡 보통')
          .addOption(PriorityLevelType.LOW, '🟢 낮음')
          .setValue(this.priority)
          .onChange((value) => {
            this.priority = value as PriorityLevelType;
          });
      });

    // Estimated time
    new Setting(contentEl)
      .setName('예상 시간')
      .setDesc('분 단위 (선택)')
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
      .setName('태그')
      .setDesc('쉼표로 구분 (선택)')
      .addText((text) => {
        this.tagsInputEl = text.inputEl;
        text
          .setPlaceholder('개발, 아키텍처, 클린코드')
          .setValue(this.tagsInput)
          .onChange((value) => {
            this.tagsInput = value;
          });
        text.inputEl.style.width = '100%';
      });

    // Notes
    new Setting(contentEl)
      .setName('메모')
      .setDesc('간단한 메모 (선택)')
      .addTextArea((textarea) => {
        textarea
          .setPlaceholder('이 자료에 대한 메모...')
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

    const cancelBtn = buttonContainer.createEl('button', { text: '취소' });
    cancelBtn.addEventListener('click', () => this.close());

    const saveBtn = buttonContainer.createEl('button', {
      text: this.editItem ? '수정' : '추가',
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
    // 유효성 검사
    if (!this.title.trim()) {
      new Notice('제목을 입력해주세요.');
      return;
    }

    const tags = this.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (this.editItem) {
        // 수정
        const useCase = new UpdateReadingItemUseCase(this.plugin.repository);
        const result = await useCase.execute({
          itemId: this.editItem.id,
          title: this.title.trim(),
          url: this.url.trim() || undefined,
          priority: this.priority,
          estimatedMinutes: this.estimatedMinutes,
          tags,
          notes: this.notes.trim() || undefined,
        });

        if (result.success) {
          new Notice('아이템이 수정되었습니다.');
          this.onSave();
          this.close();
        } else {
          new Notice(result.error || '수정에 실패했습니다.');
        }
      } else {
        // 추가
        const useCase = new AddReadingItemUseCase(this.plugin.repository);
        const result = await useCase.execute({
          title: this.title.trim(),
          url: this.url.trim() || undefined,
          priority: this.priority,
          estimatedMinutes: this.estimatedMinutes,
          tags,
          notes: this.notes.trim() || undefined,
        });

        if (result.success) {
          new Notice('아이템이 추가되었습니다.');
          this.onSave();
          this.close();
        } else {
          new Notice(result.error || '추가에 실패했습니다.');
        }
      }
    } catch (error) {
      new Notice('오류가 발생했습니다.');
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
      new Notice('AI 서비스가 초기화되지 않았습니다.');
      return;
    }

    this.isAnalyzing = true;
    this.updateAnalyzeButtonState();
    new Notice('콘텐츠 분석 중...');

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
        new Notice('분석 완료!');
      } else {
        new Notice(result.error || '분석에 실패했습니다.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '분석 중 오류 발생';
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

    header.createEl('h4', { text: '✨ AI 분석 결과' }).style.margin = '0';

    // Apply all button
    const applyAllBtn = header.createEl('button', {
      text: '전체 적용',
      cls: 'mod-cta',
    });
    applyAllBtn.style.fontSize = '12px';
    applyAllBtn.style.padding = '4px 8px';
    applyAllBtn.addEventListener('click', () => this.applyAllSuggestions());

    // Title suggestion
    if (this.analysis.title && this.analysis.title !== this.title) {
      this.renderSuggestionItem('제목', this.analysis.title, () => {
        this.title = this.analysis!.title!;
        new Notice('제목이 적용되었습니다.');
      });
    }

    // Summary
    const summarySection = this.analysisContainer.createDiv({ cls: 'analysis-section' });
    summarySection.createEl('strong', { text: '📝 요약' });
    summarySection.createEl('p', { text: this.analysis.summary }).style.margin = '4px 0 12px 0';

    // Key insights
    if (this.analysis.keyInsights.length > 0) {
      const insightsSection = this.analysisContainer.createDiv({ cls: 'analysis-section' });
      insightsSection.createEl('strong', { text: '💡 핵심 인사이트' });
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
        '태그',
        this.analysis.suggestedTags.join(', '),
        () => this.applySuggestedTags()
      );
    }

    // Suggested priority
    if (this.analysis.suggestedPriority) {
      const priorityLabels: Record<string, string> = {
        high: '🔴 높음',
        medium: '🟡 보통',
        low: '🟢 낮음',
      };
      this.renderSuggestionItem(
        '우선순위',
        priorityLabels[this.analysis.suggestedPriority] || this.analysis.suggestedPriority,
        () => this.applySuggestedPriority()
      );
    }

    // Estimated reading time
    if (this.analysis.estimatedReadingTime) {
      this.renderSuggestionItem(
        '예상 시간',
        `${this.analysis.estimatedReadingTime}분`,
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

    const applyBtn = item.createEl('button', { text: '적용' });
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
      applied.push('제목');
    }

    // Auto-apply tags if setting enabled
    if (aiSettings.autoSuggestTags && this.analysis.suggestedTags.length > 0) {
      this.applySuggestedTags(false);
      applied.push('태그');
    }

    // Auto-apply priority if setting enabled
    if (aiSettings.autoSuggestPriority && this.analysis.suggestedPriority) {
      this.applySuggestedPriority(false);
      applied.push('우선순위');
    }

    // Always auto-apply reading time if available and not set
    if (this.analysis.estimatedReadingTime && !this.estimatedMinutes) {
      this.applySuggestedReadingTime(false);
      applied.push('예상 시간');
    }

    if (applied.length > 0) {
      new Notice(`자동 적용됨: ${applied.join(', ')}`);
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

    new Notice('모든 제안이 적용되었습니다.');

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
      new Notice('태그가 적용되었습니다.');
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
      new Notice('우선순위가 적용되었습니다.');
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
      new Notice('예상 시간이 적용되었습니다.');
    }
  }
}
