// Gemini API サービス
import { v4 as uuidv4 } from 'uuid';
import { saveSearchHistory } from './history';

const API_TIMEOUT = 180000; // 180秒 (3分)
const DEFAULT_MODEL = 'gemini-3-flash-preview';
const MODEL_STORAGE_KEY = 'gemini_model_name';

/**
 * 現在選択されているモデル名を取得
 */
export function getModelName() {
    return localStorage.getItem(MODEL_STORAGE_KEY) || DEFAULT_MODEL;
}

/**
 * モデル名を設定
 */
export function setModelName(modelName) {
    localStorage.setItem(MODEL_STORAGE_KEY, modelName);
}

/**
 * 利用可能なモデル一覧を取得
 */
export async function fetchAvailableModels() {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error('APIキーが設定されていません');
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'モデル一覧の取得に失敗しました');
        }

        const data = await response.json();

        // generateContent をサポートするモデルのみフィルタリング
        const generativeModels = data.models
            ?.filter((model) =>
                model.supportedGenerationMethods?.includes('generateContent')
            )
            .map((model) => ({
                name: model.name.replace('models/', ''),
                displayName: model.displayName,
                description: model.description,
                inputTokenLimit: model.inputTokenLimit,
                outputTokenLimit: model.outputTokenLimit
            }))
            .sort((a, b) => {
                // gemini-3 を最優先
                if (a.name.includes('gemini-3') && !b.name.includes('gemini-3')) return -1;
                if (!a.name.includes('gemini-3') && b.name.includes('gemini-3')) return 1;
                // gemini-2.5 を次に優先
                if (a.name.includes('gemini-2.5') && !b.name.includes('gemini-2.5')) return -1;
                if (!a.name.includes('gemini-2.5') && b.name.includes('gemini-2.5')) return 1;
                // gemini-2.0 を次に優先
                if (a.name.includes('gemini-2') && !b.name.includes('gemini-2')) return -1;
                if (!a.name.includes('gemini-2') && b.name.includes('gemini-2')) return 1;
                // flash を優先
                if (a.name.includes('flash') && !b.name.includes('flash')) return -1;
                if (!a.name.includes('flash') && b.name.includes('flash')) return 1;
                return a.name.localeCompare(b.name);
            }) || [];

        return generativeModels;
    } catch (error) {
        console.error('モデル一覧取得エラー:', error);
        throw error;
    }
}

/**
 * APIキーを取得（ローカルストレージから）
 */
export function getApiKey() {
    return localStorage.getItem('gemini_api_key') || '';
}

/**
 * APIキーを保存
 */
export function setApiKey(key) {
    localStorage.setItem('gemini_api_key', key);
}

/**
 * キーワードからAPI情報を検索・生成
 * @param {string} keyword - 検索キーワード
 * @param {boolean} saveHistory - 履歴を保存するかどうか（デフォルト: true）
 * @returns {Promise<{apis: Array, historyEntry: Object}>} - API配列と履歴エントリ
 */
