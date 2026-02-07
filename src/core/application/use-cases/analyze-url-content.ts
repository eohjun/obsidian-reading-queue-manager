/**
 * AnalyzeUrlContentUseCase
 * Fetches URL content and analyzes it using LLM
 */

import { requestUrl } from 'obsidian';
import { ContentAnalysis } from '../../domain/entities/content-analysis';
import type { PriorityLevelType } from '../../domain/value-objects/priority-level';
import { getAIService, AIService } from '../services/ai-service';
import { CostTracker } from '../services/cost-tracker';
import { getEventEmitter } from '../services/event-emitter';

export interface AnalyzeUrlContentInput {
  itemId: string;
  url: string;
  existingTags?: string[];
  language?: string;
}

export interface AnalyzeUrlContentOutput {
  success: boolean;
  analysis?: ContentAnalysis;
  error?: string;
}

interface ParsedContent {
  title: string;
  description: string;
  content: string;
  wordCount: number;
}

interface AnalysisResult {
  title?: string;
  summary: string;
  keyInsights: string[];
  suggestedTags: string[];
  suggestedPriority?: PriorityLevelType;
  estimatedReadingTime?: number;
  language?: string;
}

const ANALYSIS_PROMPT = `You are a reading content analyzer. Analyze the following web content and provide a structured analysis.

Content:
---
{content}
---

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "title": "Extracted or improved title",
  "summary": "3-5 sentence summary of the main points",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "suggestedPriority": "high" | "medium" | "low",
  "estimatedReadingTime": <number in minutes>,
  "language": "detected language code (ko, en, etc.)"
}

Guidelines:
- Summary should capture the essential message
- Key insights should be actionable or memorable points
- Tags should be lowercase, single words or hyphenated phrases
- Priority should be based on: depth of content (high for deep analysis), relevance to knowledge building (high for foundational concepts), time-sensitivity (high for rapidly changing topics)
- Reading time is based on average reading speed (200 words/min for English, 500 characters/min for Korean)
- Detect content language and respond in the same language for summary and insights`;

export class AnalyzeUrlContentUseCase {
  private aiService: AIService | null;
  private costTracker: CostTracker;

  constructor(costTracker: CostTracker) {
    this.aiService = getAIService();
    this.costTracker = costTracker;
  }

