import { PluginSettingTab, Setting } from 'obsidian';
import { PriorityLevelType } from '../../core/domain/value-objects/priority-level';
import type ReadingQueuePlugin from '../../main';

export interface ReadingQueueSettings {
  defaultPriority: PriorityLevelType;
  staleDaysThreshold: number;
  showCompletedItems: boolean;
  showAbandonedItems: boolean;
}

export const DEFAULT_SETTINGS: ReadingQueueSettings = {
  defaultPriority: PriorityLevelType.MEDIUM,
  staleDaysThreshold: 30,
  showCompletedItems: false,
  showAbandonedItems: false,
};

export class ReadingQueueSettingTab extends PluginSettingTab {
  plugin: ReadingQueuePlugin;

  constructor(plugin: ReadingQueuePlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Reading Queue Manager 설정' });

    // General Section
    containerEl.createEl('h3', { text: '일반' });

    new Setting(containerEl)
      .setName('기본 우선순위')
      .setDesc('새 아이템 추가 시 기본 우선순위')
      .addDropdown((dropdown) => {
        dropdown
          .addOption(PriorityLevelType.HIGH, '높음')
          .addOption(PriorityLevelType.MEDIUM, '보통')
          .addOption(PriorityLevelType.LOW, '낮음')
          .setValue(this.plugin.settings.defaultPriority)
          .onChange(async (value) => {
            this.plugin.settings.defaultPriority = value as PriorityLevelType;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('오래된 아이템 기준 (일)')
      .setDesc('이 기간 동안 큐에 있는 아이템을 "오래된" 것으로 표시')
      .addText((text) => {
        text
          .setPlaceholder('30')
          .setValue(this.plugin.settings.staleDaysThreshold.toString())
          .onChange(async (value) => {
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed) && parsed > 0) {
              this.plugin.settings.staleDaysThreshold = parsed;
              await this.plugin.saveSettings();
            }
          });
        text.inputEl.type = 'number';
        text.inputEl.min = '1';
        text.inputEl.style.width = '80px';
      });

    // Display Section
    containerEl.createEl('h3', { text: '표시' });

    new Setting(containerEl)
      .setName('완료된 아이템 표시')
      .setDesc('기본 목록에 완료된 아이템도 표시')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.showCompletedItems)
          .onChange(async (value) => {
            this.plugin.settings.showCompletedItems = value;
            await this.plugin.saveSettings();
            this.plugin.refreshView();
          });
      });

    new Setting(containerEl)
      .setName('포기한 아이템 표시')
      .setDesc('기본 목록에 포기한 아이템도 표시')
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.showAbandonedItems)
          .onChange(async (value) => {
            this.plugin.settings.showAbandonedItems = value;
            await this.plugin.saveSettings();
            this.plugin.refreshView();
          });
      });

    // About Section
    containerEl.createEl('h3', { text: '정보' });

    const aboutEl = containerEl.createDiv();
    aboutEl.createEl('p', {
      text: 'Reading Queue Manager v0.1.0',
    });
    aboutEl.createEl('p', {
      text: '읽기 자료를 체계적으로 관리하는 PKM 도구입니다.',
    });
  }
}