export async function searchApis(keyword, saveHistory = true) {
    const apiKey = getApiKey();
    const startTime = performance.now();

    if (!apiKey) {
        throw new Error('Gemini APIキーが設定されていません。設定画面からAPIキーを登録してください。');
    }

    const prompt = `あなたは熟練したAPIリサーチャーです。以下のキーワードに関連する実在するWeb APIを3〜5件調査し、詳細情報を提供してください。

キーワード: "${keyword}"

以下のJSON形式で、配列として返してください。JSONのみを返し、他の説明文は不要です。

{
  "apis": [
    {
      "name": "API名",
      "provider": "開発元企業・団体",
      "category": "カテゴリ (例: Finance, Weather, Social, Maps, AI, E-commerce等)",
      "description": "100文字以内の短い概要",
      "longDescription": "詳細な解説（機能や特徴を300文字程度で）",
      "useCases": ["ユースケース1", "ユースケース2", "ユースケース3"],
      "authType": "認証方式 (例: API Key, OAuth 2.0, Basic Auth, None)",
      "pricing": "価格モデル (例: Free, Freemium, Paid, Enterprise)",
      "url": "公式サイトURL",
      "endpointExample": "代表的なエンドポイントパス (例: /v1/users)",
      "responseExample": {"サンプルレスポンスのJSONオブジェクト": "値"},
      "status": "active"
    }
  ]
}

重要:
- 実在するAPIのみを含めてください
- URLは正確な公式サイトのURLを記載してください
- JSONのみを返し、マークダウンの装飾は不要です`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // 履歴エントリの初期化
    const historyEntry = {
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'search',
        keyword: keyword,
        model: getModelName(),
        prompt: prompt,
        response: null,
        resultCount: 0,
        tokenUsage: null,
        processingTime: 0,
        success: false,
        error: null
    };

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${getModelName()}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 65536,
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json();
            const errorMessage = error.error?.message || 'APIリクエストに失敗しました';

            // エラー時も履歴に記録
            historyEntry.processingTime = Math.round(performance.now() - startTime);
            historyEntry.error = errorMessage;
            if (saveHistory) {
                await saveSearchHistory(historyEntry);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        // 処理時間を計算
        const processingTime = Math.round(performance.now() - startTime);

        // トークン使用量を取得（利用可能な場合）
        const tokenUsage = {
            promptTokens: data.usageMetadata?.promptTokenCount || null,
            completionTokens: data.usageMetadata?.candidatesTokenCount || null,
            totalTokens: data.usageMetadata?.totalTokenCount || null
        };

        if (!text) {
            historyEntry.processingTime = processingTime;
            historyEntry.tokenUsage = tokenUsage;
            historyEntry.error = 'AIからの応答が空でした';
            if (saveHistory) {
                await saveSearchHistory(historyEntry);
            }
            throw new Error('AIからの応答が空でした');
        }

        const parsed = parseAiJson(text);
        const apis = parsed.apis || [];

        // 履歴エントリを完成
        historyEntry.response = text;
        historyEntry.resultCount = apis.length;
        historyEntry.tokenUsage = tokenUsage;
        historyEntry.processingTime = processingTime;
        historyEntry.success = true;

        // 履歴を保存
        if (saveHistory) {
            await saveSearchHistory(historyEntry);
        }

        // APIと履歴エントリを返す
        return apis;
    } catch (error) {
        clearTimeout(timeoutId);

        const processingTime = Math.round(performance.now() - startTime);

        if (error.name === 'AbortError') {
            historyEntry.processingTime = processingTime;
            historyEntry.error = 'リクエストがタイムアウトしました（60秒）';
            if (saveHistory) {
                await saveSearchHistory(historyEntry);
            }
            throw new Error('リクエストがタイムアウトしました（60秒）');
        }

        // その他のエラーで履歴が未保存の場合
        if (!historyEntry.error) {
            historyEntry.processingTime = processingTime;
            historyEntry.error = error.message;
            if (saveHistory) {
                await saveSearchHistory(historyEntry);
            }
        }

        throw error;
    }
}

/**
 * URLからAPI情報を分析・抽出
 * @param {string} url - 分析するAPIドキュメントのURL
 * @param {boolean} saveToHistory - 履歴を保存するかどうか（デフォルト: true）
 * @returns {Promise<Object>} - 抽出されたAPI情報
 */