  async execute(input: AnalyzeUrlContentInput): Promise<AnalyzeUrlContentOutput> {
    const emitter = getEventEmitter();
    emitter.emit('analysis:started', { itemId: input.itemId });

    try {
      // 1. Fetch URL content
      const parsed = await this.fetchAndParseUrl(input.url);
      if (!parsed.content) {
        return {
          success: false,
          error: 'Failed to extract content from URL',
        };
      }

      // 2. Check AI service
      if (!this.aiService) {
        return {
          success: false,
          error: 'AI service not initialized',
        };
      }

      // 3. Prepare content for analysis (truncate if too long)
      const contentForAnalysis = this.prepareContentForAnalysis(parsed);

      // 4. Generate analysis using LLM
      const prompt = ANALYSIS_PROMPT.replace('{content}', contentForAnalysis);
      const currentSpend = this.costTracker.getCurrentSpend();

      const response = await this.aiService.simpleGenerateForFeature(
        'url-analysis',
        prompt,
        undefined,
        { temperature: 0.3, maxTokens: 8192 },  // Reasoning models need more tokens
        currentSpend
      );

      if (!response.success) {
        emitter.emit('analysis:failed', { itemId: input.itemId, error: response.error || 'Unknown error' });
        return {
          success: false,
          error: response.error || 'Failed to analyze content',
        };
      }

      // 5. Parse LLM response
      const analysisResult = this.parseAnalysisResponse(response.content);
      if (!analysisResult) {
        emitter.emit('analysis:failed', { itemId: input.itemId, error: 'Failed to parse analysis response' });
        return {
          success: false,
          error: 'Failed to parse analysis response',
        };
      }

      // 6. Track cost
      if (response.tokensUsed) {
        const { provider: providerType, model } = this.aiService.getFeatureConfig('url-analysis');
        // Approximate input/output token split
        const inputTokens = Math.floor(response.tokensUsed * 0.7);
        const outputTokens = response.tokensUsed - inputTokens;
        this.costTracker.trackUsage(providerType, model, inputTokens, outputTokens, 'url-analysis');
      }

      // 7. Create ContentAnalysis entity
      const { provider: providerType, model } = this.aiService.getFeatureConfig('url-analysis');
      const analysis = ContentAnalysis.create({
        itemId: input.itemId,
        title: analysisResult.title || parsed.title,
        summary: analysisResult.summary,
        keyInsights: analysisResult.keyInsights,
        suggestedTags: this.mergeTags(analysisResult.suggestedTags, input.existingTags),
        suggestedPriority: analysisResult.suggestedPriority,
        estimatedReadingTime: analysisResult.estimatedReadingTime || this.estimateReadingTime(parsed.wordCount),
        language: analysisResult.language || input.language,
        provider: providerType,
        model: model,
        tokensUsed: response.tokensUsed,
      });

      emitter.emit('analysis:completed', { itemId: input.itemId, summary: analysis.summary });

      return {
        success: true,
        analysis,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      emitter.emit('analysis:failed', { itemId: input.itemId, error: errorMessage });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private async fetchAndParseUrl(url: string): Promise<ParsedContent> {
    try {
      const fetchPromise = requestUrl({
        url,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ObsidianReadingQueue/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout (15s)')), 15000)
      );
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      const html = response.text;
      return this.parseHtml(html, url);
    } catch (error) {
      console.error('Failed to fetch URL:', error);
      return {
        title: '',
        description: '',
        content: '',
        wordCount: 0,
      };
    }
  }

  private parseHtml(html: string, url: string): ParsedContent {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
    const title = ogTitleMatch?.[1] || titleMatch?.[1] || '';

    // Extract description
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
    const description = ogDescMatch?.[1] || descMatch?.[1] || '';

    // Extract main content (simplified - removes scripts, styles, and HTML tags)
    let content = html
      // Remove scripts and styles
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      // Remove navigation, header, footer, sidebar
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      // Try to extract article content
      .replace(/.*?(<article[^>]*>[\s\S]*?<\/article>).*/gi, '$1')
      // Remove remaining HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // If article extraction failed, just clean the whole content
    if (content.length < 100) {
      content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Count words (rough estimation)
    const wordCount = content.split(/\s+/).length;

    return {
      title: this.decodeHtmlEntities(title),
      description: this.decodeHtmlEntities(description),
      content: this.decodeHtmlEntities(content),
      wordCount,
    };
  }

  private decodeHtmlEntities(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  private prepareContentForAnalysis(parsed: ParsedContent): string {
    const maxChars = 8000; // Limit content for LLM context
    let content = `Title: ${parsed.title}\n\n`;

    if (parsed.description) {
      content += `Description: ${parsed.description}\n\n`;
    }

    content += `Content:\n${parsed.content}`;

    if (content.length > maxChars) {
      content = content.substring(0, maxChars) + '\n\n[Content truncated...]';
    }

    return content;
  }

  private parseAnalysisResponse(response: string): AnalysisResult | null {
    try {
      // Remove potential markdown code blocks
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);

      return {
        title: parsed.title,
        summary: parsed.summary || '',
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        suggestedTags: Array.isArray(parsed.suggestedTags)
          ? parsed.suggestedTags.map((t: string) => t.toLowerCase().trim())
          : [],
        suggestedPriority: this.normalizePriority(parsed.suggestedPriority),
        estimatedReadingTime: typeof parsed.estimatedReadingTime === 'number'
          ? parsed.estimatedReadingTime
          : undefined,
        language: parsed.language,
      };
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      return null;
    }
  }

  private normalizePriority(priority: string | undefined): PriorityLevelType | undefined {
    if (!priority) return undefined;
    const normalized = priority.toLowerCase().trim();
    if (['high', 'medium', 'low'].includes(normalized)) {
      return normalized as PriorityLevelType;
    }
    return undefined;
  }

  private mergeTags(suggested: string[], existing?: string[]): string[] {
    if (!existing || existing.length === 0) return suggested;

    const merged = new Set([...existing.map(t => t.toLowerCase()), ...suggested]);
    return Array.from(merged);
  }

  private estimateReadingTime(wordCount: number): number {
    // Average reading speed: 200 words per minute
    return Math.max(1, Math.ceil(wordCount / 200));
  }
}
