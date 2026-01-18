import { useState, useMemo } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Layers,
    Building2,
    Search,
    Tag,
    X,
    FolderOpen,
    Folder,
    Check,
    Filter,
    Heart,
    Star
} from 'lucide-react';

/**
 * グルーピング方法の定義
 */
const GROUP_TYPES = {
    CATEGORY: 'category',
    PROVIDER: 'provider',
    KEYWORD: 'searchKeyword',
    STATUS: 'status',
    TAGS: 'tags'
};

const GROUP_LABELS = {
    [GROUP_TYPES.CATEGORY]: { label: 'カテゴリ', icon: Tag },
    [GROUP_TYPES.TAGS]: { label: '個人タグ', icon: Star },
    [GROUP_TYPES.PROVIDER]: { label: '提供元', icon: Building2 },
    [GROUP_TYPES.KEYWORD]: { label: '検索履歴', icon: Search },
    [GROUP_TYPES.STATUS]: { label: 'ステータス', icon: Layers }
};

/**
 * サイドバーコンポーネント
 * フィルターは複数選択可能（同じグループタイプ内で複数の値を選択可能）
 */
export default function Sidebar({ apis, selectedFilters, onFilterChange, isOpen, onToggle }) {
    const [groupBy, setGroupBy] = useState(GROUP_TYPES.CATEGORY);
    const [expandedGroups, setExpandedGroups] = useState(new Set(['all']));

    // グループ化されたAPIを計算
    const groupedApis = useMemo(() => {
        const groups = {};

        apis.forEach((api) => {
            if (groupBy === GROUP_TYPES.TAGS) {
                const tags = api.tags || [];
                if (tags.length === 0) {
                    const key = 'タグなし';
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(api);
                } else {
                    tags.forEach(tag => {
                        if (!groups[tag]) groups[tag] = [];
                        groups[tag].push(api);
                    });
                }
            } else {
                const key = api[groupBy] || '未分類';
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(api);
            }
        });

        // ソート（アイテム数の多い順）
        const sortedEntries = Object.entries(groups).sort(
            (a, b) => b[1].length - a[1].length
        );

        return sortedEntries;
    }, [apis, groupBy]);

    // 現在のグループタイプで選択されているフィルター値の配列を取得
    const currentFilters = useMemo(() => {
        const filterValue = selectedFilters[groupBy];
        if (!filterValue) return [];
        if (Array.isArray(filterValue)) return filterValue;
        return [filterValue];
    }, [selectedFilters, groupBy]);

    // グループの展開/折りたたみ
    const toggleExpand = (groupName, e) => {
        e.stopPropagation();
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupName)) {
                next.delete(groupName);
            } else {
                next.add(groupName);
            }
            // 'all' を削除（個別に展開状態を管理）
            next.delete('all');
            return next;
        });
    };

    // フィルターの選択/解除（複数選択対応）
    const handleFilterToggle = (groupName) => {
        const newFilters = { ...selectedFilters };
        const currentValues = currentFilters;

        if (currentValues.includes(groupName)) {
            // 既に選択されている場合は解除
            const newValues = currentValues.filter((v) => v !== groupName);
            if (newValues.length === 0) {
                delete newFilters[groupBy];
            } else {
                newFilters[groupBy] = newValues;
            }
        } else {
            // 新規選択（配列に追加）
            newFilters[groupBy] = [...currentValues, groupName];
        }

        onFilterChange(newFilters);
    };

    // 特定のフィルター値を削除
    const removeFilter = (type, value) => {
        const newFilters = { ...selectedFilters };
        const values = newFilters[type];

        if (Array.isArray(values)) {
            const newValues = values.filter((v) => v !== value);
            if (newValues.length === 0) {
                delete newFilters[type];
            } else {
                newFilters[type] = newValues;
            }
        } else {
            delete newFilters[type];
        }

        onFilterChange(newFilters);
    };

    // すべてのフィルターをクリア
    const clearAllFilters = () => {
        onFilterChange({});
    };

    // フィルターがアクティブかどうか
    const hasActiveFilters = Object.keys(selectedFilters).length > 0;

    // アクティブなフィルターの総数
    const activeFilterCount = useMemo(() => {
        return Object.values(selectedFilters).reduce((count, value) => {
            if (Array.isArray(value)) return count + value.length;
            return count + 1;
        }, 0);
    }, [selectedFilters]);

    // フィルターを配列として展開
    const flattenedFilters = useMemo(() => {
        const result = [];
        Object.entries(selectedFilters).forEach(([type, value]) => {
            const typeLabel = GROUP_LABELS[type]?.label || type;
            if (Array.isArray(value)) {
                value.forEach((v) => result.push({ type, value: v, typeLabel }));
            } else {
                result.push({ type, value, typeLabel });
            }
        });
        return result;
    }, [selectedFilters]);

    const GroupIcon = GROUP_LABELS[groupBy].icon;

    return (
        <>
            {/* サイドバートグルボタン（モバイル用） */}
            <button
                onClick={onToggle}
                className="lg:hidden fixed top-20 left-4 z-40 p-2 rounded-lg bg-white/80 backdrop-blur border border-pink-200 hover:bg-pink-50 transition-colors shadow-lg"
                aria-label="サイドバーを開く"
            >
                <Filter className="w-5 h-5 text-pink-500" />
                {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* オーバーレイ（モバイル） */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 z-40"
                    onClick={onToggle}
                />
            )}

            {/* サイドバー */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-50 lg:z-auto
                    h-screen w-72
                    bg-white/90 backdrop-blur-lg border-r border-pink-100
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    flex flex-col shadow-lg
                `}
            >
                {/* ヘッダー */}
                <div className="p-4 border-b border-pink-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-pink-500" />
                            フィルター
                        </h2>
                        <button
                            onClick={onToggle}
                            className="lg:hidden p-1.5 rounded-lg hover:bg-pink-50 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => {
                                const newFilters = { ...selectedFilters };
                                if (newFilters.onlyFavorites) {
                                    delete newFilters.onlyFavorites;
                                } else {
                                    newFilters.onlyFavorites = true;
                                }
                                onFilterChange(newFilters);
                            }}
                            className={`
                                flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all
                                ${selectedFilters.onlyFavorites
                                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200 border border-rose-500'
                                    : 'bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-500 border border-slate-200'
                                }
                            `}
                        >
                            <Heart className={`w-4 h-4 ${selectedFilters.onlyFavorites ? 'fill-current' : ''}`} />
                            お気に入り
                        </button>
                    </div>

                    {/* グルーピング方法の選択 */}
                    <div className="flex flex-wrap gap-1.5">
                        {Object.entries(GROUP_LABELS).map(([type, { label, icon: Icon }]) => (
                            <button
                                key={type}
                                onClick={() => setGroupBy(type)}
                                className={`
                                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                    transition-all duration-200
                                    ${groupBy === type
                                        ? 'bg-pink-100 text-pink-700 border border-pink-300'
                                        : 'bg-slate-50 text-slate-500 border border-transparent hover:bg-slate-100 hover:text-slate-700'
                                    }
                                `}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* アクティブフィルター表示 */}
                {hasActiveFilters && (
                    <div className="px-4 py-3 bg-pink-50 border-b border-pink-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-pink-700">
                                フィルター適用中 ({activeFilterCount}件)
                            </span>
                            <button
                                onClick={clearAllFilters}
                                className="text-xs text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                すべてクリア
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {flattenedFilters.map(({ type, value, typeLabel }) => (
                                <button
                                    key={`${type}-${value}`}
                                    onClick={() => removeFilter(type, value)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-pink-200 hover:border-pink-300 text-pink-700 text-xs transition-colors group shadow-sm"
                                >
                                    <span className="text-pink-400">{typeLabel}:</span>
                                    <span>{value}</span>
                                    <X className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* グループリスト */}
                <div className="flex-1 overflow-y-auto p-2">
                    {groupedApis.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">APIがありません</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {/* ヒントメッセージ */}
                            <div className="px-3 py-2 text-xs text-slate-400">
                                クリックで選択（複数選択可）
                            </div>

                            {groupedApis.map(([groupName, groupApis]) => {
                                const isExpanded = expandedGroups.has(groupName);
                                const isSelected = currentFilters.includes(groupName);

                                return (
                                    <div key={groupName}>
                                        {/* グループヘッダー（クリックでフィルター） */}
                                        <button
                                            onClick={() => handleFilterToggle(groupName)}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                                                transition-all duration-200 text-left
                                                ${isSelected
                                                    ? 'bg-pink-100 border border-pink-300'
                                                    : 'hover:bg-slate-50 border border-transparent'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {/* チェックボックス表示 */}
                                                <div className={`
                                                    w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                                                    transition-all duration-200
                                                    ${isSelected
                                                        ? 'bg-pink-500 border-pink-500'
                                                        : 'border-slate-300 hover:border-slate-400'
                                                    }
                                                `}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>

                                                <GroupIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                <span className={`text-sm font-medium truncate ${isSelected ? 'text-pink-700' : 'text-slate-700'}`}>
                                                    {groupName}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`
                                                    px-2 py-0.5 rounded-full text-xs font-medium
                                                    ${isSelected
                                                        ? 'bg-pink-200 text-pink-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }
                                                `}>
                                                    {groupApis.length}
                                                </span>

                                                {/* 展開ボタン */}
                                                <button
                                                    onClick={(e) => toggleExpand(groupName, e)}
                                                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                                    title="詳細を表示"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </button>

                                        {/* グループ内のAPIリスト */}
                                        {isExpanded && (
                                            <div className="ml-8 mt-1 mb-2 space-y-0.5 animate-fade-in">
                                                {groupApis.slice(0, 5).map((api) => (
                                                    <div
                                                        key={api.id}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-slate-500"
                                                    >
                                                        <Folder className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="truncate">{api.name}</span>
                                                    </div>
                                                ))}
                                                {groupApis.length > 5 && (
                                                    <div className="px-3 py-1 text-xs text-slate-400 italic">
                                                        他 {groupApis.length - 5} 件...
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

                {/* フッター統計 */}
                <div className="p-4 border-t border-pink-100 bg-white/50">
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-sky-50 border border-sky-100">
                            <div className="text-lg font-bold text-sky-700">{apis.length}</div>
                            <div className="text-xs text-sky-500">総API数</div>
                        </div>
                        <div className="p-2 rounded-lg bg-pink-50 border border-pink-100">
                            <div className="text-lg font-bold text-pink-700">{groupedApis.length}</div>
                            <div className="text-xs text-pink-500">グループ数</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