export async function analyzeUrlForApi(url, saveToHistory = true) {
    const apiKey = getApiKey();
    const startTime = performance.now();

    if (!apiKey) {
        throw new Error('Gemini APIキーが設定されていません。設定画面からAPIキーを登録してください。');
    }

    // URLの検証
    try {
        new URL(url);
    } catch {
        throw new Error('無効なURLです。正しいURL形式で入力してください。');
    }

    const prompt = `あなたは熟練したAPIドキュメント分析エキスパートです。以下のURLはWeb APIに関するページです。このURLのAPIについて、詳細情報を調査し提供してください。

URL: "${url}"

このURLが指すAPIについて、以下のJSON形式で情報を返してください。JSONのみを返し、他の説明文は不要です。

{
  "api": {
    "name": "API名（公式名称）",
    "provider": "開発元企業・団体",
    "category": "カテゴリ (例: Finance, Weather, Social, Maps, AI, E-commerce等)",
    "description": "100文字以内の短い概要",
    "longDescription": "詳細な解説（機能や特徴を300文字程度で）",
    "useCases": ["ユースケース1", "ユースケース2", "ユースケース3"],
    "authType": "認証方式 (例: API Key, OAuth 2.0, Basic Auth, None)",
    "pricing": "価格モデル (例: Free, Freemium, Paid, Enterprise)",
    "url": "公式ドキュメントURL",
    "endpointExample": "代表的なエンドポイントパス (例: /v1/users)",
    "responseExample": {"サンプルレスポンス": "値"},
    "status": "active"
  },
  "confidence": "high/medium/low（情報の確実性）",
  "notes": "追加の注意事項があれば記載"
}

重要:
- このURLが実際にAPIに関するページでない場合は、"error": "このURLはAPIドキュメントではないようです" を返してください
- 情報が不明確な場合は "unknown" と記載してください
- JSONのみを返し、マークダウンの装飾は不要です`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // 履歴エントリの初期化
    const historyEntry = {
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'url_import',
        keyword: url,
        model: getModelName(),
        prompt: prompt,
        response: null,
        resultCount: 0,
        tokenUsage: null,
        processingTime: 0,
        success: false,
        error: null
    };

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${getModelName()}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.5,
                        maxOutputTokens: 65536,
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json();
            const errorMessage = error.error?.message || 'APIリクエストに失敗しました';

            historyEntry.processingTime = Math.round(performance.now() - startTime);
            historyEntry.error = errorMessage;
            if (saveToHistory) {
                await saveSearchHistory(historyEntry);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        const processingTime = Math.round(performance.now() - startTime);
        const tokenUsage = {
            promptTokens: data.usageMetadata?.promptTokenCount || null,
            completionTokens: data.usageMetadata?.candidatesTokenCount || null,
            totalTokens: data.usageMetadata?.totalTokenCount || null
        };

        if (!text) {
            historyEntry.processingTime = processingTime;
            historyEntry.tokenUsage = tokenUsage;
            historyEntry.error = 'AIからの応答が空でした';
            if (saveToHistory) {
                await saveSearchHistory(historyEntry);
            }
            throw new Error('AIからの応答が空でした');
        }

        const parsed = parseAiJson(text);

        // エラーレスポンスのチェック
        if (parsed.error) {
            historyEntry.processingTime = processingTime;
            historyEntry.tokenUsage = tokenUsage;
            historyEntry.response = text;
            historyEntry.error = parsed.error;
            if (saveToHistory) {
                await saveSearchHistory(historyEntry);
            }
            throw new Error(parsed.error);
        }

        const api = parsed.api;
        if (!api) {
            historyEntry.processingTime = processingTime;
            historyEntry.tokenUsage = tokenUsage;
            historyEntry.response = text;
            historyEntry.error = 'API情報が見つかりませんでした';
            if (saveToHistory) {
                await saveSearchHistory(historyEntry);
            }
            throw new Error('API情報が見つかりませんでした');
        }

        // 履歴エントリを完成
        historyEntry.response = text;
        historyEntry.resultCount = 1;
        historyEntry.tokenUsage = tokenUsage;
        historyEntry.processingTime = processingTime;
        historyEntry.success = true;

        if (saveToHistory) {
            await saveSearchHistory(historyEntry);
        }

        return {
            api,
            confidence: parsed.confidence || 'medium',
            notes: parsed.notes || ''
        };
    } catch (error) {
        clearTimeout(timeoutId);

        const processingTime = Math.round(performance.now() - startTime);

        if (error.name === 'AbortError') {
            historyEntry.processingTime = processingTime;
            historyEntry.error = 'リクエストがタイムアウトしました（60秒）';
            if (saveToHistory) {
                await saveSearchHistory(historyEntry);
            }
            throw new Error('リクエストがタイムアウトしました（60秒）');
        }

        if (!historyEntry.error) {
            historyEntry.processingTime = processingTime;
            historyEntry.error = error.message;
            if (saveToHistory) {
                await saveSearchHistory(historyEntry);
            }
        }

        throw error;
    }
}

