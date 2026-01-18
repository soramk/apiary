import { useState } from 'react';
import {
    X,
    Loader2,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    RefreshCw,
    Save,
    Sparkles
} from 'lucide-react';
import { verifyApiInfo } from '../services/gemini';

/**
 * AI再検証モーダルコンポーネント
 */
export default function VerifyModal({ api, isOpen, onClose, onApplyCorrections }) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // 検証を開始
    const handleVerify = async () => {
        setIsVerifying(true);
        setError(null);
        setResult(null);

        try {
            const verificationResult = await verifyApiInfo(api);
            setResult(verificationResult);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsVerifying(false);
        }
    };

    // 修正を適用
    const handleApply = () => {
        if (result?.verifiedApi) {
            onApplyCorrections({
                ...api,
                ...result.verifiedApi,
                lastVerifiedAt: Date.now()
            });
            onClose();
        }
    };

    // 正確性に応じたアイコンと色を取得
    const getAccuracyConfig = (accuracy) => {
        switch (accuracy) {
            case 'high':
                return {
                    icon: ShieldCheck,
                    color: 'text-emerald-700',
                    bgColor: 'bg-emerald-50',
                    borderColor: 'border-emerald-200',
                    label: '高信頼度'
                };
            case 'medium':
                return {
                    icon: ShieldAlert,
                    color: 'text-amber-700',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    label: '中信頼度'
                };
            case 'low':
                return {
                    icon: ShieldX,
                    color: 'text-rose-700',
                    bgColor: 'bg-rose-50',
                    borderColor: 'border-rose-200',
                    label: '低信頼度'
                };
            default:
                return {
                    icon: ShieldAlert,
                    color: 'text-slate-600',
                    bgColor: 'bg-slate-50',
                    borderColor: 'border-slate-200',
                    label: '不明'
                };
        }
    };

    if (!isOpen) return null;

    const accuracyConfig = result?.accuracy ? getAccuracyConfig(result.accuracy) : null;
    const AccuracyIcon = accuracyConfig?.icon;

    return (
        <>
            {/* オーバーレイ */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={onClose}
            />

            {/* モーダル */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div
                    className="w-full max-w-3xl bg-white rounded-2xl border border-pink-100 shadow-2xl animate-fade-in my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ヘッダー */}
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">AI再検証</h2>
                                    <p className="text-sm text-slate-500">
                                        {api.name} の情報を再検証します
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* コンテンツ */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {/* 検証前 */}
                        {!result && !error && !isVerifying && (
                            <div className="text-center py-8">
                                <ShieldCheck className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium text-slate-800 mb-2">
                                    API情報の検証を開始
                                </h3>
                                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                    AIが登録されているAPI情報を検証し、誤った情報があれば修正案を提示します。
                                </p>
                                <button
                                    onClick={handleVerify}
                                    className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 mx-auto"
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    検証を開始
                                </button>
                            </div>
                        )}

                        {/* 検証中 */}
                        {isVerifying && (
                            <div className="text-center py-12">
                                <div className="relative inline-block">
                                    <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">
                                    検証中...
                                </h3>
                                <p className="text-slate-500">
                                    AIがAPI情報を確認しています
                                </p>
                            </div>
                        )}

                        {/* エラー */}
                        {error && (
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-rose-800 font-medium">検証に失敗しました</p>
                                        <p className="text-sm text-rose-700 mt-1">{error}</p>
                                        <button
                                            onClick={handleVerify}
                                            className="mt-3 text-sm text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            再試行
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 検証結果 */}
                        {result && (
                            <div className="space-y-6 animate-fade-in">
                                {/* 検証ステータス */}
                                <div className={`p-4 rounded-xl border ${accuracyConfig.bgColor} ${accuracyConfig.borderColor}`}>
                                    <div className="flex items-center gap-3">
                                        <AccuracyIcon className={`w-8 h-8 ${accuracyConfig.color}`} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-semibold ${accuracyConfig.color}`}>
                                                    {result.isVerified ? '検証完了' : '検証不可'}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${accuracyConfig.bgColor} ${accuracyConfig.color}`}>
                                                    {accuracyConfig.label}
                                                </span>
                                            </div>
                                            {result.lastKnownUpdate && (
                                                <p className="text-sm text-slate-400 mt-1">
                                                    最新情報: {result.lastKnownUpdate}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 修正箇所 */}
                                {result.corrections && result.corrections.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                                            修正が必要な項目 ({result.corrections.length}件)
                                        </h4>
                                        <div className="space-y-2">
                                            {result.corrections.map((correction, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 rounded-lg bg-slate-50 border border-slate-200"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-medium text-slate-400 uppercase">
                                                            {correction.field}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-rose-300 line-through">
                                                            {String(correction.original).substring(0, 50)}
                                                            {String(correction.original).length > 50 ? '...' : ''}
                                                        </span>
                                                        <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                        <span className="text-emerald-300">
                                                            {String(correction.corrected).substring(0, 50)}
                                                            {String(correction.corrected).length > 50 ? '...' : ''}
                                                        </span>
                                                    </div>
                                                    {correction.reason && (
                                                        <p className="text-xs text-slate-600 mt-2">
                                                            理由: {correction.reason}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 修正なし */}
                                {(!result.corrections || result.corrections.length === 0) && result.isVerified && (
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                                        <div>
                                            <p className="text-emerald-800 font-medium">情報は正確です</p>
                                            <p className="text-sm text-emerald-700">修正が必要な項目は見つかりませんでした</p>
                                        </div>
                                    </div>
                                )}

                                {/* 警告 */}
                                {result.warnings && result.warnings.length > 0 && (
                                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                                        <h4 className="text-sm font-semibold text-amber-800 mb-2">注意事項</h4>
                                        <ul className="space-y-1">
                                            {result.warnings.map((warning, index) => (
                                                <li key={index} className="text-sm text-amber-700 flex items-start gap-2">
                                                    <span className="text-amber-500">•</span>
                                                    {warning}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* フッター */}
                    <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                        <button
                            onClick={handleVerify}
                            disabled={isVerifying}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 group"
                            title="AI（トークン）を使用して再度情報を検証します"
                        >
                            {isVerifying ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 text-violet-500 group-hover:animate-pulse" />
                            )}
                            AI再検証
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
                            >
                                閉じる
                            </button>
                            {result?.corrections && result.corrections.length > 0 && (
                                <button
                                    onClick={handleApply}
                                    className="btn-primary px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    修正を適用
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
