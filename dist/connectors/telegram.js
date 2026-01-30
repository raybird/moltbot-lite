import { Telegraf } from 'telegraf';
import { Agent } from 'https';
import { createConnection } from 'net';
export class TelegramConnector {
    name = 'Telegram';
    bot;
    messageHandler = null;
    allowedUserIds;
    token;
    constructor(token, allowedUserIds) {
        this.token = token;
        this.allowedUserIds = allowedUserIds;
    }
    splitMessage(text, limit = 4096) {
        const chunks = [];
        let currentChunk = '';
        const lines = text.split('\n');
        for (const line of lines) {
            if (currentChunk.length + line.length + 1 > limit) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = '';
                }
                // If a single line is too long, force split it
                if (line.length > limit) {
                    for (let i = 0; i < line.length; i += limit) {
                        chunks.push(line.substring(i, i + limit));
                    }
                }
                else {
                    currentChunk = line;
                }
            }
            else {
                currentChunk += (currentChunk ? '\n' : '') + line;
            }
        }
        if (currentChunk) {
            chunks.push(currentChunk);
        }
        return chunks.length > 0 ? chunks : [text];
    }
    probeIPv6() {
        return new Promise((resolve) => {
            const socket = createConnection({
                host: 'api.telegram.org',
                port: 443,
                family: 6,
                timeout: 2000 // 2s connection timeout
            });
            socket.on('connect', () => {
                socket.end();
                resolve(true);
            });
            socket.on('error', () => {
                socket.destroy();
                resolve(false);
            });
            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });
        });
    }
    async initialize() {
        const ipv6Available = await this.probeIPv6();
        const family = ipv6Available ? undefined : 4;
        console.log(`[Telegram] Network probe: IPv6 is ${ipv6Available ? 'available' : 'unreachable'}. using IPv${family || 6}`);
        this.bot = new Telegraf(this.token, {
            telegram: {
                agent: new Agent({ keepAlive: true, family })
            }
        });
        console.log(`[Telegram] Initializing with allowed users: ${this.allowedUserIds.join(', ')}`);
        this.bot.on('text', async (ctx) => {
            const userId = ctx.from.id.toString();
            // 白名單檢查
            if (!this.allowedUserIds.includes(userId)) {
                console.warn(`[Telegram] Blocked unauthorized access from: ${userId} (${ctx.from.first_name})`);
                return;
            }
            if (this.messageHandler) {
                const unifiedMsg = {
                    id: ctx.message.message_id.toString(),
                    content: ctx.message.text,
                    sender: {
                        id: userId,
                        name: ctx.from.first_name || 'Unknown',
                        platform: 'telegram'
                    },
                    timestamp: ctx.message.date * 1000,
                    raw: ctx.message
                };
                this.messageHandler(unifiedMsg);
            }
        });
        this.bot.launch(() => {
            console.log('[Telegram] Bot launched successfully!');
        });
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
    onMessage(handler) {
        this.messageHandler = handler;
    }
    async sendMessage(chatId, text) {
        try {
            const chunks = this.splitMessage(text);
            for (const chunk of chunks) {
                await this.bot.telegram.sendMessage(chatId, chunk);
            }
        }
        catch (error) {
            console.error(`[Telegram] Failed to send message to ${chatId}:`, error);
        }
    }
    async sendPlaceholder(chatId, text) {
        try {
            const msg = await this.bot.telegram.sendMessage(chatId, text);
            return msg.message_id.toString();
        }
        catch (error) {
            console.error(`[Telegram] Failed to send placeholder to ${chatId}:`, error);
            return '';
        }
    }
    async editMessage(chatId, messageId, newText) {
        try {
            const chunks = this.splitMessage(newText);
            const firstChunk = chunks[0] || '';
            // 1. Edit the original message (placeholder) with the first chunk
            await this.bot.telegram.editMessageText(chatId, parseInt(messageId), undefined, firstChunk);
            // 2. Send remaining chunks as new messages
            if (chunks.length > 1) {
                for (let i = 1; i < chunks.length; i++) {
                    await this.bot.telegram.sendMessage(chatId, chunks[i]);
                }
            }
        }
        catch (error) {
            console.error(`[Telegram] Failed to edit message ${messageId}:`, error);
            // Fallback: try sending as new message(s) if edit fails
            await this.sendMessage(chatId, newText);
        }
    }
}
//# sourceMappingURL=telegram.js.map