/**
 * ラッパーコードを生成
 */
export async function generateCode(apiInfo, language) {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error('Gemini APIキーが設定されていません');
    }

    const languageTemplates = {
        python: 'Python (requestsライブラリを使用)',
        nodejs: 'Node.js (fetchまたはaxiosを使用)',
        powershell: 'PowerShell (Invoke-RestMethodを使用)',
        curl: 'cURL コマンド',
        excel_vba: 'Excel VBA (WinHttp.WinHttpRequest.5.1を使用)',
        google_apps_script: 'Google Apps Script (UrlFetchAppを使用)',
        javascript_browser: 'JavaScript (Fetch APIを使用)',
        typescript: 'TypeScript (型定義を含め、fetch APIを使用)'
    };

    const authInstruction = apiInfo.authType === 'None'
        ? '2. 認証は不要なため、APIキー等の設定は含めないでください'
        : '2. 認証の設定（プレースホルダーとして YOUR_API_KEY を使用）';

    const prompt = `あなたは各プログラミング言語に精通した世界トップレベルのシニアソフトウェアエンジニアです。
提供されたAPI情報を徹底的に分析し、${languageTemplates[language] || language}においてそのままプロダクション環境で利用できるレベルの、堅牢でCopy-Paste Readyなサンプルコードを生成してください。

API情報:
- 名前: ${apiInfo.name}
- ベースURL: ${apiInfo.url}
- 代表的なエンドポイント: ${apiInfo.endpointExample}
- 認証方式: ${apiInfo.authType}

実装の要件:
1. 指定された言語の最新のベストプラクティスと慣習（命名規則、非同期処理等）に従うこと。
${authInstruction}
3. ネットワークエラー、タイムアウト、ステータスコードに応じた詳細なエラーハンドリングを含めること。
4. レスポンスデータ（JSON等）を適切にパースし、利用しやすい形で出力または返却すること。
5. TypeScriptの場合はインターフェース等の型定義を正確に行い、Excel VBAの場合はユーザーが参照設定を追加する手間を省くため、CreateObjectを用いた「レイトバインディング（Late Binding）」で実装すること。
6. VBAにおいて複雑なJSONパーサー自体の実装を含めるとトークン制限を越えるため、リクエストとレスポンスの取得、および基本的なプロパティへのアクセスロジックに集中すること。

自己検証・再帰的確認:
出力前に以下のチェックを必ず実行してください：
- このコードは依存関係（ライブラリ参照設定等）なしで、そのまま標準モジュールに貼り付けて実行可能か？
- APIのベースURLとエンドポイントの結合ロジックに誤りはないか？
- エラーハンドリングは単なるログ出力に留まらず、実用的な実装になっているか？

回答はコード（コードブロック）のみを出力してください。説明文や導入文は一切不要です。`;

    const startTime = performance.now();
    const historyEntry = {
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'code_gen',
        keyword: `${apiInfo.name} (${language})`,
        model: getModelName(),
        prompt: prompt,
        response: null,
        resultCount: 1,
        tokenUsage: null,
        processingTime: 0,
        success: false,
        error: null
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${getModelName()}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 65536,
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        const processingTime = Math.round(performance.now() - startTime);

        if (!response.ok) {
            const error = await response.json();
            const errMsg = error.error?.message || 'コード生成に失敗しました';
            historyEntry.processingTime = processingTime;
            historyEntry.error = errMsg;
            await saveSearchHistory(historyEntry);
            throw new Error(errMsg);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        const tokenUsage = {
            promptTokens: data.usageMetadata?.promptTokenCount || null,
            completionTokens: data.usageMetadata?.candidatesTokenCount || null,
            totalTokens: data.usageMetadata?.totalTokenCount || null
        };

        if (!text) {
            historyEntry.processingTime = processingTime;
            historyEntry.tokenUsage = tokenUsage;
            historyEntry.error = 'AIからの応答が空でした';
            await saveSearchHistory(historyEntry);
            throw new Error('AIからの応答が空でした');
        }

        // コードブロックを抽出（閉じタグがなくても可能な限り抽出）
        let result = text;
        const codeMatch = text.match(/```[\w]*\n?([\s\S]*?)(?:```|$)/);
        if (codeMatch && codeMatch[1]) {
            result = codeMatch[1].trim();
        }

        historyEntry.response = text;
        historyEntry.tokenUsage = tokenUsage;
        historyEntry.processingTime = processingTime;
        historyEntry.success = true;
        await saveSearchHistory(historyEntry);

        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        const processingTime = Math.round(performance.now() - startTime);

        if (!historyEntry.error) {
            historyEntry.processingTime = processingTime;
            historyEntry.error = error.message;
            await saveSearchHistory(historyEntry);
        }

        if (error.name === 'AbortError') {
            throw new Error('リクエストがタイムアウトしました（60秒）');
        }

        throw error;
    }
}

