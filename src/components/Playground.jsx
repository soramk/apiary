import { useState } from 'react';
import { Send, AlertTriangle, Loader2, XCircle } from 'lucide-react';

export default function Playground({ api }) {
    const [method, setMethod] = useState('GET');
    const [endpoint, setEndpoint] = useState(api.endpointExample || '');
    const [headers, setHeaders] = useState('{\n  "Authorization": "Bearer YOUR_API_KEY"\n}');
    const [body, setBody] = useState('');
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [useProxy, setUseProxy] = useState(false);

    const handleExecute = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const parsedHeaders = JSON.parse(headers);
            const baseUrl = api.url.replace(/\/$/, '');
            let fullUrl = endpoint.startsWith('http')
                ? endpoint
                : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

            // プロキシを使用する場合
            if (useProxy) {
                fullUrl = `https://corsproxy.io/?${encodeURIComponent(fullUrl)}`;
            }

            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...parsedHeaders
                }
            };

            if (method !== 'GET' && method !== 'HEAD' && body) {
                options.body = body;
            }

            const startTime = performance.now();
            const res = await fetch(fullUrl, options);
            const endTime = performance.now();

            const contentType = res.headers.get('content-type');
            let data;

            if (contentType?.includes('application/json')) {
                data = await res.json();
            } else {
                data = await res.text();
            }

            setResponse({
                status: res.status,
                statusText: res.statusText,
                time: Math.round(endTime - startTime),
                data
            });
        } catch (err) {
            if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
                setError('CORSエラー: このAPIはブラウザから直接アクセスできません。サーバーサイドプロキシの使用を検討してください。');
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* CORS Warning */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-amber-800 text-sm font-medium">CORS制限に関する注意</p>
                    <p className="text-amber-700/80 text-sm mt-1">
                        多くのAPIはCORS制限により、ブラウザから直接リクエストできません。
                        テスト実行時にエラーが発生した場合は、サーバーサイドでのテストをお勧めします。
                    </p>
                </div>
            </div>

            {/* Request Form */}
            <div className="space-y-4">
                {/* Method & Endpoint */}
                <div className="flex gap-3">
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-slate-800 w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                    </select>
                    <input
                        type="text"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        placeholder="エンドポイント (例: /v1/users)"
                        className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>

                {/* Headers */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        ヘッダー (JSON)
                    </label>
                    <textarea
                        value={headers}
                        onChange={(e) => setHeaders(e.target.value)}
                        rows={4}
                        className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        spellCheck={false}
                    />
                </div>

                {/* Body */}
                {method !== 'GET' && method !== 'HEAD' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            リクエストボディ (JSON)
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={6}
                            className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            placeholder='{\n  "key": "value"\n}'
                            spellCheck={false}
                        />
                    </div>
                )}

                {/* Execute Button & Proxy Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                        onClick={handleExecute}
                        disabled={isLoading || !endpoint}
                        className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 min-w-[160px]"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                実行中...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                リクエストを実行
                            </>
                        )}
                    </button>

                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={useProxy}
                                onChange={(e) => setUseProxy(e.target.checked)}
                            />
                            <div className={`w-10 h-6 rounded-full transition-colors ${useProxy ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                            <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${useProxy ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">プロキシを経由する (CORS回避)</span>
                            <span className="text-xs text-slate-500">ブラウザ制限でエラーが出る場合に有効にしてください</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Response */}
            {(response || error) && (
                <div className="space-y-3 w-full overflow-hidden">
                    <h4 className="text-sm font-medium text-slate-700">レスポンス</h4>

                    {error ? (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                            <div className="flex items-center gap-2 text-rose-600">
                                <XCircle className="w-5 h-5" />
                                <span className="font-medium">エラー</span>
                            </div>
                            <p className="mt-2 text-rose-800 text-sm leading-relaxed">{error}</p>
                            {!useProxy && error.includes('CORS') && (
                                <button
                                    onClick={() => {
                                        setUseProxy(true);
                                        setError(null);
                                    }}
                                    className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-4"
                                >
                                    プロキシを有効にして再試行する
                                </button>
                            )}
                        </div>
                    ) : response && (
                        <div className="code-block overflow-hidden">
                            {/* Status Bar */}
                            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${response.status >= 200 && response.status < 300
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : response.status >= 400
                                            ? 'bg-rose-500/20 text-rose-400'
                                            : 'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {response.status} {response.statusText}
                                    </span>
                                    <span className="text-xs text-slate-400">{response.time}ms</span>
                                </div>
                            </div>

                            {/* Body */}
                            <pre className="p-4 overflow-x-auto text-sm text-slate-300 max-h-96">
                                {typeof response.data === 'object'
                                    ? JSON.stringify(response.data, null, 2)
                                    : response.data
                                }
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
