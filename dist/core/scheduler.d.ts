import { MemoryManager, type Schedule } from './memory.js';
import { GeminiAgent } from './gemini.js';
import type { Connector } from '../types/index.js';
export declare class Scheduler {
    private jobs;
    private systemJobs;
    private silenceTimers;
    private readonly SILENCE_TIMEOUT_MS;
    private memory;
    private gemini;
    private connector;
    constructor(memory: MemoryManager, gemini: GeminiAgent, connector: Connector);
    /**
     * 初始化排程器：從資料庫載入所有啟用的排程並啟動
     */
    init(): Promise<void>;
    /**
     * 初始化系統預設排程 (如每日摘要)
     */
    private initSystemSchedules;
    /**
     * 啟動一個 cron 任務
     * @param schedule 排程資料
     */
    private startJob;
    /**
     * 從 MCP Memory 檢索長期記憶
     * 呼叫 retrieve-memory.sh 並解析結果
     */
    private retrieveLongTermMemory;
    /**
     * 執行排程任務
     */
    private executeTask;
    /**
     * 新增排程並立即啟動
     */
    addSchedule(userId: string, name: string, cron: string, prompt: string): number;
    /**
     * 刪除排程並停止對應的 Job
     */
    removeSchedule(id: number): void;
    /**
     * 取得所有排程（供使用者查詢）
     */
    listSchedules(userId: string): Schedule[];
    /**
     * 停止所有排程（於程式關閉時調用）
     */
    shutdown(): void;
    /**
     * 重置使用者的沉默計時器 (每次收到訊息時呼叫)
     */
    resetSilenceTimer(userId: string): void;
    /**
     * 觸發反思任務
     * @param userId 使用者 ID
     * @param type 觸發類型
     * @param messageIdToEdit 如果提供，結果將會編輯此訊息而不是發送新訊息
     */
    triggerReflection(userId: string, type?: 'silence' | 'manual', messageIdToEdit?: string): Promise<void>;
    /**
     * 執行每日摘要
     */
    private executeDailySummary;
}
//# sourceMappingURL=scheduler.d.ts.map