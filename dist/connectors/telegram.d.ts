import type { Connector, UnifiedMessage } from '../types/index.js';
export declare class TelegramConnector implements Connector {
    name: string;
    private bot;
    private messageHandler;
    private allowedUserIds;
    private token;
    constructor(token: string, allowedUserIds: string[]);
    private splitMessage;
    private probeIPv6;
    initialize(): Promise<void>;
    onMessage(handler: (msg: UnifiedMessage) => void): void;
    sendMessage(chatId: string, text: string): Promise<void>;
    sendPlaceholder(chatId: string, text: string): Promise<string>;
    editMessage(chatId: string, messageId: string, newText: string): Promise<void>;
}
//# sourceMappingURL=telegram.d.ts.map