/**
 * APIのステータスをチェック（変更検知）
 */
export async function checkApiStatus(apiInfo) {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error('Gemini APIキーが設定されていません');
    }

    const prompt = `以下のAPIについて、最新の状態を調査してください。

API: ${apiInfo.name}
提供元: ${apiInfo.provider}
URL: ${apiInfo.url}

以下のJSON形式で回答してください:
{
  "status": "active" または "deprecated" または "eol",
  "changes": "変更点があれば記載（なければ空文字）",
  "notes": "補足情報（サービス終了予定日、移行先など）"
}

JSONのみを返してください。`;

    const startTime = performance.now();
    const historyEntry = {
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'status_check',
        keyword: apiInfo.name,
        model: getModelName(),
        prompt: prompt,
        response: null,
        resultCount: 1,
        tokenUsage: null,
        processingTime: 0,
        success: false,
        error: null
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${getModelName()}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 65536,
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        const processingTime = Math.round(performance.now() - startTime);

        if (!response.ok) {
            const errMsg = 'ステータスチェックに失敗しました';
            historyEntry.processingTime = processingTime;
            historyEntry.error = errMsg;
            await saveSearchHistory(historyEntry);
            throw new Error(errMsg);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        const tokenUsage = {
            promptTokens: data.usageMetadata?.promptTokenCount || null,
            completionTokens: data.usageMetadata?.candidatesTokenCount || null,
            totalTokens: data.usageMetadata?.totalTokenCount || null
        };

        if (!text) {
            historyEntry.processingTime = processingTime;
            historyEntry.tokenUsage = tokenUsage;
            historyEntry.error = 'AIからの応答が空でした';
            await saveSearchHistory(historyEntry);
            throw new Error('AIからの応答が空でした');
        }

        const result = parseAiJson(text);
        historyEntry.response = text;
        historyEntry.tokenUsage = tokenUsage;
        historyEntry.processingTime = processingTime;
        historyEntry.success = true;
        await saveSearchHistory(historyEntry);

        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        const processingTime = Math.round(performance.now() - startTime);

        if (!historyEntry.error) {
            historyEntry.processingTime = processingTime;
            historyEntry.error = error.message;
            await saveSearchHistory(historyEntry);
        }

        if (error.name === 'AbortError') {
            throw new Error('リクエストがタイムアウトしました');
        }

        throw error;
    }
}

/**
 * API情報を再検証し、修正された情報を返す
 * @param {Object} apiInfo - 検証するAPI情報
 * @returns {Promise<Object>} - 検証結果と修正されたAPI情報
 */
