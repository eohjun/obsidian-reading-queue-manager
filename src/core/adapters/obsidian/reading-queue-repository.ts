import { Plugin } from 'obsidian';
import { ReadingItem, ReadingItemData } from '../../domain/entities/reading-item';
import { ReadingStatusType } from '../../domain/value-objects/reading-status';
import { PriorityLevelType } from '../../domain/value-objects/priority-level';
import {
  IReadingQueueRepository,
  ReadingQueueStats,
  ReadingQueueFilter,
} from '../../domain/interfaces/reading-queue-repository.interface';

interface StoredData {
  items: ReadingItemData[];
  version: string;
  // Note: Other plugin data (settings) is stored alongside these fields
  // The persist() method preserves existing data to avoid overwriting settings
  [key: string]: unknown;
}

export class ObsidianReadingQueueRepository implements IReadingQueueRepository {
  private items: Map<string, ReadingItem> = new Map();
  private loaded = false;

  constructor(private readonly plugin: Plugin) {}

  async load(): Promise<void> {
    if (this.loaded) return;

    const data = await this.plugin.loadData() as StoredData | null;

    if (data?.items) {
      for (const itemData of data.items) {
        try {
          const item = ReadingItem.fromData(itemData);
          this.items.set(item.id, item);
        } catch (error) {
          console.error('Failed to load item:', itemData.id, error);
        }
      }
    }

    this.loaded = true;
  }

  private async persist(): Promise<void> {
    // Load existing data first to preserve settings and other plugin data
    const existingData = await this.plugin.loadData() as StoredData | null;

    const data: StoredData = {
      ...existingData, // Preserve existing data (including settings)
      items: Array.from(this.items.values()).map(item => item.toData()),
      version: '0.1.0',
    };

    await this.plugin.saveData(data);
  }

  async findById(id: string): Promise<ReadingItem | null> {
    await this.load();
    return this.items.get(id) || null;
  }

  async findByStatus(status: ReadingStatusType): Promise<ReadingItem[]> {
    await this.load();
    return Array.from(this.items.values()).filter(
      item => item.status.getValue() === status
    );
  }

  async findByTimeBudget(maxMinutes: number): Promise<ReadingItem[]> {
    await this.load();
    return Array.from(this.items.values()).filter(item => {
      if (!item.status.isActive()) return false;
      return item.fitsTimeBudget(maxMinutes);
    });
  }

  async findStaleItems(daysThreshold: number): Promise<ReadingItem[]> {
    await this.load();
    return Array.from(this.items.values()).filter(item =>
      item.isStale(daysThreshold)
    );
  }

  async findByFilter(filter: ReadingQueueFilter): Promise<ReadingItem[]> {
    await this.load();

    return Array.from(this.items.values()).filter(item => {
      // 상태 필터
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statuses.includes(item.status.getValue())) {
          return false;
        }
      }

      // 우선순위 필터
      if (filter.priority) {
        const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
        if (!priorities.includes(item.priority.getValue())) {
          return false;
        }
      }

      // 태그 필터 (AND 조건)
      if (filter.tags && filter.tags.length > 0) {
        const hasAllTags = filter.tags.every(tag => item.hasTag(tag));
        if (!hasAllTags) {
          return false;
        }
      }

      // 시간 예산 필터
      if (filter.maxMinutes !== undefined) {
        if (!item.fitsTimeBudget(filter.maxMinutes)) {
          return false;
        }
      }

      // stale 아이템 포함 여부
      if (!filter.includeStale && item.isStale()) {
        return false;
      }

      return true;
    });
  }

  async getAll(): Promise<ReadingItem[]> {
    await this.load();
    return Array.from(this.items.values());
  }

  async getActiveItems(): Promise<ReadingItem[]> {
    await this.load();
    return Array.from(this.items.values()).filter(item => item.status.isActive());
  }

  async save(item: ReadingItem): Promise<ReadingItem> {
    await this.load();
    this.items.set(item.id, item);
    await this.persist();
    return item;
  }

  async delete(id: string): Promise<boolean> {
    await this.load();
    const deleted = this.items.delete(id);
    if (deleted) {
      await this.persist();
    }
    return deleted;
  }

  async getStats(): Promise<ReadingQueueStats> {
    await this.load();

    const allItems = Array.from(this.items.values());

    const byStatus: Record<ReadingStatusType, number> = {
      [ReadingStatusType.QUEUE]: 0,
      [ReadingStatusType.READING]: 0,
      [ReadingStatusType.DONE]: 0,
      [ReadingStatusType.ABANDONED]: 0,
    };

    const byPriority: Record<PriorityLevelType, number> = {
      [PriorityLevelType.HIGH]: 0,
      [PriorityLevelType.MEDIUM]: 0,
      [PriorityLevelType.LOW]: 0,
    };

    let totalEstimatedMinutes = 0;
    let totalProgress = 0;
    let staleCount = 0;
    let activeCount = 0;

    for (const item of allItems) {
      byStatus[item.status.getValue()]++;
      byPriority[item.priority.getValue()]++;

      if (item.estimatedMinutes) {
        totalEstimatedMinutes += item.estimatedMinutes;
      }

      if (item.status.isActive()) {
        totalProgress += item.progress;
        activeCount++;
      }

      if (item.isStale()) {
        staleCount++;
      }
    }

    return {
      total: allItems.length,
      byStatus,
      byPriority,
      totalEstimatedMinutes,
      averageProgress: activeCount > 0 ? totalProgress / activeCount : 0,
      staleCount,
    };
  }

  async getAllTags(): Promise<string[]> {
    await this.load();

    const tagSet = new Set<string>();
    for (const item of this.items.values()) {
      for (const tag of item.tags) {
        tagSet.add(tag);
      }
    }

    return Array.from(tagSet).sort();
  }
}
