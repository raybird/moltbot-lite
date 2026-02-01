import fs from 'fs';
import yaml from 'js-yaml';
import { GeminiAgent } from './gemini.js';
import { OpencodeAgent } from './opencode.js';

export interface AIAgentOptions {
    model?: string;
}

export interface AIAgent {
    chat(prompt: string, options?: AIAgentOptions): Promise<string>;
    summarize(text: string, options?: AIAgentOptions): Promise<string>;
}

interface AIConfig {
    provider?: string;
    model?: string | undefined;
}

/**
 * DynamicAIAgent 動態代理人
 * 每次呼叫時重新讀取 ai-config.yaml 來決定使用哪個 provider
 */
export class DynamicAIAgent implements AIAgent {
    private geminiAgent: GeminiAgent;
    private opencodeAgent: OpencodeAgent;
    private configPath: string;

    constructor(configPath = 'ai-config.yaml') {
        this.configPath = configPath;
        this.geminiAgent = new GeminiAgent();
        this.opencodeAgent = new OpencodeAgent();
    }

    /**
     * 載入設定檔
     * 若檔案不存在或解析失敗，回退至預設值 { provider: 'gemini' }
     */
    private loadProviderConfig(): AIConfig {
        try {
            const fileContent = fs.readFileSync(this.configPath, 'utf8');
            const config = yaml.load(fileContent) as AIConfig;
            return {
                provider: config?.provider || 'gemini',
                model: config?.model
            };
        } catch (error) {
            // 檔案不存在或解析失敗，使用預設值
            return { provider: 'gemini' };
        }
    }

    async chat(prompt: string, options?: AIAgentOptions): Promise<string> {
        const config = this.loadProviderConfig();
        console.log(`[DynamicAgent] Provider: ${config.provider}, Model: ${config.model || 'default'}`);

        const mergedOptions: AIAgentOptions = {};

        const modelValue = options?.model || config.model;
        if (modelValue) {
            mergedOptions.model = modelValue;
        }

        if (config.provider === 'opencode') {
            return this.opencodeAgent.chat(prompt, mergedOptions);
        }
        return this.geminiAgent.chat(prompt, mergedOptions);
    }

    async summarize(text: string, options?: AIAgentOptions): Promise<string> {
        const config = this.loadProviderConfig();
        const mergedOptions: AIAgentOptions = {};

        const modelValue = options?.model || config.model;
        if (modelValue) {
            mergedOptions.model = modelValue;
        }

        if (config.provider === 'opencode') {
            return this.opencodeAgent.summarize(text, mergedOptions);
        }
        return this.geminiAgent.summarize(text, mergedOptions);
    }
}
