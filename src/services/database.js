// IndexedDB データベースサービス
const DB_NAME = 'ApiaryDB';
const DB_VERSION = 2; // バージョン2: historyストア追加
const STORE_NAME = 'apis';
const HISTORY_STORE = 'searchHistory';

let db = null;

/**
 * IndexedDBを初期化する
 */
export async function initDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

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

            // APIsストア
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('searchKeyword', 'searchKeyword', { unique: false });
                store.createIndex('createdAt', 'createdAt', { unique: false });
                store.createIndex('status', 'status', { unique: false });
            }

            // 履歴ストア (バージョン2で追加)
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
 * 全てのAPI情報を取得（createdAt降順）
 */
export async function getAllApis() {
    await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const apis = request.result.sort((a, b) => b.createdAt - a.createdAt);
            resolve(apis);
        };

        request.onerror = () => {
            reject(new Error('データの取得に失敗しました'));
        };
    });
}

/**
 * IDでAPI情報を取得
 */
export async function getApiById(id) {
    await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(new Error('データの取得に失敗しました'));
        };
    });
}

/**
 * API情報を保存
 */
export async function saveApi(apiData) {
    await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(apiData);

        request.onsuccess = () => {
            resolve(apiData);
        };

        request.onerror = () => {
            reject(new Error('データの保存に失敗しました'));
        };
    });
}

/**
 * 複数のAPI情報を一括保存
 */
export async function saveApis(apis) {
    await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        let completed = 0;
        const total = apis.length;

        apis.forEach((api) => {
            const request = store.put(api);

            request.onsuccess = () => {
                completed++;
                if (completed === total) {
                    resolve(apis);
                }
            };

            request.onerror = () => {
                reject(new Error('データの保存に失敗しました'));
            };
        });

        if (total === 0) {
            resolve([]);
        }
    });
}

/**
 * API情報を削除
 */
export async function deleteApi(id) {
    await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(new Error('データの削除に失敗しました'));
        };
    });
}

/**
 * 全データを削除
 */
export async function clearAllApis() {
    await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = () => {
            reject(new Error('データの削除に失敗しました'));
        };
    });
}

/**
 * データをJSON形式でエクスポート
 */
export async function exportToJson() {
    const apis = await getAllApis();
    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: apis
    };
    return JSON.stringify(exportData, null, 2);
}

/**
 * データをCSV形式でエクスポート
 */
export async function exportToCsv() {
    const apis = await getAllApis();
    const headers = ['name', 'category', 'provider', 'url', 'authType', 'pricing', 'description'];
    const csvRows = [headers.join(',')];

    apis.forEach((api) => {
        const row = headers.map((header) => {
            const value = api[header] || '';
            // CSVエスケープ処理
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

/**
 * データをMarkdown形式でエクスポート
 */
export async function exportToMarkdown() {
    const apis = await getAllApis();
    let markdown = '# Apiary - API Catalog\n\n';
    markdown += `> Exported at: ${new Date().toLocaleString()}\n\n`;

    apis.forEach((api) => {
        markdown += `## ${api.name}\n\n`;
        markdown += `**Provider:** ${api.provider}\n\n`;
        markdown += `**Category:** ${api.category}\n\n`;
        markdown += `**Description:** ${api.description}\n\n`;
        markdown += `**Auth Type:** ${api.authType} | **Pricing:** ${api.pricing}\n\n`;
        markdown += `**URL:** [${api.url}](${api.url})\n\n`;
        markdown += `---\n\n`;
    });

    return markdown;
}

/**
 * JSONファイルからデータをインポート
 */
export async function importFromJson(jsonString, mergeStrategy = 'skip') {
    try {
        const importData = JSON.parse(jsonString);

        // バリデーション
        if (!importData.data || !Array.isArray(importData.data)) {
            throw new Error('無効なファイル形式です');
        }

        const requiredFields = ['id', 'name', 'provider', 'category', 'description'];
        const validApis = importData.data.filter((api) => {
            return requiredFields.every((field) => api[field]);
        });

        if (validApis.length === 0) {
            throw new Error('有効なAPIデータが見つかりませんでした');
        }

        const existingApis = await getAllApis();
        const existingIds = new Set(existingApis.map((a) => a.id));
        const existingNames = new Set(existingApis.map((a) => a.name.toLowerCase()));

        const apisToSave = [];

        for (const api of validApis) {
            const isDuplicate = existingIds.has(api.id) || existingNames.has(api.name.toLowerCase());

            if (!isDuplicate) {
                apisToSave.push(api);
            } else if (mergeStrategy === 'newer') {
                // タイムスタンプが新しい方を優先
                const existing = existingApis.find((e) => e.id === api.id || e.name.toLowerCase() === api.name.toLowerCase());
                if (existing && api.createdAt > existing.createdAt) {
                    apisToSave.push(api);
                }
            }
            // 'skip' の場合は何もしない
        }

        await saveApis(apisToSave);

        return {
            imported: apisToSave.length,
            skipped: validApis.length - apisToSave.length,
            total: validApis.length
        };
    } catch (error) {
        throw new Error(`インポートに失敗しました: ${error.message}`);
    }
}
