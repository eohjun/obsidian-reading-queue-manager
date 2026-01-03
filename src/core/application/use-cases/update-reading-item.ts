import { ReadingItem } from '../../domain/entities/reading-item';
import { PriorityLevel, PriorityLevelType } from '../../domain/value-objects/priority-level';
import { IReadingQueueRepository } from '../../domain/interfaces/reading-queue-repository.interface';

export interface UpdateReadingItemInput {
  itemId: string;
  title?: string;
  url?: string;
  priority?: PriorityLevelType;
  estimatedMinutes?: number;
  tags?: string[];
  notes?: string;
  progress?: number;
}

export interface UpdateReadingItemOutput {
  success: boolean;
  item?: ReadingItem;
  error?: string;
}

export class UpdateReadingItemUseCase {
  constructor(private readonly repository: IReadingQueueRepository) {}

  async execute(input: UpdateReadingItemInput): Promise<UpdateReadingItemOutput> {
    try {
      const item = await this.repository.findById(input.itemId);

      if (!item) {
        return { success: false, error: '아이템을 찾을 수 없습니다.' };
      }

      // 필드 업데이트
      if (input.title !== undefined) {
        item.updateTitle(input.title);
      }

      if (input.url !== undefined) {
        item.updateUrl(input.url || undefined);
      }

      if (input.priority !== undefined) {
        item.updatePriority(PriorityLevel.fromString(input.priority));
      }

      if (input.estimatedMinutes !== undefined) {
        item.updateEstimatedMinutes(input.estimatedMinutes);
      }

      if (input.tags !== undefined) {
        item.setTags(input.tags);
      }

      if (input.notes !== undefined) {
        item.updateNotes(input.notes);
      }

      if (input.progress !== undefined) {
        item.updateProgress(input.progress);
      }

      // 저장
      const savedItem = await this.repository.save(item);

      return { success: true, item: savedItem };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '아이템 수정 중 오류가 발생했습니다.',
      };
    }
  }
}
