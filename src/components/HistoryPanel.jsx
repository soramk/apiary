import { useState, useEffect } from 'react';
import {
    History,
    Clock,
    Search,
    Cpu,
    Zap,
    Timer,
    CheckCircle,
    XCircle,
    Download,
    Trash2,
    ChevronDown,
    ChevronRight,
    FileJson,
    X,
    Eye,
    BarChart3,
    RefreshCw
} from 'lucide-react';
import {
    getAllHistory,
    deleteHistory,
    clearAllHistory,
    downloadHistoryJson,
    getHistoryStats
} from '../services/history';

/**
 * 履歴パネルコンポーネント
 */
export default function HistoryPanel({ isOpen, onClose }) {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [expandedEntries, setExpandedEntries] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState('list'); // 'list' | 'stats'
    const [filter, setFilter] = useState('all'); // 'all' | 'success' | 'failed'

    // 履歴を読み込む
    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const [historyData, statsData] = await Promise.all([
                getAllHistory(),
                getHistoryStats()
            ]);
            setHistory(historyData);
            setStats(statsData);
        } catch (error) {
            console.error('履歴の読み込みに失敗:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    // フィルタリングされた履歴
    const filteredHistory = history.filter((entry) => {
        if (filter === 'success') return entry.success;
        if (filter === 'failed') return !entry.success;
        return true;
    });

    // エントリの展開/折りたたみ
    const toggleEntry = (id) => {
        setExpandedEntries((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // 単一履歴の削除
    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await deleteHistory(id);
            setHistory((prev) => prev.filter((entry) => entry.id !== id));
        } catch (error) {
            console.error('削除に失敗:', error);
        }
    };

    // 全履歴のクリア
    const handleClearAll = async () => {
        if (window.confirm('すべての検索履歴を削除しますか？この操作は取り消せません。')) {
            try {
                await clearAllHistory();
                setHistory([]);
                setStats(null);
            } catch (error) {
                console.error('クリアに失敗:', error);
            }
        }
    };

    // JSONエクスポート
    const handleExport = async () => {
        try {
            await downloadHistoryJson();
        } catch (error) {
            console.error('エクスポートに失敗:', error);
        }
    };

    // 処理時間のフォーマット
    const formatTime = (ms) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    // 日時のフォーマット
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <>
            {/* オーバーレイ */}
            <div
                className="fixed inset-0 bg-black/30 z-50"
                onClick={onClose}
            />

            {/* パネル */}
            <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white border-l border-pink-100 z-50 flex flex-col animate-slide-in-right shadow-2xl">
                {/* ヘッダー */}
                <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-pink-50 to-violet-50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <History className="w-6 h-6 text-pink-500" />
                            検索履歴
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* タブ & アクション */}
                    <div className="flex items-center justify-between">
                        {/* ビュー切り替え */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => setView('list')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'list'
                                    ? 'bg-pink-100 text-pink-700'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                    }`}
                            >
                                履歴一覧
                            </button>
                            <button
                                onClick={() => setView('stats')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${view === 'stats'
                                    ? 'bg-pink-100 text-pink-700'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                                統計
                            </button>
                        </div>

                        {/* アクション */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadHistory}
                                className="p-2 rounded-lg hover:bg-white/50 text-slate-400 hover:text-slate-600 transition-colors"
                                title="更新"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm transition-colors"
                                title="JSONエクスポート"
                            >
                                <Download className="w-4 h-4" />
                                エクスポート
                            </button>
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-100 text-rose-500 text-sm transition-colors"
                                title="すべて削除"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* メインコンテンツ */}
                <div className="flex-1 overflow-y-auto bg-slate-50">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="spinner" />
                        </div>
                    ) : view === 'stats' ? (
                        /* 統計ビュー */
                        <div className="p-4 space-y-4">
                            {stats && (
                                <>
                                    {/* 概要カード */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                            <div className="text-2xl font-bold text-slate-800">{stats.totalSearches}</div>
                                            <div className="text-xs text-slate-500">総検索回数</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                            <div className="text-2xl font-bold text-emerald-600">{stats.successfulSearches}</div>
                                            <div className="text-xs text-slate-500">成功</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                                            <div className="text-2xl font-bold text-rose-600">{stats.failedSearches}</div>
                                            <div className="text-xs text-slate-500">失敗</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-pink-50 border border-pink-200">
                                            <div className="text-2xl font-bold text-pink-600">{stats.totalApisFound}</div>
                                            <div className="text-xs text-slate-600">発見したAPI</div>
                                        </div>
                                    </div>

                                    {/* パフォーマンス */}
                                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-amber-500" />
                                            パフォーマンス
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-lg font-bold text-slate-800">{formatTime(stats.averageProcessingTime)}</div>
                                                <div className="text-xs text-slate-500">平均処理時間</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-slate-800">{stats.totalTokensUsed.toLocaleString()}</div>
                                                <div className="text-xs text-slate-600">総トークン使用量</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* よく検索されるキーワード */}
                                    {stats.topKeywords.length > 0 && (
                                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                                <Search className="w-4 h-4 text-pink-500" />
                                                よく検索されるキーワード
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {stats.topKeywords.map(({ keyword, count }) => (
                                                    <span
                                                        key={keyword}
                                                        className="px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 text-sm"
                                                    >
                                                        {keyword}
                                                        <span className="ml-1.5 text-pink-500">({count})</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        /* 履歴一覧ビュー */
                        <div className="p-4">
                            {/* フィルター */}
                            <div className="flex gap-2 mb-4">
                                {['all', 'success', 'failed'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f
                                            ? 'bg-pink-100 text-pink-700'
                                            : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
                                            }`}
                                    >
                                        {f === 'all' && '全て'}
                                        {f === 'success' && '成功のみ'}
                                        {f === 'failed' && '失敗のみ'}
                                    </button>
                                ))}
                                <span className="ml-auto text-sm text-slate-600">
                                    {filteredHistory.length}件
                                </span>
                            </div>

                            {/* 履歴リスト */}
                            {filteredHistory.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>検索履歴がありません</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredHistory.map((entry) => {
                                        const isExpanded = expandedEntries.has(entry.id);

                                        return (
                                            <div
                                                key={entry.id}
                                                className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm"
                                            >
                                                {/* ヘッダー */}
                                                <div
                                                    onClick={() => toggleEntry(entry.id)}
                                                    className="p-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {isExpanded ? (
                                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                                            )}
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <Search className="w-4 h-4 text-pink-500" />
                                                                    <span className="font-medium text-slate-800">
                                                                        {entry.keyword}
                                                                    </span>
                                                                    {entry.success ? (
                                                                        <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                                            <CheckCircle className="w-3 h-3" />
                                                                            {entry.resultCount}件
                                                                        </span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                                                            <XCircle className="w-3 h-3" />
                                                                            失敗
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {formatDate(entry.timestamp)}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Timer className="w-3 h-3" />
                                                                        {formatTime(entry.processingTime)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDelete(entry.id, e)}
                                                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* 詳細 */}
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-4 bg-slate-50">
                                                        {/* メタ情報 */}
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                                                                <div className="text-xs text-slate-400 mb-1">モデル</div>
                                                                <div className="flex items-center gap-1 text-slate-700">
                                                                    <Cpu className="w-3.5 h-3.5 text-violet-500" />
                                                                    <span className="truncate">{entry.model}</span>
                                                                </div>
                                                            </div>
                                                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                                                                <div className="text-xs text-slate-400 mb-1">処理時間</div>
                                                                <div className="flex items-center gap-1 text-slate-700">
                                                                    <Timer className="w-3.5 h-3.5 text-amber-500" />
                                                                    {formatTime(entry.processingTime)}
                                                                </div>
                                                            </div>
                                                            {entry.tokenUsage && (
                                                                <>
                                                                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                                                                        <div className="text-xs text-slate-500 mb-1">入力トークン</div>
                                                                        <div className="text-slate-700">
                                                                            {entry.tokenUsage.promptTokens?.toLocaleString() || '-'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                                                                        <div className="text-xs text-slate-500 mb-1">出力トークン</div>
                                                                        <div className="text-slate-700">
                                                                            {entry.tokenUsage.completionTokens?.toLocaleString() || '-'}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* エラー */}
                                                        {entry.error && (
                                                            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                                                                <div className="text-xs text-rose-600 font-medium mb-1">エラー</div>
                                                                <div className="text-sm text-rose-700">{entry.error}</div>
                                                            </div>
                                                        )}

                                                        {/* プロンプト */}
                                                        <div>
                                                            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                                                <FileJson className="w-3.5 h-3.5" />
                                                                プロンプト
                                                            </div>
                                                            <pre className="p-3 rounded-lg bg-slate-800 text-xs text-slate-200 overflow-x-auto max-h-40 overflow-y-auto">
                                                                {entry.prompt}
                                                            </pre>
                                                        </div>

                                                        {/* レスポンス */}
                                                        {entry.response && (
                                                            <div>
                                                                <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    AIレスポンス
                                                                </div>
                                                                <pre className="p-3 rounded-lg bg-slate-800 text-xs text-slate-200 overflow-x-auto max-h-60 overflow-y-auto">
                                                                    {entry.response}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
