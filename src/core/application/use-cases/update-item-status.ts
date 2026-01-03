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
        return { success: false, error: '아이템을 찾을 수 없습니다.' };
      }

      const previousStatus = item.status.getValue();

      // 상태 변경
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
          return { success: false, error: '알 수 없는 액션입니다.' };
      }

      const newStatus = item.status.getValue();

      // 변경 없으면 그냥 반환
      if (previousStatus === newStatus) {
        return {
          success: true,
          item,
          previousStatus,
          newStatus,
        };
      }

      // 저장
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
        error: error instanceof Error ? error.message : '상태 변경 중 오류가 발생했습니다.',
      };
    }
  }
}
