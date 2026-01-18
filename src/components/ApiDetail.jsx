import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    ExternalLink,
    Key,
    DollarSign,
    Building2,
    RefreshCw,
    Loader2,
    CheckCircle,
    AlertTriangle,
    Code2,
    Edit3,
    ShieldCheck,
    Heart,
    Tag,
    Plus,
    X,
    BookOpen,
    Target,
    XCircle,
    Sparkles
} from 'lucide-react';
import { checkApiStatus } from '../services/gemini';
import { saveApi } from '../services/database';
import Playground from './Playground';
import CodeGenerator from './CodeGenerator';
import ApiEditModal from './ApiEditModal';
import VerifyModal from './VerifyModal';

export default function ApiDetail({ api, onBack, onUpdate }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isChecking, setIsChecking] = useState(false);
    const [statusResult, setStatusResult] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [newTag, setNewTag] = useState('');

    // 詳細を開いたときに常に最上部にスクロールする
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [api?.id]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'playground', label: 'Playground', icon: Target },
        { id: 'codegen', label: 'Code Gen', icon: Code2 }
    ];

    const getStatusConfig = (status) => {
        switch (status) {
            case 'deprecated':
                return {
                    label: 'Deprecated',
                    className: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
                    icon: AlertTriangle
                };
            case 'eol':
                return {
                    label: 'End of Life',
                    className: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
                    icon: XCircle
                };
            default:
                return {
                    label: 'Active',
                    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
                    icon: CheckCircle
                };
        }
    };

    const statusConfig = getStatusConfig(api.status);
    const StatusIcon = statusConfig.icon;

    const handleCheckStatus = async () => {
        setIsChecking(true);
        setStatusResult(null);

        try {
            const result = await checkApiStatus(api);
            setStatusResult(result);

            // ステータスが変わった場合、データベースを更新
            if (result.status !== api.status) {
                const updatedApi = {
                    ...api,
                    status: result.status,
                    lastCheckedAt: Date.now()
                };
                await saveApi(updatedApi);
                onUpdate?.(updatedApi);
            }
        } catch (err) {
            setStatusResult({ error: err.message });
        } finally {
            setIsChecking(false);
        }
    };

    // 編集保存ハンドラー
    const handleEditSave = async (updatedApi) => {
        await saveApi(updatedApi);
        onUpdate?.(updatedApi);
    };

    // お気に入りトグル
    const handleToggleFavorite = async () => {
        const updatedApi = {
            ...api,
            isFavorite: !api.isFavorite
        };
        await saveApi(updatedApi);
        onUpdate?.(updatedApi);
    };

    // タグ追加
    const handleAddTag = async (e) => {
        e.preventDefault();
        const tag = newTag.trim();
        if (!tag) return;

        const tags = api.tags || [];
        if (tags.includes(tag)) {
            setNewTag('');
            return;
        }

        const updatedApi = {
            ...api,
            tags: [...tags, tag]
        };
        await saveApi(updatedApi);
        onUpdate?.(updatedApi);
        setNewTag('');
    };

    // タグ削除
    const handleRemoveTag = async (tagToRemove) => {
        const updatedApi = {
            ...api,
            tags: (api.tags || []).filter(t => t !== tagToRemove)
        };
        await saveApi(updatedApi);
        onUpdate?.(updatedApi);
    };

    // 検証結果適用ハンドラー
    const handleApplyCorrections = async (correctedApi) => {
        await saveApi(correctedApi);
        onUpdate?.(correctedApi);
    };

    return (
        <div className="min-h-screen animate-fade-in">
            {/* Header */}
            <div className="glass sticky top-0 z-40 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>一覧に戻る</span>
                    </button>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-slate-800">{api.name}</h1>
                                    <button
                                        onClick={handleToggleFavorite}
                                        className={`p-2 rounded-lg transition-all ${api.isFavorite
                                            ? 'text-rose-500 bg-rose-50'
                                            : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                                            }`}
                                        title={api.isFavorite ? 'お気に入り解除' : 'お気に入り追加'}
                                    >
                                        <Heart className={`w-6 h-6 ${api.isFavorite ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-3 py-1 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600">
                                        {api.category}
                                    </span>
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium border ${statusConfig.className}`}>
                                        <StatusIcon className="w-4 h-4" />
                                        <span>{statusConfig.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-600 text-sm ml-2">
                                        <Building2 className="w-4 h-4" />
                                        <span>{api.provider}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* 編集ボタン */}
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 bg-white/50 hover:bg-white border border-slate-200 transition-colors"
                                title="情報を編集"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span className="hidden sm:inline">編集</span>
                            </button>

                            {/* AI再検証ボタン */}
                            <button
                                onClick={() => setShowVerifyModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors group"
                                title="AI（トークン）を使用して情報を再検証します"
                            >
                                <Sparkles className="w-4 h-4 text-violet-500 group-hover:animate-pulse" />
                                <span className="hidden sm:inline">AI再検証</span>
                            </button>

                            {/* ステータス確認ボタン */}
                            <button
                                onClick={handleCheckStatus}
                                disabled={isChecking}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 bg-white/50 hover:bg-white border border-slate-200 transition-colors disabled:opacity-50 group"
                                title="AI（トークン）を使用して最新ステータスを確認します"
                            >
                                {isChecking ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Sparkles className="w-4 h-4 text-pink-400 group-hover:animate-pulse" />
                                )}
                                <span className="hidden sm:inline">AIステータス</span>
                            </button>

                            {/* 公式サイトリンク */}
                            <a
                                href={api.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-white"
                            >
                                <span className="hidden sm:inline">公式サイト</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Check Result */}
            {statusResult && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    {statusResult.error ? (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                            <p className="text-rose-800 text-sm">{statusResult.error}</p>
                        </div>
                    ) : (
                        <div className={`p-4 rounded-xl border ${statusResult.status === 'active'
                            ? 'bg-emerald-50 border-emerald-200'
                            : statusResult.status === 'deprecated'
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-rose-50 border-rose-200'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                {statusResult.status === 'active' && (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        <span className="font-medium text-emerald-800">このAPIは現在アクティブです</span>
                                    </>
                                )}
                                {statusResult.status === 'deprecated' && (
                                    <>
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                        <span className="font-medium text-amber-800">このAPIは非推奨になっています</span>
                                    </>
                                )}
                                {statusResult.status === 'eol' && (
                                    <>
                                        <XCircle className="w-5 h-5 text-rose-600" />
                                        <span className="font-medium text-rose-800">このAPIはサービス終了しています</span>
                                    </>
                                )}
                            </div>
                            {statusResult.changes && (
                                <p className="text-sm text-slate-700 ml-7">{statusResult.changes}</p>
                            )}
                            {statusResult.notes && (
                                <p className="text-sm text-slate-600 ml-7 mt-1">{statusResult.notes}</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                        {/* Tabs */}
                        <div className="flex gap-1 p-1 mb-6 bg-slate-200/50 rounded-xl border border-slate-200">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="glass-card rounded-2xl p-6">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Description */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-3">概要</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            {api.longDescription || api.description}
                                        </p>
                                    </div>

                                    {/* Use Cases */}
                                    {api.useCases && api.useCases.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-3">主なユースケース</h3>
                                            <ul className="space-y-2">
                                                {api.useCases.map((useCase, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-3 text-slate-600"
                                                    >
                                                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm flex-shrink-0">
                                                            {index + 1}
                                                        </span>
                                                        <span>{useCase}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Endpoint Example */}
                                    {api.endpointExample && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-3">
                                                エンドポイント例
                                            </h3>
                                            <div className="code-block p-4">
                                                <code className="text-emerald-400">{api.endpointExample}</code>
                                            </div>
                                        </div>
                                    )}

                                    {/* Response Example */}
                                    {api.responseExample && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-3">
                                                レスポンス例
                                            </h3>
                                            <div className="code-block p-4 overflow-x-auto">
                                                <pre className="text-sm text-slate-300">
                                                    {JSON.stringify(api.responseExample, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'playground' && (
                                <div className="animate-fade-in">
                                    <Playground api={api} />
                                </div>
                            )}

                            {activeTab === 'codegen' && (
                                <div className="animate-fade-in">
                                    <CodeGenerator api={api} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80">
                        <div className="glass-card rounded-2xl p-6 sticky top-32">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">メタデータ</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Key className="w-4 h-4" />
                                        <span className="text-sm">認証方式</span>
                                    </div>
                                    <span className="text-slate-800 font-medium">{api.authType}</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="text-sm">料金</span>
                                    </div>
                                    <span className="text-slate-800 font-medium">{api.pricing}</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Building2 className="w-4 h-4" />
                                        <span className="text-sm">提供元</span>
                                    </div>
                                    <span className="text-slate-800 font-medium text-right">{api.provider}</span>
                                </div>

                                {api.searchKeyword && (
                                    <div className="pt-3">
                                        <p className="text-xs text-slate-500 mb-2">検索キーワード</p>
                                        <span className="inline-block px-3 py-1 rounded-lg text-sm bg-slate-100 text-slate-600 border border-slate-200">
                                            {api.searchKeyword}
                                        </span>
                                    </div>
                                )}

                                {api.lastCheckedAt && (
                                    <div className="pt-3">
                                        <p className="text-xs text-slate-500 mb-2">最終確認日時</p>
                                        <span className="text-sm text-slate-600">
                                            {new Date(api.lastCheckedAt).toLocaleString('ja-JP')}
                                        </span>
                                    </div>
                                )}

                                {/* Tags Management */}
                                <div className="pt-6 border-t border-slate-200">
                                    <div className="flex items-center gap-2 text-slate-500 mb-3">
                                        <Tag className="w-4 h-4" />
                                        <span className="text-sm font-semibold">タグ管理</span>
                                    </div>

                                    <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="タグを追加..."
                                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                        <button
                                            type="submit"
                                            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </form>

                                    <div className="flex flex-wrap gap-2">
                                        {(api.tags || []).length === 0 ? (
                                            <p className="text-xs text-slate-400 italic">タグはまだありません</p>
                                        ) : (
                                            api.tags.map((tag, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 group/tag"
                                                >
                                                    <span>{tag}</span>
                                                    <button
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="hover:text-rose-500 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <ApiEditModal
                api={api}
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={handleEditSave}
            />

            {/* Verify Modal */}
            <VerifyModal
                api={api}
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                onApplyCorrections={handleApplyCorrections}
            />
        </div>
    );
}

