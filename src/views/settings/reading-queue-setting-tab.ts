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
  defaultLanguage: 'en',
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

    containerEl.createEl('h2', { text: 'Reading Queue Manager Settings' });

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
    containerEl.createEl('h3', { text: 'General' });

    new Setting(containerEl)
      .setName('Default Priority')
      .setDesc('Default priority when adding new items')
      .addDropdown((dropdown) => {
        dropdown
          .addOption(PriorityLevelType.HIGH, 'High')
          .addOption(PriorityLevelType.MEDIUM, 'Medium')
          .addOption(PriorityLevelType.LOW, 'Low')
          .setValue(this.plugin.settings.defaultPriority)
          .onChange(async (value) => {
            this.plugin.settings.defaultPriority = value as PriorityLevelType;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Stale Item Threshold (days)')
      .setDesc('Mark items in queue for this many days as "stale"')
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
      .setName('Note Creation Folder')
      .setDesc('Folder path for permanent notes (leave empty for vault root)')
      .addDropdown((dropdown) => {
        // Add empty option for vault root
        dropdown.addOption('', '/ (Vault Root)');

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
    containerEl.createEl('h3', { text: 'Display' });

    new Setting(containerEl)
      .setName('Show Completed Items')
      .setDesc('Show completed items in the default list')
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
      .setName('Show Abandoned Items')
      .setDesc('Show abandoned items in the default list')
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
    containerEl.createEl('h3', { text: 'AI Settings' });

    const aiSettings = this.plugin.settings.ai;

    // Provider Selection
    new Setting(containerEl)
      .setName('AI Provider')
      .setDesc('Select the LLM provider to use')
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
      .setDesc(`Enter your ${providerConfig.name} API key`)
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
          .setButtonText('Test')
          .onClick(async () => {
            const aiService = getAIService();
            if (!aiService) {
              new Notice('AI service not initialized.');
              return;
            }
            button.setButtonText('Testing...');
            button.setDisabled(true);
            try {
              const isValid = await aiService.testCurrentApiKey();
              if (isValid) {
                new Notice('API key is valid!');
              } else {
                new Notice('API key is invalid.');
              }
            } catch (error) {
              new Notice(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
              button.setButtonText('Test');
              button.setDisabled(false);
            }
          });
      });

    // Model Selection for current provider
    const models = getModelsByProvider(currentProvider);
    new Setting(containerEl)
      .setName('Model')
      .setDesc('Select the model to use')
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
    containerEl.createEl('h4', { text: 'Auto Analysis' });

    new Setting(containerEl)
      .setName('Auto-analyze on URL Add')
      .setDesc('Automatically analyze content when adding a new URL')
      .addToggle((toggle) => {
        toggle
          .setValue(aiSettings.autoAnalyzeOnAdd)
          .onChange(async (value) => {
            this.plugin.settings.ai.autoAnalyzeOnAdd = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Auto-suggest Tags')
      .setDesc('Automatically suggest tags based on analysis results')
      .addToggle((toggle) => {
        toggle
          .setValue(aiSettings.autoSuggestTags)
          .onChange(async (value) => {
            this.plugin.settings.ai.autoSuggestTags = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Auto-suggest Priority')
      .setDesc('Suggest priority based on content and existing notes')
      .addToggle((toggle) => {
        toggle
          .setValue(aiSettings.autoSuggestPriority)
          .onChange(async (value) => {
            this.plugin.settings.ai.autoSuggestPriority = value;
            await this.plugin.saveSettings();
          });
      });

    // Budget Settings
    containerEl.createEl('h4', { text: 'Budget Management' });

    new Setting(containerEl)
      .setName('Monthly Budget Limit ($)')
      .setDesc('Set to 0 for no limit')
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
        text: `This month's usage: $${currentSpend.toFixed(4)}${budgetLimit ? ` / $${budgetLimit.toFixed(2)}` : ''}`,
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
    containerEl.createEl('h3', { text: 'About' });

    const aboutEl = containerEl.createDiv();
    aboutEl.createEl('p', {
      text: `Reading Queue Manager v${this.plugin.manifest.version}`,
    });
    aboutEl.createEl('p', {
      text: 'A PKM tool for systematically managing reading materials with AI-powered analysis.',
    });
  }
}
