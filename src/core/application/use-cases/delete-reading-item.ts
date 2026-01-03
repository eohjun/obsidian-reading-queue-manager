import { IReadingQueueRepository } from '../../domain/interfaces/reading-queue-repository.interface';

export interface DeleteReadingItemInput {
  itemId: string;
}

export interface DeleteReadingItemOutput {
  success: boolean;
  error?: string;
}

export class DeleteReadingItemUseCase {
  constructor(private readonly repository: IReadingQueueRepository) {}

  async execute(input: DeleteReadingItemInput): Promise<DeleteReadingItemOutput> {
    try {
      const item = await this.repository.findById(input.itemId);

      if (!item) {
        return { success: false, error: '아이템을 찾을 수 없습니다.' };
      }

      const deleted = await this.repository.delete(input.itemId);

      if (!deleted) {
        return { success: false, error: '아이템 삭제에 실패했습니다.' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '아이템 삭제 중 오류가 발생했습니다.',
      };
    }
  }
}