export async function verifyApiInfo(apiInfo) {
    const apiKey = getApiKey();
    const startTime = performance.now();

    if (!apiKey) {
        throw new Error('Gemini APIキーが設定されていません');
    }

    const prompt = `あなたは熟練したAPI検証エキスパートです。以下のAPI情報が正確かどうかを確認し、間違いがあれば修正してください。

検証対象のAPI情報:
${JSON.stringify(apiInfo, null, 2)}

以下のJSON形式で、検証結果を返してください。JSONのみを返し、他の説明文は不要です。

{
  "isVerified": true/false（情報が確認できたかどうか）,
  "accuracy": "high/medium/low"（情報の正確性）,
  "corrections": [
    {
      "field": "修正したフィールド名",
      "original": "元の値",
      "corrected": "修正後の値",
      "reason": "修正理由"
    }
  ],
  "verifiedApi": {
    "name": "正確なAPI名",
    "provider": "正確なプロバイダー名",
    "category": "正確なカテゴリ",
    "description": "正確な概要",
    "longDescription": "正確な詳細説明",
    "useCases": ["正確なユースケース1", "ユースケース2"],
    "authType": "正確な認証方式",
    "pricing": "正確な料金モデル",
    "url": "正確な公式URL",
    "endpointExample": "正確なエンドポイント例",
    "responseExample": {"正確なレスポンス例": "値"},
    "status": "active/deprecated/eol"
  },
  "warnings": ["注意事項があれば記載"],
  "lastKnownUpdate": "このAPIの最新情報がいつのものか（わかれば）"
}

重要:
- 実際に存在するAPIかどうかを確認してください
- URLが正しいかどうかを確認してください
- 料金や認証方式が最新かどうかを確認してください
- 情報が確認できない場合は isVerified を false にしてください
- JSONのみを返し、マークダウンの装飾は不要です
- 文字列内のダブルクォートは必ずバックスラッシュでエスケープしてください（例: \" ）
- 文字列内で改行が必要な場合は \n を使用し、実際の改行は含めないでください`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // 履歴エントリの初期化
    const historyEntry = {
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'verify',
        keyword: apiInfo.name,
        model: getModelName(),
        prompt: prompt,
        response: null,
        resultCount: 0,
        tokenUsage: null,
        processingTime: 0,
        success: false,
        error: null
    };

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${getModelName()}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 65536,
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || '検証リクエストに失敗しました');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        const processingTime = Math.round(performance.now() - startTime);
        const tokenUsage = {
            promptTokens: data.usageMetadata?.promptTokenCount || null,
            completionTokens: data.usageMetadata?.candidatesTokenCount || null,
            totalTokens: data.usageMetadata?.totalTokenCount || null
        };

        if (!text) {
            throw new Error('AIからの応答が空でした');
        }

        const result = parseAiJson(text);

        // 履歴エントリを完成
        historyEntry.response = text;
        historyEntry.resultCount = result.corrections?.length || 0;
        historyEntry.tokenUsage = tokenUsage;
        historyEntry.processingTime = processingTime;
        historyEntry.success = true;

        await saveSearchHistory(historyEntry);

        return result;
    } catch (error) {
        clearTimeout(timeoutId);

        const processingTime = Math.round(performance.now() - startTime);
        historyEntry.processingTime = processingTime;
        historyEntry.error = error.message;
        await saveSearchHistory(historyEntry);

        if (error.name === 'AbortError') {
            throw new Error('リクエストがタイムアウトしました（60秒）');
        }

        throw error;
    }
}

/**
 * AIの応答からJSONを抽出してパースする
 * @param {string} text 
 * @returns {Object}
 */
function parseAiJson(text) {
    if (!text) {
        throw new Error('AIからの応答が空でした');
    }

    try {
        // 1. コードブロックを探す
        const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        let jsonStr = codeBlockMatch ? codeBlockMatch[1] : text;

        // 2. 波括弧の範囲を特定（コードブロックがない場合や、コードブロックの外にゴミがある場合）
        if (!codeBlockMatch) {
            const firstBrace = jsonStr.indexOf('{');
            const lastBrace = jsonStr.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
            }
        }

        // 3. 一般的な修正
        jsonStr = jsonStr.trim();

        // 末尾のカンマを削除 (], や },)
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');

        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('JSON Parse Error. Original text:', text);

        // パース失敗時の最後の手段：制御文字などを取り除いてみる
        try {
            const cleaned = text.match(/\{[\s\S]*\}/)?.[0]
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // 制御文字の削除
                .replace(/,\s*([\]}])/g, '$1');
            return JSON.parse(cleaned);
        } catch (e2) {
            throw new Error('AIの応答をJSONとしてパースできませんでした。形式が正しくない可能性があります。');
        }
    }
}

