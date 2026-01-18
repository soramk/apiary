// Gemini API サービス
const API_TIMEOUT = 60000; // 60秒

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
 */
export async function searchApis(keyword) {
    const apiKey = getApiKey();

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

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
                        maxOutputTokens: 4096,
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'APIリクエストに失敗しました');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('AIからの応答が空でした');
        }

        // JSONをパース
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AIの応答からJSONを抽出できませんでした');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.apis || [];
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('リクエストがタイムアウトしました（60秒）');
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
        curl: 'cURL コマンド'
    };

    const prompt = `以下のAPI情報を元に、${languageTemplates[language] || language}で実行可能なサンプルコードを生成してください。

API情報:
- 名前: ${apiInfo.name}
- エンドポイント例: ${apiInfo.endpointExample}
- 認証方式: ${apiInfo.authType}
- ベースURL: ${apiInfo.url}

以下を含めてください:
1. 必要なインポート/モジュール
2. 認証の設定（プレースホルダーとして YOUR_API_KEY を使用）
3. リクエストの実行
4. レスポンスの処理
5. エラーハンドリング

コードのみを返してください。説明文は不要です。`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
                        maxOutputTokens: 2048,
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'コード生成に失敗しました');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('AIからの応答が空でした');
        }

        // コードブロックを抽出
        const codeMatch = text.match(/```[\w]*\n?([\s\S]*?)```/);
        return codeMatch ? codeMatch[1].trim() : text.trim();
    } catch (error) {
        clearTimeout(timeoutId);

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
                        maxOutputTokens: 1024,
                    }
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('ステータスチェックに失敗しました');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('AIからの応答が空でした');
        }

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('応答からJSONを抽出できませんでした');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('リクエストがタイムアウトしました');
        }

        throw error;
    }
}
