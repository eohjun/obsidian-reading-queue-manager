import { ItemView, WorkspaceLeaf, Menu, setIcon } from 'obsidian';
import { ReadingItem } from '../core/domain/entities/reading-item';
import { ReadingStatusType } from '../core/domain/value-objects/reading-status';
import { PriorityLevelType } from '../core/domain/value-objects/priority-level';
import {
  GetQueueItemsUseCase,
  UpdateItemStatusUseCase,
  DeleteReadingItemUseCase,
  StatusAction,
} from '../core/application/use-cases';
import { InsightsModal } from './insights-modal';
import type ReadingQueuePlugin from '../main';

export const VIEW_TYPE_READING_QUEUE = 'reading-queue-view';

export class ReadingQueueView extends ItemView {
  private plugin: ReadingQueuePlugin;
  private items: ReadingItem[] = [];
  private currentFilter: {
    status?: ReadingStatusType[];
    priority?: PriorityLevelType[];
  } = {};

  constructor(leaf: WorkspaceLeaf, plugin: ReadingQueuePlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_READING_QUEUE;
  }

  getDisplayText(): string {
    return 'Reading Queue';
  }

  getIcon(): string {
    return 'list-checks';
  }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }

  async refresh(): Promise<void> {
    await this.render();
  }

  private async render(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('reading-queue-container');

    // Header
    this.renderHeader(container);

    // Filters
    this.renderFilters(container);

    // Load items
    await this.loadItems();

    // Content
    if (this.items.length === 0) {
      this.renderEmptyState(container);
    } else {
      this.renderItems(container);
    }
  }

  private renderHeader(container: Element): void {
    const header = container.createDiv({ cls: 'reading-queue-header' });

    header.createEl('h4', { text: 'Reading Queue' });

    const addBtn = header.createEl('button', { cls: 'reading-queue-action-btn primary' });
    setIcon(addBtn, 'plus');
    addBtn.addEventListener('click', () => {
      this.plugin.showAddItemModal();
    });
  }

  private renderFilters(container: Element): void {
    const filtersEl = container.createDiv({ cls: 'reading-queue-filters' });

    // Status filter
    const statusSelect = filtersEl.createEl('select');
    statusSelect.createEl('option', { text: 'All Status', value: '' });
    statusSelect.createEl('option', { text: '📚 Queue', value: ReadingStatusType.QUEUE });
    statusSelect.createEl('option', { text: '📖 Reading', value: ReadingStatusType.READING });
    statusSelect.createEl('option', { text: '✅ Done', value: ReadingStatusType.DONE });
    statusSelect.createEl('option', { text: '❌ Abandoned', value: ReadingStatusType.ABANDONED });

    statusSelect.addEventListener('change', async () => {
      if (statusSelect.value) {
        this.currentFilter.status = [statusSelect.value as ReadingStatusType];
      } else {
        delete this.currentFilter.status;
      }
      await this.render();
    });

    // Priority filter
    const prioritySelect = filtersEl.createEl('select');
    prioritySelect.createEl('option', { text: 'All Priority', value: '' });
    prioritySelect.createEl('option', { text: '🔴 High', value: PriorityLevelType.HIGH });
    prioritySelect.createEl('option', { text: '🟡 Medium', value: PriorityLevelType.MEDIUM });
    prioritySelect.createEl('option', { text: '🟢 Low', value: PriorityLevelType.LOW });

    prioritySelect.addEventListener('change', async () => {
      if (prioritySelect.value) {
        this.currentFilter.priority = [prioritySelect.value as PriorityLevelType];
      } else {
        delete this.currentFilter.priority;
      }
      await this.render();
    });
  }

  private async loadItems(): Promise<void> {
    const useCase = new GetQueueItemsUseCase(this.plugin.repository);
    const result = await useCase.execute({
      filter: {
        status: this.currentFilter.status,
        priority: this.currentFilter.priority,
        includeStale: true,
      },
      sortBy: 'priority',
      sortOrder: 'desc',
    });

    if (result.success) {
      this.items = result.items;
    } else {
      this.items = [];
    }
  }

  private renderEmptyState(container: Element): void {
    const emptyEl = container.createDiv({ cls: 'reading-queue-empty' });
    emptyEl.createDiv({ cls: 'reading-queue-empty-icon', text: '📚' });
    emptyEl.createEl('p', { text: 'Your reading queue is empty.' });
    emptyEl.createEl('p', { text: 'Click the + button to add reading materials.' });
  }

  private renderItems(container: Element): void {
    const listEl = container.createDiv({ cls: 'reading-queue-list' });

    for (const item of this.items) {
      this.renderItem(listEl, item);
    }
  }

  private renderItem(container: Element, item: ReadingItem): void {
    const itemEl = container.createDiv({
      cls: `reading-queue-item priority-${item.priority.getValue()} status-${item.status.getValue()}`,
    });

    // Title row
    const titleRow = itemEl.createDiv({ cls: 'reading-queue-item-title' });
    titleRow.createSpan({ cls: 'status-icon', text: item.status.getIcon() });
    titleRow.createSpan({ text: item.title });

    // Meta row
    const metaRow = itemEl.createDiv({ cls: 'reading-queue-item-meta' });

    // Priority badge
    const priorityBadge = metaRow.createSpan({
      cls: `priority-badge ${item.priority.getValue()}`,
      text: item.priority.getDisplayText(),
    });

    // Time estimate
    if (item.estimatedMinutes) {
      const timeEl = metaRow.createSpan({ cls: 'time-estimate' });
      setIcon(timeEl.createSpan(), 'clock');
      timeEl.createSpan({ text: `${item.estimatedMinutes} min` });
    }

    // Tags
    if (item.tags.length > 0) {
      const tagsEl = itemEl.createDiv({ cls: 'reading-queue-tags' });
      for (const tag of item.tags.slice(0, 3)) {
        tagsEl.createSpan({ cls: 'reading-queue-tag', text: `#${tag}` });
      }
      if (item.tags.length > 3) {
        tagsEl.createSpan({ cls: 'reading-queue-tag', text: `+${item.tags.length - 3}` });
      }
    }

    // Summary preview (if analysis exists)
    if (item.analysis?.summary) {
      const summaryEl = itemEl.createDiv({ cls: 'reading-queue-summary' });
      const previewText = item.analysis.summary.length > 100
        ? item.analysis.summary.substring(0, 100) + '...'
        : item.analysis.summary;
      summaryEl.createEl('span', { text: '📝 ', cls: 'summary-icon' });
      summaryEl.createEl('span', { text: previewText, cls: 'summary-text' });
    }

    // Progress bar (for reading items)
    if (item.status.isReading() && item.progress > 0) {
      const progressEl = itemEl.createDiv({ cls: 'reading-queue-progress' });
      const progressBar = progressEl.createDiv({ cls: 'reading-queue-progress-bar' });
      progressBar.style.width = `${item.progress}%`;
    }

    // Actions
    const actionsEl = itemEl.createDiv({ cls: 'reading-queue-actions' });
    this.renderItemActions(actionsEl, item);

    // Context menu
    itemEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showItemContextMenu(e, item);
    });

    // Click to open URL
    if (item.url) {
      itemEl.addEventListener('click', (e) => {
        if (!(e.target as HTMLElement).closest('.reading-queue-actions')) {
          window.open(item.url, '_blank');
        }
      });
      itemEl.style.cursor = 'pointer';
    }
  }

  private renderItemActions(container: Element, item: ReadingItem): void {
    if (item.status.isQueue()) {
      const startBtn = container.createEl('button', {
        cls: 'reading-queue-action-btn',
        text: 'Start',
      });
      startBtn.addEventListener('click', () => this.updateStatus(item.id, 'start'));
    }

    if (item.status.isReading()) {
      const doneBtn = container.createEl('button', {
        cls: 'reading-queue-action-btn primary',
        text: 'Done',
      });
      doneBtn.addEventListener('click', () => this.updateStatus(item.id, 'done'));
    }

    if (item.status.isActive()) {
      const abandonBtn = container.createEl('button', {
        cls: 'reading-queue-action-btn',
        text: 'Abandon',
      });
      abandonBtn.addEventListener('click', () => this.updateStatus(item.id, 'abandon'));
    }

    // Insights button for items with analysis or completed items
    if (item.analysis || item.status.isDone()) {
      const insightsBtn = container.createEl('button', {
        cls: 'reading-queue-action-btn insights',
        text: '💡',
      });
      insightsBtn.title = 'View Insights';
      insightsBtn.addEventListener('click', () => this.showInsightsModal(item));
    }

    if (item.status.isDone() || item.status.isAbandoned()) {
      const restoreBtn = container.createEl('button', {
        cls: 'reading-queue-action-btn',
        text: 'Restore',
      });
      restoreBtn.addEventListener('click', () => this.updateStatus(item.id, 'backToQueue'));
    }
  }

  private showInsightsModal(item: ReadingItem): void {
    const modal = new InsightsModal(this.plugin, item);
    modal.open();
  }

  private showItemContextMenu(e: MouseEvent, item: ReadingItem): void {
    const menu = new Menu();

    if (item.url) {
      menu.addItem((menuItem) => {
        menuItem
          .setTitle('Open URL')
          .setIcon('external-link')
          .onClick(() => {
            window.open(item.url, '_blank');
          });
      });
    }

    menu.addItem((menuItem) => {
      menuItem
        .setTitle('Edit')
        .setIcon('pencil')
        .onClick(() => {
          this.plugin.showEditItemModal(item);
        });
    });

    menu.addSeparator();

    menu.addItem((menuItem) => {
      menuItem
        .setTitle('Delete')
        .setIcon('trash')
        .onClick(async () => {
          await this.deleteItem(item.id);
        });
    });

    menu.showAtMouseEvent(e);
  }

  private async updateStatus(itemId: string, action: StatusAction): Promise<void> {
    const useCase = new UpdateItemStatusUseCase(this.plugin.repository);
    const result = await useCase.execute({ itemId, action });

    if (result.success) {
      await this.render();
    }
  }

  private async deleteItem(itemId: string): Promise<void> {
    const useCase = new DeleteReadingItemUseCase(this.plugin.repository);
    const result = await useCase.execute({ itemId });

    if (result.success) {
      await this.render();
    }
  }
}
