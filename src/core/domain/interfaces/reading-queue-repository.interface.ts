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
   * ID로 아이템 조회
   */
  findById(id: string): Promise<ReadingItem | null>;

  /**
   * 상태별 아이템 조회
   */
  findByStatus(status: ReadingStatusType): Promise<ReadingItem[]>;

  /**
   * 시간 예산 내 완료 가능한 아이템 조회
   */
  findByTimeBudget(maxMinutes: number): Promise<ReadingItem[]>;

  /**
   * 오래된 아이템 조회
   */
  findStaleItems(daysThreshold: number): Promise<ReadingItem[]>;

  /**
   * 필터링된 아이템 조회
   */
  findByFilter(filter: ReadingQueueFilter): Promise<ReadingItem[]>;

  /**
   * 모든 아이템 조회
   */
  getAll(): Promise<ReadingItem[]>;

  /**
   * 활성 아이템 조회 (queue + reading)
   */
  getActiveItems(): Promise<ReadingItem[]>;

  /**
   * 아이템 저장 (생성 또는 업데이트)
   */
  save(item: ReadingItem): Promise<ReadingItem>;

  /**
   * 아이템 삭제
   */
  delete(id: string): Promise<boolean>;

  /**
   * 통계 조회
   */
  getStats(): Promise<ReadingQueueStats>;

  /**
   * 모든 태그 조회
   */
  getAllTags(): Promise<string[]>;
}
