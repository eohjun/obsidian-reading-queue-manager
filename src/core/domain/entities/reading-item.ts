import { ReadingStatus, ReadingStatusType } from '../value-objects/reading-status';
import { PriorityLevel, PriorityLevelType } from '../value-objects/priority-level';
import { ContentAnalysis, ContentAnalysisData } from './content-analysis';

export type ReadingSourceType = 'manual' | 'pocket' | 'instapaper' | 'zotero';

export interface ReadingItemProps {
  id: string;
  title: string;
  url?: string;
  source: ReadingSourceType;
  status: ReadingStatusType;
  priority: PriorityLevelType;
  estimatedMinutes?: number;
  progress: number;
  tags: string[];
  notes?: string;
  addedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  // AI Analysis
  analysis?: ContentAnalysis;
  linkedNotes?: string[];
}

export interface ReadingItemData {
  id: string;
  title: string;
  url?: string;
  source: ReadingSourceType;
  status: string;
  priority: string;
  estimatedMinutes?: number;
  progress: number;
  tags: string[];
  notes?: string;
  addedAt: string;
  startedAt?: string;
  completedAt?: string;
  // AI Analysis
  analysis?: ContentAnalysisData;
  linkedNotes?: string[];
}

export class ReadingItem {
  private readonly _id: string;
  private _title: string;
  private _url?: string;
  private readonly _source: ReadingSourceType;
  private _status: ReadingStatus;
  private _priority: PriorityLevel;
  private _estimatedMinutes?: number;
  private _progress: number;
  private _tags: string[];
  private _notes?: string;
  private readonly _addedAt: Date;
  private _startedAt?: Date;
  private _completedAt?: Date;
  // AI Analysis
  private _analysis?: ContentAnalysis;
  private _linkedNotes: string[];

  private constructor(props: ReadingItemProps) {
    this._id = props.id;
    this._title = props.title;
    this._url = props.url;
    this._source = props.source;
    this._status = ReadingStatus.fromString(props.status);
    this._priority = PriorityLevel.fromString(props.priority);
    this._estimatedMinutes = props.estimatedMinutes;
    this._progress = props.progress;
    this._tags = [...props.tags];
    this._notes = props.notes;
    this._addedAt = props.addedAt;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._analysis = props.analysis;
    this._linkedNotes = props.linkedNotes ? [...props.linkedNotes] : [];
  }

  static create(props: Omit<ReadingItemProps, 'id' | 'addedAt' | 'progress' | 'status'>): ReadingItem {
    return new ReadingItem({
      ...props,
      id: crypto.randomUUID(),
      status: ReadingStatusType.QUEUE,
      progress: 0,
      addedAt: new Date(),
    });
  }

  static fromData(data: ReadingItemData): ReadingItem {
    return new ReadingItem({
      id: data.id,
      title: data.title,
      url: data.url,
      source: data.source,
      status: data.status as ReadingStatusType,
      priority: data.priority as PriorityLevelType,
      estimatedMinutes: data.estimatedMinutes,
      progress: data.progress,
      tags: data.tags,
      notes: data.notes,
      addedAt: new Date(data.addedAt),
      startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      analysis: data.analysis ? ContentAnalysis.fromData(data.analysis) : undefined,
      linkedNotes: data.linkedNotes,
    });
  }

  // Getters
  get id(): string { return this._id; }
  get title(): string { return this._title; }
  get url(): string | undefined { return this._url; }
  get source(): ReadingSourceType { return this._source; }
  get status(): ReadingStatus { return this._status; }
  get priority(): PriorityLevel { return this._priority; }
  get estimatedMinutes(): number | undefined { return this._estimatedMinutes; }
  get progress(): number { return this._progress; }
  get tags(): string[] { return [...this._tags]; }
  get notes(): string | undefined { return this._notes; }
  get addedAt(): Date { return this._addedAt; }
  get startedAt(): Date | undefined { return this._startedAt; }
  get completedAt(): Date | undefined { return this._completedAt; }
  get analysis(): ContentAnalysis | undefined { return this._analysis; }
  get linkedNotes(): string[] { return [...this._linkedNotes]; }

  // Domain Methods
  startReading(): void {
    if (!this._status.isQueue()) {
      return;
    }
    this._status = ReadingStatus.reading();
    this._startedAt = new Date();
  }

  markDone(): void {
    if (!this._status.isReading()) {
      return;
    }
    this._status = ReadingStatus.done();
    this._completedAt = new Date();
    this._progress = 100;
  }

