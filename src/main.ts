import { Plugin, WorkspaceLeaf } from 'obsidian';
import { ReadingItem } from './core/domain/entities/reading-item';
import { IReadingQueueRepository } from './core/domain/interfaces/reading-queue-repository.interface';
import { ObsidianReadingQueueRepository } from './core/adapters/obsidian/reading-queue-repository';
import {
  ClaudeProvider,
  OpenAIProvider,
  GeminiProvider,
  GrokProvider,
} from './core/adapters/llm';
import {
  initializeAIService,
  updateAIServiceSettings,
  resetAIService,
  getAIService,
} from './core/application/services/ai-service';
import { CostTracker } from './core/application/services/cost-tracker';
import { getEventEmitter, resetEventEmitter } from './core/application/services/event-emitter';
import {
  ReadingQueueView,
  VIEW_TYPE_READING_QUEUE,
  AddItemModal,
  ReadingQueueSettingTab,
  ReadingQueueSettings,
  DEFAULT_SETTINGS,
} from './views';

export default class ReadingQueuePlugin extends Plugin {
  settings!: ReadingQueueSettings;
  repository!: IReadingQueueRepository;
  costTracker!: CostTracker;
  private _repositoryImpl!: ObsidianReadingQueueRepository;

  async onload(): Promise<void> {
    console.log('Loading Reading Queue Manager plugin');

    // Settings 로드
    await this.loadSettings();

    // Repository 초기화
    this._repositoryImpl = new ObsidianReadingQueueRepository(this);
    this.repository = this._repositoryImpl;
    await this._repositoryImpl.load();

    // AI Service 초기화
    this.initializeAIServices();

    // View 등록
    this.registerView(
      VIEW_TYPE_READING_QUEUE,
      (leaf) => new ReadingQueueView(leaf, this)
    );

    // Ribbon 아이콘 (list-checks: 체크리스트 아이콘으로 다른 플러그인과 구분)
    this.addRibbonIcon('list-checks', 'Reading Queue', () => {
      this.activateView();
    });

    // Commands
    this.addCommand({
      id: 'open-reading-queue',
      name: 'Open Reading Queue',
      callback: () => {
        this.activateView();
      },
    });

    this.addCommand({
      id: 'add-reading-item',
      name: 'Add Reading Item',
      callback: () => {
        this.showAddItemModal();
      },
    });

    this.addCommand({
      id: 'add-reading-item-from-clipboard',
      name: 'Add Reading Item from Clipboard',
      callback: async () => {
        await this.addFromClipboard();
      },
    });

    // Settings Tab
    this.addSettingTab(new ReadingQueueSettingTab(this));

    // 레이아웃 준비 완료 후 사이드바 뷰 활성화 (옵션)
    this.app.workspace.onLayoutReady(() => {
      // 자동으로 열고 싶으면 주석 해제
      // this.activateView();
    });
  }

  async onunload(): Promise<void> {
    console.log('Unloading Reading Queue Manager plugin');

    // Cleanup AI services
    resetAIService();
    resetEventEmitter();
  }

  private initializeAIServices(): void {
    // Initialize EventEmitter
    const emitter = getEventEmitter();

    // Initialize CostTracker
    this.costTracker = new CostTracker(
      this.settings.ai.budgetLimit,
      emitter
    );

    // Initialize AI Service with providers
    const aiService = initializeAIService(this.settings.ai);

    // Register all LLM providers
    aiService.registerProvider(new ClaudeProvider());
    aiService.registerProvider(new OpenAIProvider());
    aiService.registerProvider(new GeminiProvider());
    aiService.registerProvider(new GrokProvider());

    console.log('AI services initialized');
  }

