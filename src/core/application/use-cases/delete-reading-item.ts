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
        return { success: false, error: 'Item not found.' };
      }

      const deleted = await this.repository.delete(input.itemId);

      if (!deleted) {
        return { success: false, error: 'Failed to delete item.' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error deleting item.',
      };
    }
  }
}
