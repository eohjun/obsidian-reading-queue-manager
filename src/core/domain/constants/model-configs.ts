/**
 * Model Configurations
 *
 * Re-exports shared configs from obsidian-llm-shared (single source of truth)
 * and adds plugin-specific types, constants, and helpers.
 */

import {
  type AIProviderType as SharedAIProviderType,
  type AIProviderConfig as SharedAIProviderConfig,
  type ModelConfig as SharedModelConfig,
  AI_PROVIDERS as SHARED_AI_PROVIDERS,
  MODEL_CONFIGS as SHARED_MODEL_CONFIGS,
  getModelsByProvider as sharedGetModelsByProvider,
  getModelConfig,
  calculateCost as sharedCalculateCost,
} from 'obsidian-llm-shared';

import type { FeatureType } from '../interfaces/llm-provider';

// Note: AIProviderType and AIProviderConfig are NOT re-exported here
// to avoid conflicts with the canonical exports in ../interfaces/llm-provider.ts.

// ── Plugin-specific tier extension ───────────────────────────────────

export type ModelTier = 'economy' | 'standard' | 'premium';

/** Extended ModelConfig that includes the plugin-local `tier` field. */
export interface ModelConfig extends SharedModelConfig {
  tier: ModelTier;
  maxInputTokens: number;
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsStreaming: boolean;
}

/**
 * Tier classification based on input cost per 1M tokens.
 * premium >= 2.0, standard >= 0.2, economy < 0.2
 */
function inferTier(cost: number): ModelTier {
  if (cost >= 2.0) return 'premium';
  if (cost >= 0.2) return 'standard';
  return 'economy';
}

/** Build an extended ModelConfig from the shared one. */
function extendModelConfig(shared: SharedModelConfig): ModelConfig {
  return {
    ...shared,
    tier: inferTier(shared.inputCostPer1M),
    maxInputTokens: shared.contextWindow,
    maxOutputTokens: shared.defaultCompletionTokens,
    supportsVision: true,
    supportsStreaming: true,
  };
}

// ── Extended MODEL_CONFIGS with tier ─────────────────────────────────

export const MODEL_CONFIGS: Record<string, ModelConfig> = Object.fromEntries(
  Object.entries(SHARED_MODEL_CONFIGS).map(([key, cfg]) => [key, extendModelConfig(cfg)])
);

// ── Re-export AI_PROVIDERS ───────────────────────────────────────────

export const AI_PROVIDERS = SHARED_AI_PROVIDERS;

// ── Default models per feature (plugin-specific) ─────────────────────

export const FEATURE_DEFAULT_MODELS: Record<FeatureType, Record<SharedAIProviderType, string>> = {
  'url-analysis': {
    claude: 'claude-haiku-4-5-20251001',
    gemini: 'gemini-2.0-flash',
    openai: 'gpt-5-nano',
    grok: 'grok-4-1-fast-non-reasoning',
  },
  'tag-suggestion': {
    claude: 'claude-haiku-4-5-20251001',
    gemini: 'gemini-2.0-flash',
    openai: 'gpt-5-nano',
    grok: 'grok-4-1-fast-non-reasoning',
  },
  'insight-extraction': {
    claude: 'claude-sonnet-4-6',
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-5-mini',
    grok: 'grok-4-1-fast',
  },
};

// ── Helper functions ─────────────────────────────────────────────────

/**
 * Calculate estimated cost for token usage.
 * Delegates to the shared package.
 */
export function calculateCost(
  modelKey: string,
  inputTokens: number,
  outputTokens: number
): number {
  return sharedCalculateCost(modelKey, inputTokens, outputTokens);
}

/**
 * Get models for a specific provider (returns extended ModelConfig with tier).
 */
export function getModelsByProvider(provider: SharedAIProviderType): ModelConfig[] {
  return Object.values(MODEL_CONFIGS).filter((m) => m.provider === provider);
}

/**
 * Get model configuration by model ID (searches by .id field).
 * Alias for shared getModelConfig, extended with tier.
 */
export function getModelConfigById(modelId: string): ModelConfig | undefined {
  const shared = getModelConfig(modelId);
  if (!shared) return undefined;
  return extendModelConfig(shared);
}

/**
 * Estimate token count from text.
 * Rough approximation: ~4 chars = 1 token for English, ~2 chars = 1 token for Korean.
 */
export function estimateTokens(text: string): number {
  const koreanChars = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
  const otherChars = text.length - koreanChars;
  return Math.ceil(koreanChars / 2 + otherChars / 4);
}

/**
 * Get default model for a specific feature and provider.
 */
export function getDefaultModelForFeature(
  feature: FeatureType,
  provider: SharedAIProviderType
): string {
  return FEATURE_DEFAULT_MODELS[feature][provider];
}

/**
 * Get models by tier.
 */
export function getModelsByTier(tier: ModelTier): ModelConfig[] {
  return Object.values(MODEL_CONFIGS).filter((m) => m.tier === tier);
}
