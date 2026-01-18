// 検索履歴管理サービス
// IndexedDBに履歴を保存し、JSONファイルとしてエクスポート可能

const DB_NAME = 'ApiaryDB';
const DB_VERSION = 2; // バージョンアップしてhistoryストアを追加
const HISTORY_STORE = 'searchHistory';

let db = null;

/**
 * IndexedDBを初期化（historyストア付き）
 */
export async function initHistoryDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('IndexedDBの初期化に失敗しました'));
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // 既存のapisストア（バージョン1で作成済みの場合はスキップ）
            if (!database.objectStoreNames.contains('apis')) {
                const apiStore = database.createObjectStore('apis', { keyPath: 'id' });
                apiStore.createIndex('category', 'category', { unique: false });
                apiStore.createIndex('searchKeyword', 'searchKeyword', { unique: false });
                apiStore.createIndex('createdAt', 'createdAt', { unique: false });
                apiStore.createIndex('status', 'status', { unique: false });
            }

            // 履歴ストアを追加
            if (!database.objectStoreNames.contains(HISTORY_STORE)) {
                const historyStore = database.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
                historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                historyStore.createIndex('keyword', 'keyword', { unique: false });
                historyStore.createIndex('type', 'type', { unique: false });
            }
        };
    });
}

/**
 * データベース接続を取得
 */
async function getDB() {
    if (!db) {
        await initHistoryDB();
    }
    return db;
}

/**
 * 検索履歴を保存
 * @param {Object} historyEntry - 履歴エントリ
 */
export async function saveSearchHistory(historyEntry) {
    const database = await getDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([HISTORY_STORE], 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE);
        const request = store.add(historyEntry);

        request.onsuccess = () => {
            resolve(historyEntry);
        };

        request.onerror = () => {
            reject(new Error('履歴の保存に失敗しました'));
        };
    });
}

/**
 * 全ての検索履歴を取得（新しい順）
 * @returns {Promise<Array>} 履歴の配列
 */
export async function getAllHistory() {
    const database = await getDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([HISTORY_STORE], 'readonly');
        const store = transaction.objectStore(HISTORY_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
            const history = request.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(history);
        };

        request.onerror = () => {
            reject(new Error('履歴の取得に失敗しました'));
        };
    });
}

/**
 * 指定したIDの履歴を取得
 * @param {string} id - 履歴ID
 * @returns {Promise<Object>} 履歴エントリ
 */
export async function getHistoryById(id) {
    const database = await getDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([HISTORY_STORE], 'readonly');
        const store = transaction.objectStore(HISTORY_STORE);
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(new Error('履歴の取得に失敗しました'));
        };
    });
}

/**
 * 履歴を削除
 * @param {string} id - 履歴ID
 */
export async function deleteHistory(id) {
    const database = await getDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([HISTORY_STORE], 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(new Error('履歴の削除に失敗しました'));
        };
    });
}

/**
 * 全ての履歴を削除
 */
export async function clearAllHistory() {
    const database = await getDB();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction([HISTORY_STORE], 'readwrite');
        const store = transaction.objectStore(HISTORY_STORE);
        const request = store.clear();

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(new Error('履歴のクリアに失敗しました'));
        };
    });
}

/**
 * 履歴をJSONファイルとしてエクスポート
 * @returns {Promise<string>} JSON文字列
 */
export async function exportHistoryToJson() {
    const history = await getAllHistory();

    const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        totalRecords: history.length,
        history: history.map((entry) => ({
            id: entry.id,
            timestamp: entry.timestamp,
            timestampFormatted: new Date(entry.timestamp).toLocaleString('ja-JP'),
            type: entry.type,
            keyword: entry.keyword,
            model: entry.model,
            prompt: entry.prompt,
            response: entry.response,
            resultCount: entry.resultCount,
            tokenUsage: entry.tokenUsage,
            processingTime: entry.processingTime,
            success: entry.success,
            error: entry.error || null
        }))
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * JSONファイルをダウンロード
 */
export async function downloadHistoryJson() {
    const json = await exportHistoryToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `apiary-search-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 履歴の統計情報を取得
 * @returns {Promise<Object>} 統計情報
 */
export async function getHistoryStats() {
    const history = await getAllHistory();

    const stats = {
        totalSearches: history.length,
        successfulSearches: history.filter((h) => h.success).length,
        failedSearches: history.filter((h) => !h.success).length,
        totalApisFound: history.reduce((sum, h) => sum + (h.resultCount || 0), 0),
        totalTokensUsed: history.reduce((sum, h) => {
            if (h.tokenUsage) {
                return sum + (h.tokenUsage.promptTokens || 0) + (h.tokenUsage.completionTokens || 0);
            }
            return sum;
        }, 0),
        averageProcessingTime: history.length > 0
            ? Math.round(history.reduce((sum, h) => sum + (h.processingTime || 0), 0) / history.length)
            : 0,
        topKeywords: getTopKeywords(history, 5),
        recentSearches: history.slice(0, 10)
    };

    return stats;
}

/**
 * よく使われるキーワードを取得
 */
function getTopKeywords(history, limit) {
    const keywordCount = {};

    history.forEach((entry) => {
        const keyword = entry.keyword?.toLowerCase();
        if (keyword) {
            keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
        }
    });

    return Object.entries(keywordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([keyword, count]) => ({ keyword, count }));
}
