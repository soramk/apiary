import { useState } from 'react';
import {
    X,
    Link,
    Loader2,
    CheckCircle,
    AlertCircle,
    Globe,
    Sparkles,
    ExternalLink
} from 'lucide-react';
import { analyzeUrlForApi, getApiKey } from '../services/gemini';

/**
 * URL入力モーダルコンポーネント
 */
export default function UrlImportModal({ isOpen, onClose, onImport }) {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // モーダルを閉じる
    const handleClose = () => {
        setUrl('');
        setResult(null);
        setError(null);
        setIsLoading(false);
        onClose();
    };

    // URL分析を実行
    const handleAnalyze = async () => {
        if (!url.trim()) return;

        if (!getApiKey()) {
            setError('Gemini APIキーが設定されていません');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const analysisResult = await analyzeUrlForApi(url.trim());
            setResult(analysisResult);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // API登録を実行
    const handleRegister = () => {
        if (result?.api) {
            onImport(result.api);
            handleClose();
        }
    };

    // Enterキーで送信
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading && url.trim()) {
            e.preventDefault();
            handleAnalyze();
        }
    };

    // 信頼度に応じた色を取得
    const getConfidenceColor = (confidence) => {
        switch (confidence) {
            case 'high':
                return 'text-emerald-400 bg-emerald-500/20';
            case 'medium':
                return 'text-amber-400 bg-amber-500/20';
            case 'low':
                return 'text-rose-400 bg-rose-500/20';
            default:
                return 'text-slate-400 bg-slate-500/20';
        }
    };

    const getConfidenceLabel = (confidence) => {
        switch (confidence) {
            case 'high':
                return '高信頼度';
            case 'medium':
                return '中信頼度';
            case 'low':
                return '低信頼度';
            default:
                return '不明';
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* オーバーレイ */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={handleClose}
            />

            {/* モーダル */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="w-full max-w-2xl bg-white rounded-2xl border border-pink-100 shadow-2xl animate-fade-in overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ヘッダー */}
                    <div className="p-6 border-b border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                                    <Link className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">URLからAPI登録</h2>
                                    <p className="text-sm text-slate-500">APIドキュメントのURLを入力してください</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* コンテンツ */}
                    <div className="p-6 space-y-6">
                        {/* URL入力 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">
                                APIドキュメントURL
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="https://api.example.com/docs"
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!url.trim() || isLoading}
                                    className="btn-primary px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>分析中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            <span>分析</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500">
                                APIの公式ドキュメントやリファレンスページのURLを入力してください
                            </p>
                        </div>

                        {/* エラー表示 */}
                        {error && (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-rose-300 font-medium">エラー</p>
                                    <p className="text-sm text-rose-200/70 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* 分析結果 */}
                        {result && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    <span className="text-emerald-300 font-medium">API情報を取得しました</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(result.confidence)}`}>
                                        {getConfidenceLabel(result.confidence)}
                                    </span>
                                </div>

                                {/* APIプレビュー */}
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">{result.api.name}</h3>
                                            <p className="text-sm text-slate-500">{result.api.provider}</p>
                                        </div>
                                        <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600">
                                            {result.api.category}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-600">{result.api.description}</p>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="p-2 rounded-lg bg-white border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1">認証方式</div>
                                            <div className="text-slate-700">{result.api.authType}</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white border border-slate-100">
                                            <div className="text-xs text-slate-500 mb-1">料金</div>
                                            <div className="text-slate-700">{result.api.pricing}</div>
                                        </div>
                                    </div>

                                    {result.api.url && (
                                        <a
                                            href={result.api.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            公式ドキュメントを開く
                                        </a>
                                    )}

                                    {result.notes && (
                                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                            <p className="text-xs text-amber-300">{result.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* フッター */}
                    <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleRegister}
                            disabled={!result}
                            className="btn-primary px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            カタログに登録
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