  async loadSettings(): Promise<void> {
    const loaded = await this.loadData();

    // Start with defaults (deep copy to prevent mutation)
    this.settings = {
      ...DEFAULT_SETTINGS,
      ai: {
        ...DEFAULT_SETTINGS.ai,
        apiKeys: { ...DEFAULT_SETTINGS.ai.apiKeys },
        models: { ...DEFAULT_SETTINGS.ai.models },
        featureModels: { ...DEFAULT_SETTINGS.ai.featureModels },
      },
    };

    if (loaded) {
      // Merge top-level primitive values
      if (loaded.defaultPriority !== undefined) this.settings.defaultPriority = loaded.defaultPriority;
      if (loaded.staleDaysThreshold !== undefined) this.settings.staleDaysThreshold = loaded.staleDaysThreshold;
      if (loaded.showCompletedItems !== undefined) this.settings.showCompletedItems = loaded.showCompletedItems;
      if (loaded.showAbandonedItems !== undefined) this.settings.showAbandonedItems = loaded.showAbandonedItems;
      if (loaded.defaultNoteFolder !== undefined) this.settings.defaultNoteFolder = loaded.defaultNoteFolder;

      // Deep merge AI settings
      if (loaded.ai) {
        // Merge primitive AI settings
        if (loaded.ai.provider !== undefined) this.settings.ai.provider = loaded.ai.provider;
        if (loaded.ai.defaultLanguage !== undefined) this.settings.ai.defaultLanguage = loaded.ai.defaultLanguage;
        if (loaded.ai.budgetLimit !== undefined) this.settings.ai.budgetLimit = loaded.ai.budgetLimit;
        if (loaded.ai.autoAnalyzeOnAdd !== undefined) this.settings.ai.autoAnalyzeOnAdd = loaded.ai.autoAnalyzeOnAdd;
        if (loaded.ai.autoSuggestTags !== undefined) this.settings.ai.autoSuggestTags = loaded.ai.autoSuggestTags;
        if (loaded.ai.autoSuggestPriority !== undefined) this.settings.ai.autoSuggestPriority = loaded.ai.autoSuggestPriority;

        // Deep merge nested objects (preserve user values while adding new defaults)
        if (loaded.ai.apiKeys) {
          this.settings.ai.apiKeys = { ...this.settings.ai.apiKeys, ...loaded.ai.apiKeys };
        }
        if (loaded.ai.models) {
          this.settings.ai.models = { ...this.settings.ai.models, ...loaded.ai.models };
        }
        if (loaded.ai.featureModels) {
          this.settings.ai.featureModels = { ...this.settings.ai.featureModels, ...loaded.ai.featureModels };
        }
      }
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);

    // Update AI service with new settings
    updateAIServiceSettings(this.settings.ai);

    // Update cost tracker budget
    if (this.costTracker) {
      this.costTracker.setBudgetLimit(this.settings.ai.budgetLimit);
    }
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;

    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_READING_QUEUE);

    if (leaves.length > 0) {
      // View already open
      leaf = leaves[0];
    } else {
      // Create new leaf in right sidebar
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_READING_QUEUE,
          active: true,
        });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  showAddItemModal(): void {
    const modal = new AddItemModal(this, async () => {
      await this.activateView(); // 아이템 추가 후 자동으로 Reading Queue 패널 열기
      this.refreshView();
    });
    modal.open();
  }

  showEditItemModal(item: ReadingItem): void {
    const modal = new AddItemModal(
      this,
      () => {
        this.refreshView();
      },
      item
    );
    modal.open();
  }

  async addFromClipboard(): Promise<void> {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const trimmed = clipboardText.trim();

      if (!trimmed) {
        return;
      }

      // URL 형식인지 확인
      const isUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://');

      const modal = new AddItemModal(this, () => {
        this.refreshView();
      });

      // 클립보드 내용을 미리 채움
      if (isUrl) {
        (modal as any).url = trimmed;
        (modal as any).title = trimmed; // URL을 임시 제목으로
      } else {
        (modal as any).title = trimmed;
      }

      modal.open();
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  }

  refreshView(): void {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_READING_QUEUE);
    for (const leaf of leaves) {
      const view = leaf.view as ReadingQueueView;
      if (view && typeof view.refresh === 'function') {
        view.refresh();
      }
    }
  }

  /**
   * Get the AI service instance
   */
  getAIService() {
    return getAIService();
  }
}
