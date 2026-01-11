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

const NOTE_TOPIC_PROMPT = `You are a PKM (Personal Knowledge Management) expert. Suggest topics for permanent notes from reading materials.

Reading Material:
---
Title: {title}
URL: {url}

Summary: {summary}

Key Insights:
{insights}

User Notes:
{userNotes}
---

Based on the above content, suggest 2-4 permanent note topics. Each topic should:
1. Be a single concept that can stand on its own
2. Be generalizable beyond this specific source
3. Be connectable to broader areas of knowledge
4. Contain actionable or applicable insights

**Write in English.**

Respond with valid JSON only (no markdown):
{
  "topics": [
    {
      "title": "Clear and specific topic title",
      "description": "2-3 sentences explaining the core idea",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "suggestedTags": ["tag1", "tag2"]
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
        { temperature: 0.5, maxTokens: 8192 },  // Reasoning models (GPT-5.x, o1, o3) need more tokens for internal reasoning
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
          error: 'No note topics found. Please check if analysis results are available.',
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
        return { topics: [], error: 'AI response is empty.' };
      }

      const parsed = JSON.parse(cleaned);
      const topics = parsed.topics || parsed;

      if (!Array.isArray(topics)) {
        return { topics: [], error: 'Invalid AI response format (not an array).' };
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
      return { topics: [], error: `Failed to parse AI response: ${errorMsg}` };
    }
  }
}
