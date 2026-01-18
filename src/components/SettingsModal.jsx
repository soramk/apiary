import { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, ExternalLink, CheckCircle, Cpu, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { getApiKey, setApiKey, getModelName, setModelName, fetchAvailableModels } from '../services/gemini';

export default function SettingsModal({ isOpen, onClose }) {
    const [apiKey, setApiKeyState] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    // モデル関連のステート
    const [selectedModel, setSelectedModel] = useState('');
    const [availableModels, setAvailableModels] = useState([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [modelError, setModelError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setApiKeyState(getApiKey());
            setSelectedModel(getModelName());
            setSaved(false);

            // APIキーがある場合はモデル一覧を取得
            if (getApiKey()) {
                loadModels();
            }
        }
    }, [isOpen]);

    // モデル一覧を取得
    const loadModels = async () => {
        setIsLoadingModels(true);
        setModelError(null);

        try {
            const models = await fetchAvailableModels();
            setAvailableModels(models);
        } catch (error) {
            setModelError(error.message);
        } finally {
            setIsLoadingModels(false);
        }
    };

    const handleSave = () => {
        setApiKey(apiKey.trim());
        setModelName(selectedModel);
        setSaved(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    // APIキー変更時にモデル一覧を再取得
    const handleApiKeyChange = (e) => {
        setApiKeyState(e.target.value);
    };

    // APIキー入力後にモデル一覧取得
    const handleLoadModelsClick = async () => {
        if (apiKey.trim()) {
            // 一時的にAPIキーを保存して取得
            const originalKey = getApiKey();
            setApiKey(apiKey.trim());

            try {
                await loadModels();
            } finally {
                // エラー時は元のキーに戻す（成功時はそのまま）
                if (modelError) {
                    setApiKey(originalKey);
                }
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative glass rounded-2xl p-6 max-w-lg w-full animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Key className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">設定</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* API Key Section */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Gemini API キー
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={handleApiKeyChange}
                                placeholder="AIzaSy..."
                                className="w-full input-dark px-4 py-3 pr-12 rounded-xl text-white"
                            />
                            <button
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                            >
                                {showKey ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                            APIキーはブラウザのローカルストレージに保存されます
                        </p>
                    </div>

                    {/* Model Selection Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-indigo-400" />
                                AIモデル
                            </label>
                            <button
                                onClick={handleLoadModelsClick}
                                disabled={!apiKey.trim() || isLoadingModels}
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-50 transition-colors"
                            >
                                {isLoadingModels ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-3 h-3" />
                                )}
                                モデル一覧を取得
                            </button>
                        </div>

                        {/* Model Error */}
                        {modelError && (
                            <div className="mb-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                                <AlertCircle className="w-4 h-4" />
                                {modelError}
                            </div>
                        )}

                        {/* Model Select or Input */}
                        {availableModels.length > 0 ? (
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full input-dark px-4 py-3 rounded-xl text-white"
                            >
                                {availableModels.map((model) => (
                                    <option key={model.name} value={model.name}>
                                        {model.displayName || model.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                placeholder="gemini-2.5-flash-preview-05-20"
                                className="w-full input-dark px-4 py-3 rounded-xl text-white"
                            />
                        )}

                        {/* Current Model Info */}
                        {availableModels.length > 0 && selectedModel && (
                            <div className="mt-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                {(() => {
                                    const model = availableModels.find((m) => m.name === selectedModel);
                                    if (!model) return null;
                                    return (
                                        <div className="space-y-1">
                                            <p className="text-xs text-slate-400">{model.description}</p>
                                            <div className="flex gap-4 text-xs text-slate-500">
                                                {model.inputTokenLimit && (
                                                    <span>入力: {model.inputTokenLimit.toLocaleString()} トークン</span>
                                                )}
                                                {model.outputTokenLimit && (
                                                    <span>出力: {model.outputTokenLimit.toLocaleString()} トークン</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        <p className="mt-2 text-xs text-slate-500">
                            使用するGemini AIモデルを選択します
                        </p>
                    </div>

                    {/* Help Link */}
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        <span>Google AI StudioでAPIキーを取得</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saved}
                            className="btn-primary px-6 py-2.5 rounded-xl text-white font-medium flex items-center gap-2 disabled:opacity-70"
                        >
                            {saved ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    保存しました
                                </>
                            ) : (
                                '保存'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
