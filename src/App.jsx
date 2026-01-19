import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import WelcomeBanner from './components/WelcomeBanner';
import ApiGrid from './components/ApiGrid';
import ApiDetail from './components/ApiDetail';
import ConfirmDialog from './components/ConfirmDialog';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';
import HistoryPanel from './components/HistoryPanel';
import UrlImportModal from './components/UrlImportModal';
import { initDB, getAllApis, saveApis, saveApi, deleteApi } from './services/database';
import { searchApis, getApiKey } from './services/gemini';

export default function App() {
    const [apis, setApis] = useState([]);
    const [selectedApi, setSelectedApi] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showUrlImport, setShowUrlImport] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [filters, setFilters] = useState({});

    // Initialize database and load data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await initDB();
                const savedApis = await getAllApis();
                setApis(savedApis);

                // Check if API key is set
                if (!getApiKey()) {
                    setShowSettings(true);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Filter APIs based on selected filters (複数選択対応)
    const filteredApis = useMemo(() => {
        let result = apis;

        // お気に入りのみフィルター
        if (filters.onlyFavorites) {
            result = result.filter(api => api.isFavorite);
        }

        // その他のフィルター（カテゴリ、プロバイダーなど）
        result = result.filter((api) => {
            return Object.entries(filters).every(([key, value]) => {
                if (key === 'onlyFavorites') return true;

                // タグフィルターの特別処理
                if (key === 'tags') {
                    if (!value || value.length === 0) return true;
                    return (api.tags || []).some(tag => value.includes(tag));
                }

                const apiValue = api[key] || '未分類';

                // 値が配列の場合（複数選択）
                if (Array.isArray(value)) {
                    return value.includes(apiValue);
                }

                // 単一の値の場合
                return apiValue === value;
            });
        });

        return result;
    }, [apis, filters]);

    // Search handler
    const handleSearch = useCallback(async (keyword) => {
        if (!getApiKey()) {
            setShowSettings(true);
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            const results = await searchApis(keyword);

            // Add metadata to each result
            const enrichedResults = results.map((api) => ({
                ...api,
                id: uuidv4(),
                searchKeyword: keyword,
                createdAt: Date.now(),
                status: api.status || 'active'
            }));

            // Save to database
            await saveApis(enrichedResults);

            // Reload all APIs
            const allApis = await getAllApis();
            setApis(allApis);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Delete handler
    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return;

        try {
            await deleteApi(deleteTarget.id);
            setApis((prev) => prev.filter((api) => api.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            setError(err.message);
        }
    }, [deleteTarget]);

    // API update handler
    const handleApiUpdate = useCallback(async (updatedApi) => {
        await saveApi(updatedApi);
        setApis((prev) => prev.map((api) =>
            api.id === updatedApi.id ? updatedApi : api
        ));
        if (selectedApi?.id === updatedApi.id) {
            setSelectedApi(updatedApi);
        }
    }, [selectedApi]);

    // Toggle Favorite handler
    const handleToggleFavorite = useCallback(async (apiId) => {
        const api = apis.find(a => a.id === apiId);
        if (!api) return;

        const updatedApi = {
            ...api,
            isFavorite: !api.isFavorite
        };

        await handleApiUpdate(updatedApi);
    }, [apis, handleApiUpdate]);

    // Reload data after import
    const handleImportComplete = useCallback(async () => {
        try {
            const savedApis = await getAllApis();
            setApis(savedApis);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    // URLからのAPIインポートハンドラー
    const handleUrlImport = useCallback(async (apiData) => {
        try {
            const enrichedApi = {
                ...apiData,
                id: uuidv4(),
                searchKeyword: 'URLインポート',
                createdAt: Date.now(),
                status: apiData.status || 'active'
            };

            await saveApi(enrichedApi);

            // Reload all APIs
            const allApis = await getAllApis();
            setApis(allApis);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    // Toggle sidebar
    const toggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    // Render detail view
    if (selectedApi) {
        return (
            <>
                <ApiDetail
                    api={selectedApi}
                    onBack={() => setSelectedApi(null)}
                    onUpdate={handleApiUpdate}
                />
                <SettingsModal
                    isOpen={showSettings}
                    onClose={() => setShowSettings(false)}
                />
            </>
        );
    }

    // Render main view
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Sidebar
                apis={apis}
                selectedFilters={filters}
                onFilterChange={setFilters}
                isOpen={sidebarOpen}
                onToggle={toggleSidebar}
            />

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Header with integrated search */}
                <Header
                    onImportComplete={handleImportComplete}
                    onOpenSettings={() => setShowSettings(true)}
                    onOpenHistory={() => setShowHistory(true)}
                    onSearch={handleSearch}
                    onOpenUrlImport={() => setShowUrlImport(true)}
                    isSearching={isSearching}
                />

                {/* Welcome Banner (only shown when no APIs) */}
                <WelcomeBanner
                    onQuickSearch={handleSearch}
                    totalApis={apis.length}
                />

                {/* Filter indicator */}
                {Object.keys(filters).length > 0 && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>フィルター適用中:</span>
                            <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-medium">
                                {filteredApis.length} / {apis.length} 件表示
                            </span>
                        </div>
                    </div>
                )}

                {/* Error Toast */}
                {error && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                            <p className="text-rose-700">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="text-rose-500 hover:text-rose-700 text-sm font-medium"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                )}

                {/* API Grid - Main content area */}
                <div className="flex-1">
                    <ApiGrid
                        apis={filteredApis}
                        onSelect={setSelectedApi}
                        onDelete={setDeleteTarget}
                        onToggleFavorite={handleToggleFavorite}
                        isLoading={isLoading || isSearching}
                    />
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="APIを削除しますか？"
                message={`「${deleteTarget?.name}」をカタログから削除します。この操作は取り消せません。`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                type="danger"
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            {/* History Panel */}
            <HistoryPanel
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
            />

            {/* URL Import Modal */}
            <UrlImportModal
                isOpen={showUrlImport}
                onClose={() => setShowUrlImport(false)}
                onImport={handleUrlImport}
            />
        </div>
    );
}
