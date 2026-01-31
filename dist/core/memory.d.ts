export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}
export interface Schedule {
    id: number;
    user_id: string;
    name: string;
    cron: string;
    prompt: string;
    created_at: number;
    is_active: boolean;
}
export declare class MemoryManager {
    private db;
    private readonly MAX_HISTORY;
    constructor();
    private resolveDbPath;
    private initTable;
    /**
     * 新增訊息到資料庫
     */
    addMessage(userId: string, role: 'user' | 'model', content: string, summary?: string): void;
    /**
     * 取得格式化後的歷史紀錄 Prompt
     * 讀取該使用者最近 N 筆對話
     * 優先使用 summary（若存在），否則使用完整 content
     */
    getHistoryContext(userId: string): string;
    /**
     * 使用 FTS5 全文檢索搜尋對話
     */
    search(userId: string, query: string, limit?: number): ChatMessage[];
    /**
     * 清除特定使用者的記憶
     */
    clear(userId: string): void;
    /**
     * 新增排程任務
     */
    addSchedule(userId: string, name: string, cron: string, prompt: string): number;
    /**
     * 取得所有啟用中的排程
     */
    getActiveSchedules(): Schedule[];
    /**
     * 取得特定使用者的所有排程
     */
    getUserSchedules(userId: string): Schedule[];
    /**
     * 刪除排程
     */
    removeSchedule(id: number): void;
    /**
     * 切換排程的啟用狀態
     */
    toggleSchedule(id: number, isActive: boolean): void;
    /**
     * 取得指定時間範圍內的對話歷史 (供反思系統使用)
     * @param userId 使用者 ID
     * @param hours 往前查詢的小時數
     */
    getExtendedHistory(userId: string, hours?: number): ChatMessage[];
    /**
     * 取得使用者最後一則訊息的時間戳
     * @param userId 使用者 ID
     * @returns 時間戳 (ms)，若無訊息則返回 0
     */
    getLastMessageTime(userId: string): number;
}
//# sourceMappingURL=memory.d.ts.map