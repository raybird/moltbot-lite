export declare class GeminiAgent {
    /**
     * 清除輸出中的 <thinking> 區塊和其他雜訊
     */
    private cleanOutput;
    /**
     * 生成文字的摘要 (使用 JSON 格式化輸出縮小 Token)
     */
    summarize(text: string): Promise<string>;
    /**
     * 呼叫系統的 gemini-cli 處理訊息
     * @param prompt 使用者的輸入
     * @returns Gemini 的回應文字
     */
    chat(prompt: string): Promise<string>;
}
//# sourceMappingURL=gemini.d.ts.map