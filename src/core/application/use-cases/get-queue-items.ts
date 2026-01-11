import { ReadingItem } from '../../domain/entities/reading-item';
import { ReadingStatusType } from '../../domain/value-objects/reading-status';
import { PriorityLevelType } from '../../domain/value-objects/priority-level';
import { IReadingQueueRepository, ReadingQueueFilter, ReadingQueueStats } from '../../domain/interfaces/reading-queue-repository.interface';

export interface GetQueueItemsInput {
  filter?: ReadingQueueFilter;
  sortBy?: 'priority' | 'addedAt' | 'estimatedMinutes' | 'progress';
  sortOrder?: 'asc' | 'desc';
}

export interface GetQueueItemsOutput {
  success: boolean;
  items: ReadingItem[];
  stats?: ReadingQueueStats;
  error?: string;
}

export class GetQueueItemsUseCase {
  constructor(private readonly repository: IReadingQueueRepository) {}

  async execute(input: GetQueueItemsInput = {}): Promise<GetQueueItemsOutput> {
    try {
      let items: ReadingItem[];

      if (input.filter) {
        items = await this.repository.findByFilter(input.filter);
      } else {
        items = await this.repository.getActiveItems();
      }

      // Sort
      if (input.sortBy) {
        items = this.sortItems(items, input.sortBy, input.sortOrder || 'desc');
      } else {
        // Default sort: priority (high first) → added date (oldest first)
        items = this.sortItems(items, 'priority', 'desc');
      }

      // Stats
      const stats = await this.repository.getStats();

      return { success: true, items, stats };
    } catch (error) {
      return {
        success: false,
        items: [],
        error: error instanceof Error ? error.message : 'Error retrieving queue items.',
      };
    }
  }

  private sortItems(
    items: ReadingItem[],
    sortBy: string,
    order: 'asc' | 'desc'
  ): ReadingItem[] {
    const sorted = [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          comparison = a.priority.getNumericValue() - b.priority.getNumericValue();
          break;
        case 'addedAt':
          comparison = a.addedAt.getTime() - b.addedAt.getTime();
          break;
        case 'estimatedMinutes':
          comparison = (a.estimatedMinutes || 0) - (b.estimatedMinutes || 0);
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        default:
          comparison = 0;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }
}
