import { ReadingItem } from '../../domain/entities/reading-item';
import { ContentAnalysis } from '../../domain/entities/content-analysis';
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
  analysis?: ContentAnalysis;
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
        return { success: false, error: 'Item not found.' };
      }

      // Update fields
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

      if (input.analysis !== undefined) {
        item.setAnalysis(input.analysis);
      }

      // Save
      const savedItem = await this.repository.save(item);

      return { success: true, item: savedItem };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error updating item.',
      };
    }
  }
}
