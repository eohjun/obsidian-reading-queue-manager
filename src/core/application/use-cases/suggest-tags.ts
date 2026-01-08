/**
 * SuggestTagsUseCase
 * Suggests tags for reading items based on vault tags and content analysis
 */

import type { App } from 'obsidian';
import { getAIService, AIService } from '../services/ai-service';
import { CostTracker } from '../services/cost-tracker';

export interface SuggestTagsInput {
  content: string;
  existingTags?: string[];
  vaultTags?: string[];
  limit?: number;
}

export interface SuggestTagsOutput {
  success: boolean;
  suggestedTags: string[];
  error?: string;
}

const TAG_SUGGESTION_PROMPT = `You are a PKM (Personal Knowledge Management) tag suggester.

Analyze the following content and suggest relevant tags.

Content:
---
{content}
---

Existing vault tags for reference (prefer these when appropriate):
{vaultTags}

Current tags on this item:
{existingTags}

Requirements:
1. Suggest 3-5 relevant tags
2. Prefer existing vault tags when they match the content well
3. Create new tags only when existing tags don't cover important concepts
4. Tags should be lowercase, single words or hyphenated phrases
5. Focus on topics, themes, and key concepts

Respond ONLY with a JSON array of tag strings, no markdown:
["tag1", "tag2", "tag3"]`;

export class SuggestTagsUseCase {
  private aiService: AIService | null;
  private costTracker: CostTracker;
  private app: App;

  constructor(app: App, costTracker: CostTracker) {
    this.app = app;
    this.aiService = getAIService();
    this.costTracker = costTracker;
  }

  async execute(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
    try {
      // Collect vault tags if not provided
      const vaultTags = input.vaultTags || this.collectVaultTags();

      if (!this.aiService) {
        // Fallback: return simple keyword-based suggestions
        return {
          success: true,
          suggestedTags: this.fallbackTagSuggestion(input.content, vaultTags),
        };
      }

      const prompt = TAG_SUGGESTION_PROMPT
        .replace('{content}', input.content.substring(0, 4000))
        .replace('{vaultTags}', vaultTags.slice(0, 50).join(', ') || 'None')
        .replace('{existingTags}', input.existingTags?.join(', ') || 'None');

      const currentSpend = this.costTracker.getCurrentSpend();
      const response = await this.aiService.simpleGenerateForFeature(
        'tag-suggestion',
        prompt,
        undefined,
        { temperature: 0.3, maxTokens: 4096 },  // Reasoning models need more tokens
        currentSpend
      );

      if (!response.success) {
        return {
          success: false,
          suggestedTags: [],
          error: response.error || 'Failed to get tag suggestions',
        };
      }

      // Parse response
      const tags = this.parseTagResponse(response.content);

      // Track cost
      if (response.tokensUsed) {
        const { provider, model } = this.aiService.getFeatureConfig('tag-suggestion');
        const inputTokens = Math.floor(response.tokensUsed * 0.7);
        const outputTokens = response.tokensUsed - inputTokens;
        this.costTracker.trackUsage(provider, model, inputTokens, outputTokens, 'tag-suggestion');
      }

      // Filter out existing tags and limit
      const limit = input.limit || 5;
      const existingSet = new Set((input.existingTags || []).map(t => t.toLowerCase()));
      const uniqueTags = tags
        .filter(t => !existingSet.has(t.toLowerCase()))
        .slice(0, limit);

      return {
        success: true,
        suggestedTags: uniqueTags,
      };
    } catch (error) {
      return {
        success: false,
        suggestedTags: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private collectVaultTags(): string[] {
    const tags = new Set<string>();
    const files = this.app.vault.getMarkdownFiles();

    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      if (cache?.tags) {
        for (const tag of cache.tags) {
          tags.add(tag.tag.replace('#', '').toLowerCase());
        }
      }
      if (cache?.frontmatter?.tags) {
        const fmTags = cache.frontmatter.tags;
        if (Array.isArray(fmTags)) {
          for (const tag of fmTags) {
            if (typeof tag === 'string') {
              tags.add(tag.toLowerCase());
            }
          }
        } else if (typeof fmTags === 'string') {
          tags.add(fmTags.toLowerCase());
        }
      }
    }

    return Array.from(tags).sort();
  }

  private parseTagResponse(response: string): string[] {
    try {
      let cleaned = response.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```$/g, '');
      }
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((t): t is string => typeof t === 'string')
          .map(t => t.toLowerCase().trim())
          .filter(t => t.length > 0);
      }
      return [];
    } catch {
      // Try to extract tags from plain text
      return response
        .split(/[,\n]/)
        .map(t => t.replace(/["\[\]#]/g, '').trim().toLowerCase())
        .filter(t => t.length > 0 && t.length < 30);
    }
  }

  private fallbackTagSuggestion(content: string, vaultTags: string[]): string[] {
    // Simple keyword matching fallback
    const contentLower = content.toLowerCase();
    const matched: string[] = [];

    for (const tag of vaultTags) {
      if (contentLower.includes(tag) && matched.length < 5) {
        matched.push(tag);
      }
    }

    return matched;
  }
}
