/**
 * OpenAI Provider
 * OpenAI API implementation (GPT-4o, GPT-4o-mini)
 */

import { BaseProvider } from './base-provider';
import type {
  AIProviderType,
  AIMessage,
  AIRequestOptions,
  AIProviderResponse,
} from '../../domain/interfaces/llm-provider';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  max_completion_tokens?: number;
  temperature?: number;
}

interface OpenAIResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
    code: string;
  };
}

export class OpenAIProvider extends BaseProvider {
  readonly id: AIProviderType = 'openai';
  readonly name = 'OpenAI';

  async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const model = this.config.defaultModel;
      const isReasoningModel = model.startsWith('gpt-5') || model.startsWith('o1') || model.startsWith('o3');

      const requestBody: Record<string, unknown> = {
        model,
        messages: [{ role: 'user', content: 'Hello' }],
      };

      // GPT-5.x and o-series models use max_completion_tokens instead of max_tokens
      if (isReasoningModel) {
        requestBody.max_completion_tokens = 10;
      } else {
        requestBody.max_tokens = 10;
      }

      const response = await this.makeRequest<OpenAIResponse>({
        url: `${this.config.endpoint}/chat/completions`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      return !response.error && response.choices && response.choices.length > 0;
    } catch {
      return false;
    }
  }

  async generateText(
    messages: AIMessage[],
    apiKey: string,
    options?: AIRequestOptions
  ): Promise<AIProviderResponse> {
    const openaiMessages = this.convertMessages(messages);
    const model = options?.model || this.config.defaultModel;
    const isReasoningModel = model.startsWith('gpt-5') || model.startsWith('o1') || model.startsWith('o3');

    const requestBody: OpenAIRequest = {
      model,
      messages: openaiMessages,
      temperature: options?.temperature ?? 0.7,
    };

    // GPT-5.x and o-series models use max_completion_tokens instead of max_tokens
    if (isReasoningModel) {
      requestBody.max_completion_tokens = options?.maxTokens ?? 4096;
    } else {
      requestBody.max_tokens = options?.maxTokens ?? 4096;
    }

    try {
      console.log(`[OpenAIProvider] Making API request:`, {
        model: requestBody.model,
        isReasoningModel,
        messageCount: requestBody.messages.length,
        maxTokensParam: isReasoningModel ? 'max_completion_tokens' : 'max_tokens',
        maxTokensValue: isReasoningModel ? requestBody.max_completion_tokens : requestBody.max_tokens,
      });

      const response = await this.makeRequest<OpenAIResponse>({
        url: `${this.config.endpoint}/chat/completions`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`[OpenAIProvider] Raw API response:`, {
        hasError: !!response.error,
        hasChoices: !!response.choices,
        choicesCount: response.choices?.length || 0,
        firstChoice: response.choices?.[0] ? {
          hasMessage: !!response.choices[0].message,
          messageContent: response.choices[0].message?.content?.substring(0, 200) || '(null or empty)',
          messageContentType: typeof response.choices[0].message?.content,
          finishReason: response.choices[0].finish_reason,
        } : null,
        usage: response.usage,
        fullResponse: JSON.stringify(response).substring(0, 1000),
      });

      if (response.error) {
        return {
          success: false,
          content: '',
          error: response.error.message,
          errorCode: response.error.code || response.error.type,
        };
      }

      if (!response.choices || response.choices.length === 0) {
        return {
          success: false,
          content: '',
          error: 'No response generated',
          errorCode: 'EMPTY_RESPONSE',
        };
      }

      const generatedText = response.choices[0].message.content || '';

      return {
        success: true,
        content: generatedText,
        tokensUsed: response.usage?.total_tokens,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private convertMessages(messages: AIMessage[]): OpenAIMessage[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }
}
