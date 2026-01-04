import { PluginSettingTab, Setting, Notice, TFolder } from 'obsidian';
import { PriorityLevelType } from '../../core/domain/value-objects/priority-level';
import type { AIProviderType, AISettings } from '../../core/domain/interfaces/llm-provider';
import { AI_PROVIDERS, getModelsByProvider } from '../../core/domain/constants/model-configs';
import { getAIService } from '../../core/application/services/ai-service';
import type ReadingQueuePlugin from '../../main';

export interface ReadingQueueSettings {
  defaultPriority: PriorityLevelType;
  staleDaysThreshold: number;
  showCompletedItems: boolean;
  showAbandonedItems: boolean;
  // Note creation settings
  defaultNoteFolder: string;
  // AI Settings
  ai: AISettings;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'claude',
  apiKeys: {},
  models: {
    claude: 'claude-3-5-haiku-20241022',
    gemini: 'gemini-2.0-flash',
    openai: 'gpt-4o-mini',
    grok: 'grok-4-1-fast-non-reasoning',
  },
  featureModels: {},
  defaultLanguage: 'ko',
  budgetLimit: 5.0,
  autoAnalyzeOnAdd: true,
  autoSuggestTags: true,
  autoSuggestPriority: false,
};

export const DEFAULT_SETTINGS: ReadingQueueSettings = {
  defaultPriority: PriorityLevelType.MEDIUM,
  staleDaysThreshold: 30,
  showCompletedItems: false,
  showAbandonedItems: false,
  defaultNoteFolder: '',
  ai: DEFAULT_AI_SETTINGS,
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
    this.displayGeneralSection(containerEl);

    // Display Section
    this.displayDisplaySection(containerEl);

    // AI Section
    this.displayAISection(containerEl);

    // About Section
    this.displayAboutSection(containerEl);
  }

  private displayGeneralSection(containerEl: HTMLElement): void {
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

    // Note folder setting
    new Setting(containerEl)
      .setName('노트 생성 폴더')
      .setDesc('영구 노트가 생성될 폴더 경로 (비워두면 볼트 루트)')
      .addDropdown((dropdown) => {
        // Add empty option for vault root
        dropdown.addOption('', '/ (볼트 루트)');

        // Get all folders in vault
        const folders = this.plugin.app.vault.getAllLoadedFiles()
          .filter((f): f is TFolder => f instanceof TFolder)
          .map(f => f.path)
          .sort();

        for (const folder of folders) {
          dropdown.addOption(folder, folder);
        }

        dropdown
          .setValue(this.plugin.settings.defaultNoteFolder)
          .onChange(async (value) => {
            this.plugin.settings.defaultNoteFolder = value;
            await this.plugin.saveSettings();
          });
      });
  }

  private displayDisplaySection(containerEl: HTMLElement): void {
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
  }

  private displayAISection(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: 'AI 설정' });

    const aiSettings = this.plugin.settings.ai;

    // Provider Selection
    new Setting(containerEl)
      .setName('AI 제공자')
      .setDesc('사용할 LLM 제공자를 선택하세요')
      .addDropdown((dropdown) => {
        for (const [id, config] of Object.entries(AI_PROVIDERS)) {
          dropdown.addOption(id, config.displayName);
        }
        dropdown
          .setValue(aiSettings.provider)
          .onChange(async (value) => {
            this.plugin.settings.ai.provider = value as AIProviderType;
            await this.plugin.saveSettings();
            this.display(); // Refresh to update model dropdown
          });
      });

    // API Key for current provider
    const currentProvider = aiSettings.provider;
    const providerConfig = AI_PROVIDERS[currentProvider];

    new Setting(containerEl)
      .setName(`${providerConfig.displayName} API Key`)
      .setDesc(`${providerConfig.name}의 API 키를 입력하세요`)
      .addText((text) => {
        text
          .setPlaceholder('API Key')
          .setValue(aiSettings.apiKeys[currentProvider] || '')
          .onChange(async (value) => {
            this.plugin.settings.ai.apiKeys[currentProvider] = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.type = 'password';
        text.inputEl.style.width = '300px';
      })
      .addButton((button) => {
        button
          .setButtonText('테스트')
          .onClick(async () => {
            const aiService = getAIService();
            if (!aiService) {
              new Notice('AI 서비스가 초기화되지 않았습니다.');
              return;
            }
            button.setButtonText('테스트 중...');
            button.setDisabled(true);
            try {
              const isValid = await aiService.testCurrentApiKey();
              if (isValid) {
                new Notice('API 키가 유효합니다!');
              } else {
                new Notice('API 키가 유효하지 않습니다.');
              }
            } catch (error) {
              new Notice(`테스트 실패: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
              button.setButtonText('테스트');
              button.setDisabled(false);
            }
          });
      });

    // Model Selection for current provider
    const models = getModelsByProvider(currentProvider);
    new Setting(containerEl)
      .setName('모델')
      .setDesc('사용할 모델을 선택하세요')
      .addDropdown((dropdown) => {
        for (const model of models) {
          dropdown.addOption(model.id, `${model.displayName} (${model.tier})`);
        }
        dropdown
          .setValue(aiSettings.models[currentProvider])
          .onChange(async (value) => {
            this.plugin.settings.ai.models[currentProvider] = value;
            await this.plugin.saveSettings();
          });
      });

    // Auto Analysis Settings
    containerEl.createEl('h4', { text: '자동 분석' });

    new Setting(containerEl)
      .setName('URL 추가 시 자동 분석')
      .setDesc('새 URL을 추가할 때 자동으로 콘텐츠를 분석합니다')
      .addToggle((toggle) => {
        toggle
          .setValue(aiSettings.autoAnalyzeOnAdd)
          .onChange(async (value) => {
            this.plugin.settings.ai.autoAnalyzeOnAdd = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('태그 자동 추천')
      .setDesc('분석 결과를 기반으로 태그를 자동으로 추천합니다')
      .addToggle((toggle) => {
        toggle
          .setValue(aiSettings.autoSuggestTags)
          .onChange(async (value) => {
            this.plugin.settings.ai.autoSuggestTags = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('우선순위 자동 추천')
      .setDesc('콘텐츠와 기존 노트를 기반으로 우선순위를 추천합니다')
      .addToggle((toggle) => {
        toggle
          .setValue(aiSettings.autoSuggestPriority)
          .onChange(async (value) => {
            this.plugin.settings.ai.autoSuggestPriority = value;
            await this.plugin.saveSettings();
          });
      });

    // Budget Settings
    containerEl.createEl('h4', { text: '예산 관리' });

    new Setting(containerEl)
      .setName('월간 예산 한도 ($)')
      .setDesc('0으로 설정하면 한도가 없습니다')
      .addText((text) => {
        text
          .setPlaceholder('5.00')
          .setValue(aiSettings.budgetLimit?.toString() || '')
          .onChange(async (value) => {
            const parsed = parseFloat(value);
            if (!isNaN(parsed) && parsed >= 0) {
              this.plugin.settings.ai.budgetLimit = parsed > 0 ? parsed : undefined;
              await this.plugin.saveSettings();
            }
          });
        text.inputEl.type = 'number';
        text.inputEl.step = '0.01';
        text.inputEl.min = '0';
        text.inputEl.style.width = '100px';
      });

    // Cost Display
    const costTracker = this.plugin.costTracker;
    if (costTracker) {
      const currentSpend = costTracker.getCurrentMonthSpend();
      const budgetLimit = aiSettings.budgetLimit;
      const costEl = containerEl.createDiv({ cls: 'rq-cost-display' });
      costEl.createEl('p', {
        text: `이번 달 사용량: $${currentSpend.toFixed(4)}${budgetLimit ? ` / $${budgetLimit.toFixed(2)}` : ''}`,
      });
      if (budgetLimit) {
        const percentage = (currentSpend / budgetLimit) * 100;
        const progressEl = costEl.createDiv({ cls: 'rq-budget-progress' });
        progressEl.style.cssText = `
          width: 100%;
          height: 8px;
          background: var(--background-modifier-border);
          border-radius: 4px;
          overflow: hidden;
        `;
        const barEl = progressEl.createDiv();
        barEl.style.cssText = `
          width: ${Math.min(percentage, 100)}%;
          height: 100%;
          background: ${percentage > 80 ? 'var(--text-error)' : 'var(--interactive-accent)'};
          transition: width 0.3s ease;
        `;
      }
    }
  }

  private displayAboutSection(containerEl: HTMLElement): void {
    containerEl.createEl('h3', { text: '정보' });

    const aboutEl = containerEl.createDiv();
    aboutEl.createEl('p', {
      text: 'Reading Queue Manager v0.2.4',
    });
    aboutEl.createEl('p', {
      text: '읽기 자료를 체계적으로 관리하고 AI 기반 분석을 지원하는 PKM 도구입니다.',
    });
  }
}
