import { useState, useEffect } from 'react';
import { X, Key, Eye, EyeOff, ExternalLink, CheckCircle } from 'lucide-react';
import { getApiKey, setApiKey } from '../services/gemini';

export default function SettingsModal({ isOpen, onClose }) {
    const [apiKey, setApiKeyState] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setApiKeyState(getApiKey());
            setSaved(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        setApiKey(apiKey.trim());
        setSaved(true);
        setTimeout(() => {
            onClose();
        }, 1500);
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
            <div className="relative glass rounded-2xl p-6 max-w-lg w-full animate-slide-up shadow-2xl">
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
                                onChange={(e) => setApiKeyState(e.target.value)}
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
