import { useState, useEffect } from 'react';
import {
    X,
    Save,
    RotateCcw,
    Loader2,
    ShieldCheck,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    Edit3
} from 'lucide-react';

/**
 * API編集モーダルコンポーネント
 */
export default function ApiEditModal({ api, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // APIデータをフォームにロード
    useEffect(() => {
        if (api && isOpen) {
            setFormData({
                name: api.name || '',
                provider: api.provider || '',
                category: api.category || '',
                description: api.description || '',
                longDescription: api.longDescription || '',
                useCases: api.useCases?.join('\n') || '',
                authType: api.authType || '',
                pricing: api.pricing || '',
                url: api.url || '',
                endpointExample: api.endpointExample || '',
                responseExample: typeof api.responseExample === 'object'
                    ? JSON.stringify(api.responseExample, null, 2)
                    : api.responseExample || '',
                status: api.status || 'active'
            });
            setIsDirty(false);
        }
    }, [api, isOpen]);

    // フォームの変更ハンドラー
    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
        setIsDirty(true);
    };

    // リセット
    const handleReset = () => {
        if (api) {
            setFormData({
                name: api.name || '',
                provider: api.provider || '',
                category: api.category || '',
                description: api.description || '',
                longDescription: api.longDescription || '',
                useCases: api.useCases?.join('\n') || '',
                authType: api.authType || '',
                pricing: api.pricing || '',
                url: api.url || '',
                endpointExample: api.endpointExample || '',
                responseExample: typeof api.responseExample === 'object'
                    ? JSON.stringify(api.responseExample, null, 2)
                    : api.responseExample || '',
                status: api.status || 'active'
            });
            setIsDirty(false);
        }
    };

    // 保存
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // useCasesを配列に変換
            const useCasesArray = formData.useCases
                .split('\n')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            // responseExampleをJSONにパース
            let responseExample = formData.responseExample;
            try {
                if (responseExample && typeof responseExample === 'string') {
                    responseExample = JSON.parse(responseExample);
                }
            } catch {
                // パースできない場合は文字列のまま
            }

            const updatedApi = {
                ...api,
                name: formData.name,
                provider: formData.provider,
                category: formData.category,
                description: formData.description,
                longDescription: formData.longDescription,
                useCases: useCasesArray,
                authType: formData.authType,
                pricing: formData.pricing,
                url: formData.url,
                endpointExample: formData.endpointExample,
                responseExample: responseExample,
                status: formData.status,
                lastEditedAt: Date.now()
            };

            await onSave(updatedApi);
            setIsDirty(false);
            onClose();
        } catch (error) {
            console.error('保存に失敗:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // 閉じる
    const handleClose = () => {
        if (isDirty) {
            if (window.confirm('変更が保存されていません。閉じますか？')) {
                onClose();
            }
        } else {
            onClose();
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div
                    className="w-full max-w-4xl glass rounded-2xl border border-slate-600/50 shadow-2xl animate-fade-in my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ヘッダー */}
                    <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                                <Edit3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">API情報を編集</h2>
                                <p className="text-sm text-slate-400">手動で情報を修正できます</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isDirty && (
                                <span className="text-xs text-amber-400 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    未保存の変更
                                </span>
                            )}
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* フォーム */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* API名 */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">API名 *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>

                            {/* プロバイダー */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">プロバイダー *</label>
                                <input
                                    type="text"
                                    value={formData.provider}
                                    onChange={(e) => handleChange('provider', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>

                            {/* カテゴリ */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">カテゴリ</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                    placeholder="例: AI, Finance, Weather..."
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>

                            {/* ステータス */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">ステータス</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                >
                                    <option value="active">Active</option>
                                    <option value="deprecated">Deprecated</option>
                                    <option value="eol">End of Life</option>
                                </select>
                            </div>

                            {/* 認証方式 */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">認証方式</label>
                                <input
                                    type="text"
                                    value={formData.authType}
                                    onChange={(e) => handleChange('authType', e.target.value)}
                                    placeholder="例: API Key, OAuth 2.0, None..."
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>

                            {/* 料金 */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">料金モデル</label>
                                <input
                                    type="text"
                                    value={formData.pricing}
                                    onChange={(e) => handleChange('pricing', e.target.value)}
                                    placeholder="例: Free, Freemium, Paid..."
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>

                            {/* URL */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-medium text-slate-300">公式URL</label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => handleChange('url', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>

                            {/* 概要 */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-medium text-slate-300">概要</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                                />
                            </div>

                            {/* 詳細説明 */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-medium text-slate-300">詳細説明</label>
                                <textarea
                                    value={formData.longDescription}
                                    onChange={(e) => handleChange('longDescription', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                                />
                            </div>

                            {/* ユースケース */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-medium text-slate-300">
                                    ユースケース（1行に1つ）
                                </label>
                                <textarea
                                    value={formData.useCases}
                                    onChange={(e) => handleChange('useCases', e.target.value)}
                                    rows={3}
                                    placeholder="ユースケース1&#10;ユースケース2&#10;ユースケース3"
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono text-sm"
                                />
                            </div>

                            {/* エンドポイント例 */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-medium text-slate-300">エンドポイント例</label>
                                <input
                                    type="text"
                                    value={formData.endpointExample}
                                    onChange={(e) => handleChange('endpointExample', e.target.value)}
                                    placeholder="/v1/users"
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                                />
                            </div>

                            {/* レスポンス例 */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-medium text-slate-300">レスポンス例 (JSON)</label>
                                <textarea
                                    value={formData.responseExample}
                                    onChange={(e) => handleChange('responseExample', e.target.value)}
                                    rows={4}
                                    placeholder='{"key": "value"}'
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* フッター */}
                    <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
                        <button
                            onClick={handleReset}
                            disabled={!isDirty}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RotateCcw className="w-4 h-4" />
                            リセット
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!isDirty || isSaving || !formData.name || !formData.provider}
                                className="btn-primary px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        保存中...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        保存
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
