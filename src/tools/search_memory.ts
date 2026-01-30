#!/usr/bin/env node
import Database from 'better-sqlite3';
import path from 'path';

/**
 * 搜尋記憶工具 - 供 AI 主動呼叫
 * 使用方式：node dist/tools/search_memory.js "關鍵字"
 */

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('❌ 缺少搜尋關鍵字');
        console.error('使用範例：node dist/tools/search_memory.js "API 問題"');
        process.exit(1);
    }

    const query = args.join(' ');
    const userId = process.env.ALLOWED_USER_ID;

    if (!userId) {
        console.error('❌ 缺少 ALLOWED_USER_ID 環境變數');
        process.exit(1);
    }

    // 連接資料庫 (唯讀模式)
    const dbPath = path.resolve(process.cwd(), 'moltbot.db');
    const db = new Database(dbPath, { readonly: true });

    try {
        const stmt = db.prepare(`
      SELECT m.role, m.content, m.timestamp
      FROM messages_fts f
      INNER JOIN messages m ON f.rowid = m.id
      WHERE f.user_id = ? AND f.content MATCH ?
      ORDER BY m.timestamp DESC
      LIMIT 5
    `);

        const results = stmt.all(userId, query) as Array<{
            role: string;
            content: string;
            timestamp: number;
        }>;

        if (results.length === 0) {
            console.log('🔍 沒有找到相關的對話記錄。');
            process.exit(0);
        }

        console.log(`🔍 找到 ${results.length} 則相關對話：\n`);

        results.forEach((row, idx) => {
            const date = new Date(row.timestamp).toLocaleString('zh-TW');
            const roleName = row.role === 'user' ? '使用者' : 'AI';
            const preview = row.content.substring(0, 150);

            console.log(`${idx + 1}. [${date}] ${roleName}:`);
            console.log(`   ${preview}${row.content.length > 150 ? '...' : ''}\n`);
        });

    } catch (error: any) {
        console.error('❌ 搜尋失敗:', error.message);
        process.exit(1);
    } finally {
        db.close();
    }
}

main();
