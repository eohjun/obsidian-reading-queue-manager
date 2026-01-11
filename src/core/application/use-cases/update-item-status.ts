import { ReadingItem } from '../../domain/entities/reading-item';
import { ReadingStatusType } from '../../domain/value-objects/reading-status';
import { IReadingQueueRepository } from '../../domain/interfaces/reading-queue-repository.interface';

export type StatusAction = 'start' | 'done' | 'abandon' | 'backToQueue';

export interface UpdateItemStatusInput {
  itemId: string;
  action: StatusAction;
}

export interface UpdateItemStatusOutput {
  success: boolean;
  item?: ReadingItem;
  error?: string;
  previousStatus?: ReadingStatusType;
  newStatus?: ReadingStatusType;
}

export class UpdateItemStatusUseCase {
  constructor(private readonly repository: IReadingQueueRepository) {}

  async execute(input: UpdateItemStatusInput): Promise<UpdateItemStatusOutput> {
    try {
      const item = await this.repository.findById(input.itemId);

      if (!item) {
        return { success: false, error: 'Item not found.' };
      }

      const previousStatus = item.status.getValue();

      // Update status
      switch (input.action) {
        case 'start':
          item.startReading();
          break;
        case 'done':
          item.markDone();
          break;
        case 'abandon':
          item.abandon();
          break;
        case 'backToQueue':
          item.backToQueue();
          break;
        default:
          return { success: false, error: 'Unknown action.' };
      }

      const newStatus = item.status.getValue();

      // Return if no change
      if (previousStatus === newStatus) {
        return {
          success: true,
          item,
          previousStatus,
          newStatus,
        };
      }

      // Save
      const savedItem = await this.repository.save(item);

      return {
        success: true,
        item: savedItem,
        previousStatus,
        newStatus,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error updating status.',
      };
    }
  }
}
