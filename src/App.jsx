import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import ApiGrid from './components/ApiGrid';
import ApiDetail from './components/ApiDetail';
import ConfirmDialog from './components/ConfirmDialog';
import SettingsModal from './components/SettingsModal';
import { initDB, getAllApis, saveApis, deleteApi } from './services/database';
import { searchApis, getApiKey } from './services/gemini';

export default function App() {
    const [apis, setApis] = useState([]);
    const [selectedApi, setSelectedApi] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

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
    const handleApiUpdate = useCallback((updatedApi) => {
        setApis((prev) => prev.map((api) =>
            api.id === updatedApi.id ? updatedApi : api
        ));
        if (selectedApi?.id === updatedApi.id) {
            setSelectedApi(updatedApi);
        }
    }, [selectedApi]);

    // Reload data after import
    const handleImportComplete = useCallback(async () => {
        try {
            const savedApis = await getAllApis();
            setApis(savedApis);
        } catch (err) {
            setError(err.message);
        }
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
        <div className="min-h-screen">
            <Header
                onImportComplete={handleImportComplete}
                onOpenSettings={() => setShowSettings(true)}
            />

            <SearchSection
                onSearch={handleSearch}
                isLoading={isSearching}
            />

            {/* Error Toast */}
            {error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                        <p className="text-rose-300">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-rose-400 hover:text-rose-300 text-sm"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}

            <ApiGrid
                apis={apis}
                onSelect={setSelectedApi}
                onDelete={setDeleteTarget}
                isLoading={isLoading || isSearching}
            />

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
        </div>
    );
}
