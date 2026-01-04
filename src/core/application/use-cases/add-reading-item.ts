import { ReadingItem, ReadingSourceType } from '../../domain/entities/reading-item';
import { ContentAnalysis } from '../../domain/entities/content-analysis';
import { PriorityLevelType } from '../../domain/value-objects/priority-level';
import { IReadingQueueRepository } from '../../domain/interfaces/reading-queue-repository.interface';

export interface AddReadingItemInput {
  title: string;
  url?: string;
  source?: ReadingSourceType;
  priority?: PriorityLevelType;
  estimatedMinutes?: number;
  tags?: string[];
  notes?: string;
  analysis?: ContentAnalysis;
}

export interface AddReadingItemOutput {
  success: boolean;
  item?: ReadingItem;
  error?: string;
}

export class AddReadingItemUseCase {
  constructor(private readonly repository: IReadingQueueRepository) {}

  async execute(input: AddReadingItemInput): Promise<AddReadingItemOutput> {
    try {
      // 유효성 검사
      if (!input.title?.trim()) {
        return { success: false, error: '제목을 입력해주세요.' };
      }

      // 새 아이템 생성
      const item = ReadingItem.create({
        title: input.title.trim(),
        url: input.url?.trim() || undefined,
        source: input.source || 'manual',
        priority: input.priority || PriorityLevelType.MEDIUM,
        estimatedMinutes: input.estimatedMinutes,
        tags: input.tags || [],
        notes: input.notes,
        analysis: input.analysis,
      });

      // 저장
      const savedItem = await this.repository.save(item);

      return { success: true, item: savedItem };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '아이템 추가 중 오류가 발생했습니다.',
      };
    }
  }
}
