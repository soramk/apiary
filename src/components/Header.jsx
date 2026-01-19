import { useState } from 'react';
import {
    Settings,
    Menu,
    X,
    Download,
    Upload,
    FileJson,
    FileSpreadsheet,
    FileText,
    History,
    Search,
    Sparkles,
    Loader2,
    Link2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { exportToJson, exportToCsv, exportToMarkdown, importFromJson } from '../services/database';
import apiaryLogo from '../assets/apiary_logo.png';

export default function Header({
    onImportComplete,
    onOpenSettings,
    onOpenHistory,
    onSearch,
    onOpenUrlImport,
    isSearching
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [importStatus, setImportStatus] = useState(null);
    const [keyword, setKeyword] = useState('');

    const handleExport = async (format) => {
        setIsExporting(true);
        try {
            let content, filename, mimeType;

            switch (format) {
                case 'json':
                    content = await exportToJson();
                    filename = 'apiary-backup.json';
                    mimeType = 'application/json';
                    break;
                case 'csv':
                    content = await exportToCsv();
                    filename = 'apiary-export.csv';
                    mimeType = 'text/csv';
                    break;
                case 'markdown':
                    content = await exportToMarkdown();
                    filename = 'apiary-catalog.md';
                    mimeType = 'text/markdown';
                    break;
                default:
                    return;
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('エクスポートに失敗しました: ' + error.message);
        } finally {
            setIsExporting(false);
            setIsMenuOpen(false);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const content = await file.text();
            const result = await importFromJson(content, 'skip');
            setImportStatus({
                success: true,
                message: `${result.imported}件のAPIをインポートしました（${result.skipped}件はスキップ）`
            });
            onImportComplete?.();
        } catch (error) {
            setImportStatus({
                success: false,
                message: error.message
            });
        }

        event.target.value = '';
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (keyword.trim() && !isSearching) {
            onSearch?.(keyword.trim());
        }
    };

    return (
        <>
            <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-pink-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4 h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <img
                                src={apiaryLogo}
                                alt="Apiary"
                                className="h-10 w-auto object-contain logo-blend"
                            />
                            <h1 className="text-xl font-bold gradient-text hidden sm:block">Apiary</h1>
                        </div>

                        {/* Search Bar - Integrated */}
                        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
                            <div className="relative flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder="APIを検索... (例: 天気予報, 決済, 画像認識)"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all border border-slate-200 focus:border-pink-300 text-sm"
                                        disabled={isSearching}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!keyword.trim() || isSearching}
                                    className="btn-primary px-4 py-2.5 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm whitespace-nowrap"
                                    title="AI（トークン）を使用してAPIを検索します"
                                >
                                    {isSearching ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="hidden sm:inline">検索中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span className="hidden sm:inline">AI検索</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onOpenUrlImport}
                                    className="p-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 hover:border-violet-300 text-violet-600 transition-all"
                                    title="URLから直接登録"
                                >
                                    <Link2 className="w-4 h-4" />
                                </button>
                            </div>
                        </form>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Local DB Badge */}
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                                <span className="text-xs text-amber-700 font-medium">Local DB</span>
                            </div>

                            {/* Menu Button */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="p-2 rounded-lg hover:bg-pink-50 transition-colors"
                                >
                                    {isMenuOpen ? (
                                        <X className="w-5 h-5 text-slate-600" />
                                    ) : (
                                        <Menu className="w-5 h-5 text-slate-600" />
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-pink-100 overflow-hidden animate-fade-in">
                                        <div className="p-2">
                                            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                エクスポート
                                            </div>
                                            <button
                                                onClick={() => handleExport('json')}
                                                disabled={isExporting}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-50 transition-colors text-left"
                                            >
                                                <FileJson className="w-5 h-5 text-amber-500" />
                                                <div>
                                                    <div className="text-sm text-slate-700">JSON形式</div>
                                                    <div className="text-xs text-slate-400">完全なバックアップ</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => handleExport('csv')}
                                                disabled={isExporting}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors text-left"
                                            >
                                                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                                                <div>
                                                    <div className="text-sm text-slate-700">CSV形式</div>
                                                    <div className="text-xs text-slate-400">スプレッドシート用</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => handleExport('markdown')}
                                                disabled={isExporting}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sky-50 transition-colors text-left"
                                            >
                                                <FileText className="w-5 h-5 text-sky-500" />
                                                <div>
                                                    <div className="text-sm text-slate-700">Markdown形式</div>
                                                    <div className="text-xs text-slate-400">ドキュメント用</div>
                                                </div>
                                            </button>

                                            <div className="my-2 border-t border-slate-100"></div>

                                            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                インポート
                                            </div>
                                            <label className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-violet-50 transition-colors cursor-pointer">
                                                <Upload className="w-5 h-5 text-violet-500" />
                                                <div>
                                                    <div className="text-sm text-slate-700">JSONインポート</div>
                                                    <div className="text-xs text-slate-400">バックアップを復元</div>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept=".json"
                                                    onChange={handleImport}
                                                    className="hidden"
                                                />
                                            </label>

                                            <div className="my-2 border-t border-slate-100"></div>

                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    onOpenHistory?.();
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-fuchsia-50 transition-colors text-left"
                                            >
                                                <History className="w-5 h-5 text-fuchsia-500" />
                                                <div>
                                                    <div className="text-sm text-slate-700">検索履歴</div>
                                                    <div className="text-xs text-slate-400">過去の検索を確認</div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    onOpenSettings?.();
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                                            >
                                                <Settings className="w-5 h-5 text-slate-500" />
                                                <div className="text-sm text-slate-700">設定</div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Import Status Toast */}
            {importStatus && (
                <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-xl animate-slide-up bg-white border ${importStatus.success
                    ? 'border-emerald-200 shadow-emerald-100/50'
                    : 'border-rose-200 shadow-rose-100/50'
                    }`}>
                    <div className="flex items-center gap-3">
                        {importStatus.success ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                        <p className={`font-medium ${importStatus.success ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {importStatus.message}
                        </p>
                        <button
                            onClick={() => setImportStatus(null)}
                            className="ml-2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