  abandon(): void {
    if (this._status.isDone() || this._status.isAbandoned()) {
      return;
    }
    this._status = ReadingStatus.abandoned();
    this._completedAt = new Date();
  }

  backToQueue(): void {
    this._status = ReadingStatus.queue();
    this._startedAt = undefined;
    this._completedAt = undefined;
    this._progress = 0;
  }

  updateProgress(progress: number): void {
    if (progress < 0 || progress > 100) {
      return;
    }
    this._progress = progress;

    // Auto status transition
    if (progress > 0 && this._status.isQueue()) {
      this.startReading();
    }
    if (progress === 100 && this._status.isReading()) {
      this.markDone();
    }
  }

  updateTitle(title: string): void {
    if (title.trim()) {
      this._title = title.trim();
    }
  }

  updateUrl(url: string | undefined): void {
    this._url = url;
  }

  updatePriority(priority: PriorityLevel): void {
    this._priority = priority;
  }

  updateEstimatedMinutes(minutes: number | undefined): void {
    this._estimatedMinutes = minutes;
  }

  updateNotes(notes: string | undefined): void {
    this._notes = notes;
  }

  addTag(tag: string): void {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !this._tags.includes(normalizedTag)) {
      this._tags.push(normalizedTag);
    }
  }

  removeTag(tag: string): void {
    const normalizedTag = tag.trim().toLowerCase();
    this._tags = this._tags.filter(t => t !== normalizedTag);
  }

  setTags(tags: string[]): void {
    this._tags = tags.map(t => t.trim().toLowerCase()).filter(t => t.length > 0);
  }

  hasTag(tag: string): boolean {
    return this._tags.includes(tag.trim().toLowerCase());
  }

  // AI Analysis Methods
  setAnalysis(analysis: ContentAnalysis): void {
    this._analysis = analysis;

    // Update estimated reading time from analysis (only if not set)
    if (!this._estimatedMinutes && analysis.estimatedReadingTime) {
      this._estimatedMinutes = analysis.estimatedReadingTime;
    }
  }

  clearAnalysis(): void {
    this._analysis = undefined;
  }

  hasAnalysis(): boolean {
    return this._analysis !== undefined;
  }

  /**
   * Apply suggested tags from analysis
   */
  applySuggestedTags(): void {
    if (!this._analysis) return;
    for (const tag of this._analysis.suggestedTags) {
      this.addTag(tag);
    }
  }

  /**
   * Apply suggested priority from analysis
   */
  applySuggestedPriority(): void {
    if (!this._analysis?.suggestedPriority) return;
    this._priority = PriorityLevel.fromString(this._analysis.suggestedPriority);
  }

  // Linked Notes Methods
  addLinkedNote(notePath: string): void {
    if (!this._linkedNotes.includes(notePath)) {
      this._linkedNotes.push(notePath);
    }
  }

  removeLinkedNote(notePath: string): void {
    this._linkedNotes = this._linkedNotes.filter(p => p !== notePath);
  }

  hasLinkedNotes(): boolean {
    return this._linkedNotes.length > 0;
  }

  // Check if item can be completed within time budget
  fitsTimeBudget(budgetMinutes: number): boolean {
    if (!this._estimatedMinutes) return true; // No time estimate means pass
    const remainingMinutes = this._estimatedMinutes * (1 - this._progress / 100);
    return remainingMinutes <= budgetMinutes;
  }

  // Get days in queue
  getDaysInQueue(): number {
    const now = new Date();
    const diffMs = now.getTime() - this._addedAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  // Check if item is stale
  isStale(daysThreshold: number = 30): boolean {
    return this._status.isActive() && this.getDaysInQueue() >= daysThreshold;
  }

  // Serialization
  toData(): ReadingItemData {
    return {
      id: this._id,
      title: this._title,
      url: this._url,
      source: this._source,
      status: this._status.toString(),
      priority: this._priority.toString(),
      estimatedMinutes: this._estimatedMinutes,
      progress: this._progress,
      tags: [...this._tags],
      notes: this._notes,
      addedAt: this._addedAt.toISOString(),
      startedAt: this._startedAt?.toISOString(),
      completedAt: this._completedAt?.toISOString(),
      analysis: this._analysis?.toData(),
      linkedNotes: this._linkedNotes.length > 0 ? [...this._linkedNotes] : undefined,
    };
  }
}
