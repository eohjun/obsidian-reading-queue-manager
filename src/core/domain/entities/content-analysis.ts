/**
 * ContentAnalysis Entity
 * Represents the result of AI analysis on reading content
 */

import type { PriorityLevelType } from '../value-objects/priority-level';

export interface ContentAnalysisProps {
  id: string;
  itemId: string;
  title?: string;
  summary: string;
  keyInsights: string[];
  suggestedTags: string[];
  suggestedPriority?: PriorityLevelType;
  estimatedReadingTime?: number; // in minutes
  language?: string;
  analyzedAt: Date;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export interface ContentAnalysisData {
  id: string;
  itemId: string;
  title?: string;
  summary: string;
  keyInsights: string[];
  suggestedTags: string[];
  suggestedPriority?: string;
  estimatedReadingTime?: number;
  language?: string;
  analyzedAt: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export class ContentAnalysis {
  private readonly _id: string;
  private readonly _itemId: string;
  private _title?: string;
  private _summary: string;
  private _keyInsights: string[];
  private _suggestedTags: string[];
  private _suggestedPriority?: PriorityLevelType;
  private _estimatedReadingTime?: number;
  private _language?: string;
  private readonly _analyzedAt: Date;
  private readonly _provider: string;
  private readonly _model: string;
  private readonly _tokensUsed?: number;

  private constructor(props: ContentAnalysisProps) {
    this._id = props.id;
    this._itemId = props.itemId;
    this._title = props.title;
    this._summary = props.summary;
    this._keyInsights = [...props.keyInsights];
    this._suggestedTags = [...props.suggestedTags];
    this._suggestedPriority = props.suggestedPriority;
    this._estimatedReadingTime = props.estimatedReadingTime;
    this._language = props.language;
    this._analyzedAt = props.analyzedAt;
    this._provider = props.provider;
    this._model = props.model;
    this._tokensUsed = props.tokensUsed;
  }

  static create(props: Omit<ContentAnalysisProps, 'id' | 'analyzedAt'>): ContentAnalysis {
    return new ContentAnalysis({
      ...props,
      id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      analyzedAt: new Date(),
    });
  }

  static fromData(data: ContentAnalysisData): ContentAnalysis {
    return new ContentAnalysis({
      id: data.id,
      itemId: data.itemId,
      title: data.title,
      summary: data.summary,
      keyInsights: data.keyInsights,
      suggestedTags: data.suggestedTags,
      suggestedPriority: data.suggestedPriority as PriorityLevelType | undefined,
      estimatedReadingTime: data.estimatedReadingTime,
      language: data.language,
      analyzedAt: new Date(data.analyzedAt),
      provider: data.provider,
      model: data.model,
      tokensUsed: data.tokensUsed,
    });
  }

  // Getters
  get id(): string { return this._id; }
  get itemId(): string { return this._itemId; }
  get title(): string | undefined { return this._title; }
  get summary(): string { return this._summary; }
  get keyInsights(): string[] { return [...this._keyInsights]; }
  get suggestedTags(): string[] { return [...this._suggestedTags]; }
  get suggestedPriority(): PriorityLevelType | undefined { return this._suggestedPriority; }
  get estimatedReadingTime(): number | undefined { return this._estimatedReadingTime; }
  get language(): string | undefined { return this._language; }
  get analyzedAt(): Date { return this._analyzedAt; }
  get provider(): string { return this._provider; }
  get model(): string { return this._model; }
  get tokensUsed(): number | undefined { return this._tokensUsed; }

  // Serialization
  toData(): ContentAnalysisData {
    return {
      id: this._id,
      itemId: this._itemId,
      title: this._title,
      summary: this._summary,
      keyInsights: [...this._keyInsights],
      suggestedTags: [...this._suggestedTags],
      suggestedPriority: this._suggestedPriority,
      estimatedReadingTime: this._estimatedReadingTime,
      language: this._language,
      analyzedAt: this._analyzedAt.toISOString(),
      provider: this._provider,
      model: this._model,
      tokensUsed: this._tokensUsed,
    };
  }

  // Helper methods
  hasInsights(): boolean {
    return this._keyInsights.length > 0;
  }

  hasSuggestedTags(): boolean {
    return this._suggestedTags.length > 0;
  }

  getReadingTimeDisplay(): string {
    if (!this._estimatedReadingTime) return '';
    if (this._estimatedReadingTime < 60) {
      return `${this._estimatedReadingTime}분`;
    }
    const hours = Math.floor(this._estimatedReadingTime / 60);
    const minutes = this._estimatedReadingTime % 60;
    return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
  }
}
