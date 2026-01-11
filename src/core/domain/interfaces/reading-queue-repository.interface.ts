import { ReadingItem } from '../entities/reading-item';
import { ReadingStatus, ReadingStatusType } from '../value-objects/reading-status';
import { PriorityLevelType } from '../value-objects/priority-level';

export interface ReadingQueueStats {
  total: number;
  byStatus: Record<ReadingStatusType, number>;
  byPriority: Record<PriorityLevelType, number>;
  totalEstimatedMinutes: number;
  averageProgress: number;
  staleCount: number;
}

export interface ReadingQueueFilter {
  status?: ReadingStatusType | ReadingStatusType[];
  priority?: PriorityLevelType | PriorityLevelType[];
  tags?: string[];
  maxMinutes?: number;
  includeStale?: boolean;
}

export interface IReadingQueueRepository {
  /**
   * Find item by ID
   */
  findById(id: string): Promise<ReadingItem | null>;

  /**
   * Find items by status
   */
  findByStatus(status: ReadingStatusType): Promise<ReadingItem[]>;

  /**
   * Find items that can be completed within time budget
   */
  findByTimeBudget(maxMinutes: number): Promise<ReadingItem[]>;

  /**
   * Find stale items
   */
  findStaleItems(daysThreshold: number): Promise<ReadingItem[]>;

  /**
   * Find items by filter
   */
  findByFilter(filter: ReadingQueueFilter): Promise<ReadingItem[]>;

  /**
   * Get all items
   */
  getAll(): Promise<ReadingItem[]>;

  /**
   * Get active items (queue + reading)
   */
  getActiveItems(): Promise<ReadingItem[]>;

  /**
   * Save item (create or update)
   */
  save(item: ReadingItem): Promise<ReadingItem>;

  /**
   * Delete item
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get statistics
   */
  getStats(): Promise<ReadingQueueStats>;

  /**
   * Get all tags
   */
  getAllTags(): Promise<string[]>;
}
