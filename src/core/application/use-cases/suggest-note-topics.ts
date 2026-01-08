/**
 * SuggestNoteTopicsUseCase
 * Suggests permanent note topics based on reading content and insights
 */

import type { App } from 'obsidian';
import { ContentAnalysis } from '../../domain/entities/content-analysis';
import { getAIService, AIService } from '../services/ai-service';
import { CostTracker } from '../services/cost-tracker';

export interface SuggestNoteTopicsInput {
  itemId: string;
  title: string;
  url?: string;
  analysis?: ContentAnalysis;
  userNotes?: string;
}

export interface NoteTopic {
  title: string;
  description: string;
  keyPoints: string[];
  suggestedTags: string[];
}

export interface SuggestNoteTopicsOutput {
  success: boolean;
  topics: NoteTopic[];
  error?: string;
}

const NOTE_TOPIC_PROMPT = `당신은 PKM(개인 지식 관리) 전문가로서, 읽기 자료에서 영구 노트로 작성할 주제를 추천합니다.

읽기 자료:
---
제목: {title}
URL: {url}

요약: {summary}

핵심 인사이트:
{insights}

사용자 메모:
{userNotes}
---

위 내용을 바탕으로 2-4개의 영구 노트 주제를 추천해주세요. 각 주제는:
1. 독립적으로 존재할 수 있는 단일 개념이어야 합니다
2. 이 특정 출처를 넘어 일반화될 수 있어야 합니다
3. 더 넓은 지식 영역과 연결될 수 있어야 합니다
4. 실행 가능하거나 적용할 수 있는 통찰을 담아야 합니다

**반드시 한국어로 작성하세요.**

유효한 JSON으로만 응답하세요 (마크다운 없이):
{
  "topics": [
    {
      "title": "명확하고 구체적인 주제 제목",
      "description": "핵심 아이디어를 설명하는 2-3문장",
      "keyPoints": ["포인트 1", "포인트 2", "포인트 3"],
      "suggestedTags": ["태그1", "태그2"]
    }
  ]
}`;

export class SuggestNoteTopicsUseCase {
  private aiService: AIService | null;
  private costTracker: CostTracker;
  private app: App;

  constructor(app: App, costTracker: CostTracker) {
    this.app = app;
    this.aiService = getAIService();
    this.costTracker = costTracker;
  }

  async execute(input: SuggestNoteTopicsInput): Promise<SuggestNoteTopicsOutput> {
    try {
      if (!this.aiService) {
        return {
          success: false,
          topics: [],
          error: 'AI service not initialized',
        };
      }

      // Build context from analysis
      const summary = input.analysis?.summary || '';
      const insights = input.analysis?.keyInsights?.join('\n- ') || 'None provided';

      const prompt = NOTE_TOPIC_PROMPT
        .replace('{title}', input.title)
        .replace('{url}', input.url || 'N/A')
        .replace('{summary}', summary)
        .replace('{insights}', insights)
        .replace('{userNotes}', input.userNotes || 'None');

      const currentSpend = this.costTracker.getCurrentSpend();
      const response = await this.aiService.simpleGenerateForFeature(
        'insight-extraction',
        prompt,
        undefined,
        { temperature: 0.5, maxTokens: 1024 },
        currentSpend
      );

      if (!response.success) {
        return {
          success: false,
          topics: [],
          error: response.error || 'Failed to generate note topics',
        };
      }

      // Parse response
      const parseResult = this.parseTopicsResponse(response.content);

      // Track cost
      if (response.tokensUsed) {
        const { provider, model } = this.aiService.getFeatureConfig('insight-extraction');
        const inputTokens = Math.floor(response.tokensUsed * 0.7);
        const outputTokens = response.tokensUsed - inputTokens;
        this.costTracker.trackUsage(provider, model, inputTokens, outputTokens, 'insight-extraction');
      }

      if (parseResult.error) {
        return {
          success: false,
          topics: [],
          error: parseResult.error,
        };
      }

      if (parseResult.topics.length === 0) {
        return {
          success: false,
          topics: [],
          error: '추천할 노트 주제를 찾지 못했습니다. 분석 결과가 있는지 확인해주세요.',
        };
      }

      return {
        success: true,
        topics: parseResult.topics,
      };
    } catch (error) {
      return {
        success: false,
        topics: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private parseTopicsResponse(response: string): { topics: NoteTopic[]; error?: string } {
    try {
      let cleaned = response.trim();

      // Log raw response for debugging
      console.log('[SuggestNoteTopics] Raw AI response:', cleaned.substring(0, 500));

      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```$/g, '');
      }
      cleaned = cleaned.trim();

      if (!cleaned) {
        return { topics: [], error: 'AI 응답이 비어있습니다.' };
      }

      const parsed = JSON.parse(cleaned);
      const topics = parsed.topics || parsed;

      if (!Array.isArray(topics)) {
        return { topics: [], error: 'AI 응답 형식이 올바르지 않습니다 (배열이 아님).' };
      }

      const validTopics = topics.map((t: Record<string, unknown>) => ({
        title: String(t.title || ''),
        description: String(t.description || ''),
        keyPoints: Array.isArray(t.keyPoints) ? t.keyPoints.map(String) : [],
        suggestedTags: Array.isArray(t.suggestedTags) ? t.suggestedTags.map(String) : [],
      })).filter(t => t.title.length > 0);

      return { topics: validTopics };
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown parse error';
      console.error('[SuggestNoteTopics] Parse error:', errorMsg, '\nResponse:', response.substring(0, 500));
      return { topics: [], error: `AI 응답 파싱 실패: ${errorMsg}` };
    }
  }
}
