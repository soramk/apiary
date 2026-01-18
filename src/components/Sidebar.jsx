import { useState, useMemo } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Layers,
    Building2,
    Search,
    Tag,
    Filter,
    X,
    FolderOpen,
    Folder
} from 'lucide-react';

/**
 * グルーピング方法の定義
 */
const GROUP_TYPES = {
    CATEGORY: 'category',
    PROVIDER: 'provider',
    KEYWORD: 'searchKeyword',
    STATUS: 'status'
};

const GROUP_LABELS = {
    [GROUP_TYPES.CATEGORY]: { label: 'カテゴリ', icon: Tag },
    [GROUP_TYPES.PROVIDER]: { label: 'プロバイダー', icon: Building2 },
    [GROUP_TYPES.KEYWORD]: { label: '検索キーワード', icon: Search },
    [GROUP_TYPES.STATUS]: { label: 'ステータス', icon: Layers }
};

/**
 * サイドバーコンポーネント
 */
export default function Sidebar({ apis, selectedFilters, onFilterChange, isOpen, onToggle }) {
    const [groupBy, setGroupBy] = useState(GROUP_TYPES.CATEGORY);
    const [expandedGroups, setExpandedGroups] = useState(new Set(['all']));

    // グループ化されたAPIを計算
    const groupedApis = useMemo(() => {
        const groups = {};

        apis.forEach((api) => {
            const key = api[groupBy] || '未分類';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(api);
        });

        // ソート（アイテム数の多い順）
        const sortedEntries = Object.entries(groups).sort(
            (a, b) => b[1].length - a[1].length
        );

        return sortedEntries;
    }, [apis, groupBy]);

    // グループの展開/折りたたみ
    const toggleGroup = (groupName) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(groupName)) {
                next.delete(groupName);
            } else {
                next.add(groupName);
            }
            return next;
        });
    };

    // フィルターの選択/解除
    const handleFilterToggle = (groupName) => {
        const newFilters = { ...selectedFilters };
        if (newFilters[groupBy] === groupName) {
            delete newFilters[groupBy];
        } else {
            newFilters[groupBy] = groupName;
        }
        onFilterChange(newFilters);
    };

    // すべてのフィルターをクリア
    const clearAllFilters = () => {
        onFilterChange({});
    };

    // フィルターがアクティブかどうか
    const hasActiveFilters = Object.keys(selectedFilters).length > 0;

    const GroupIcon = GROUP_LABELS[groupBy].icon;

    return (
        <>
            {/* サイドバートグルボタン（モバイル用） */}
            <button
                onClick={onToggle}
                className="lg:hidden fixed top-20 left-4 z-40 p-2 rounded-lg glass hover:bg-slate-700/50 transition-colors"
                aria-label="サイドバーを開く"
            >
                <Filter className="w-5 h-5 text-slate-300" />
            </button>

            {/* オーバーレイ（モバイル） */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={onToggle}
                />
            )}

            {/* サイドバー */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-50 lg:z-auto
                    h-screen w-72
                    glass border-r border-slate-700/50
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    flex flex-col
                `}
            >
                {/* ヘッダー */}
                <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-400" />
                            グループ表示
                        </h2>
                        <button
                            onClick={onToggle}
                            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
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
                                        ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                                        : 'bg-slate-700/30 text-slate-400 border border-transparent hover:bg-slate-700/50 hover:text-slate-300'
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
                    <div className="px-4 py-2 bg-indigo-500/10 border-b border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-indigo-300">
                                フィルター適用中
                            </span>
                            <button
                                onClick={clearAllFilters}
                                className="text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                クリア
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(selectedFilters).map(([key, value]) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs"
                                >
                                    {value}
                                    <button
                                        onClick={() => {
                                            const newFilters = { ...selectedFilters };
                                            delete newFilters[key];
                                            onFilterChange(newFilters);
                                        }}
                                        className="hover:text-white"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* グループリスト */}
                <div className="flex-1 overflow-y-auto p-2">
                    {groupedApis.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">APIがありません</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {groupedApis.map(([groupName, groupApis]) => {
                                const isExpanded = expandedGroups.has(groupName) || expandedGroups.has('all');
                                const isSelected = selectedFilters[groupBy] === groupName;

                                return (
                                    <div key={groupName} className="group">
                                        {/* グループヘッダー */}
                                        <div
                                            className={`
                                                flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                                                transition-all duration-200
                                                ${isSelected
                                                    ? 'bg-indigo-500/20 border border-indigo-500/50'
                                                    : 'hover:bg-slate-700/30 border border-transparent'
                                                }
                                            `}
                                        >
                                            <div
                                                className="flex items-center gap-2 flex-1"
                                                onClick={() => toggleGroup(groupName)}
                                            >
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                )}
                                                <GroupIcon className="w-4 h-4 text-slate-400" />
                                                <span className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-300' : 'text-slate-300'}`}>
                                                    {groupName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`
                                                    px-2 py-0.5 rounded-full text-xs font-medium
                                                    ${isSelected
                                                        ? 'bg-indigo-500/30 text-indigo-300'
                                                        : 'bg-slate-700/50 text-slate-400'
                                                    }
                                                `}>
                                                    {groupApis.length}
                                                </span>
                                                <button
                                                    onClick={() => handleFilterToggle(groupName)}
                                                    className={`
                                                        p-1 rounded transition-colors
                                                        ${isSelected
                                                            ? 'text-indigo-400 hover:text-indigo-300'
                                                            : 'text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100'
                                                        }
                                                    `}
                                                    title={isSelected ? 'フィルター解除' : 'このグループでフィルター'}
                                                >
                                                    <Filter className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* グループ内のAPIリスト */}
                                        {isExpanded && (
                                            <div className="ml-6 mt-1 space-y-0.5">
                                                {groupApis.slice(0, 5).map((api) => (
                                                    <div
                                                        key={api.id}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700/20 cursor-default transition-colors"
                                                    >
                                                        <Folder className="w-3.5 h-3.5 text-slate-500" />
                                                        <span className="truncate">{api.name}</span>
                                                    </div>
                                                ))}
                                                {groupApis.length > 5 && (
                                                    <div className="px-3 py-1 text-xs text-slate-500">
                                                        +{groupApis.length - 5} 件
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
                <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-slate-700/20">
                            <div className="text-lg font-bold text-white">{apis.length}</div>
                            <div className="text-xs text-slate-500">総API数</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-700/20">
                            <div className="text-lg font-bold text-indigo-400">{groupedApis.length}</div>
                            <div className="text-xs text-slate-500">グループ数</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
