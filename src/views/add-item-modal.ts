import { Modal, Setting, Notice } from 'obsidian';
import { ReadingItem } from '../core/domain/entities/reading-item';
import { PriorityLevelType } from '../core/domain/value-objects/priority-level';
import { AddReadingItemUseCase, UpdateReadingItemUseCase } from '../core/application/use-cases';
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
        text
          .setPlaceholder('예: Clean Architecture')
          .setValue(this.title)
          .onChange((value) => {
            this.title = value;
          });
        text.inputEl.style.width = '100%';
      });

    // URL
    new Setting(contentEl)
      .setName('URL')
      .setDesc('웹 링크 (선택)')
      .addText((text) => {
        text
          .setPlaceholder('https://...')
          .setValue(this.url)
          .onChange((value) => {
            this.url = value;
          });
        text.inputEl.style.width = '100%';
      });

    // Priority
    new Setting(contentEl)
      .setName('우선순위')
      .setDesc('읽기 우선순위')
      .addDropdown((dropdown) => {
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
}
