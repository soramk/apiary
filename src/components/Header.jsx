import { useState } from 'react';
import { Database, Settings, Menu, X, Download, Upload, FileJson, FileSpreadsheet, FileText, History } from 'lucide-react';
import { exportToJson, exportToCsv, exportToMarkdown, importFromJson } from '../services/database';

export default function Header({ onImportComplete, onOpenSettings, onOpenHistory }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [importStatus, setImportStatus] = useState(null);

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

    return (
        <>
            <header className="glass sticky top-0 z-50 border-b border-pink-300/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/apiary_logo.png"
                                alt="Apiary Logo"
                                className="h-12 w-auto object-contain"
                            />
                        </div>

                        {/* Local DB Badge */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                            <span className="text-xs text-amber-300 font-medium">Local DB</span>
                        </div>

                        {/* Menu Button */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                            >
                                {isMenuOpen ? (
                                    <X className="w-6 h-6 text-slate-300" />
                                ) : (
                                    <Menu className="w-6 h-6 text-slate-300" />
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-xl border border-slate-600/50 overflow-hidden animate-fade-in">
                                    <div className="p-2">
                                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            エクスポート
                                        </div>
                                        <button
                                            onClick={() => handleExport('json')}
                                            disabled={isExporting}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <FileJson className="w-5 h-5 text-amber-400" />
                                            <div>
                                                <div className="text-sm text-slate-200">JSON形式</div>
                                                <div className="text-xs text-slate-400">完全なバックアップ</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleExport('csv')}
                                            disabled={isExporting}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                                            <div>
                                                <div className="text-sm text-slate-200">CSV形式</div>
                                                <div className="text-xs text-slate-400">スプレッドシート用</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleExport('markdown')}
                                            disabled={isExporting}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <FileText className="w-5 h-5 text-blue-400" />
                                            <div>
                                                <div className="text-sm text-slate-200">Markdown形式</div>
                                                <div className="text-xs text-slate-400">ドキュメント用</div>
                                            </div>
                                        </button>

                                        <div className="my-2 border-t border-slate-600/50"></div>

                                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            インポート
                                        </div>
                                        <label className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                                            <Upload className="w-5 h-5 text-indigo-400" />
                                            <div>
                                                <div className="text-sm text-slate-200">JSONインポート</div>
                                                <div className="text-xs text-slate-400">バックアップを復元</div>
                                            </div>
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={handleImport}
                                                className="hidden"
                                            />
                                        </label>

                                        <div className="my-2 border-t border-slate-600/50"></div>

                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                onOpenHistory?.();
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <History className="w-5 h-5 text-violet-400" />
                                            <div>
                                                <div className="text-sm text-slate-200">検索履歴</div>
                                                <div className="text-xs text-slate-400">過去の検索を確認</div>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                onOpenSettings?.();
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
                                        >
                                            <Settings className="w-5 h-5 text-slate-400" />
                                            <div className="text-sm text-slate-200">設定</div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Import Status Toast */}
            {importStatus && (
                <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-xl animate-slide-up ${importStatus.success
                    ? 'bg-emerald-500/20 border border-emerald-500/50'
                    : 'bg-rose-500/20 border border-rose-500/50'
                    }`}>
                    <div className="flex items-center gap-3">
                        {importStatus.success ? (
                            <Download className="w-5 h-5 text-emerald-400" />
                        ) : (
                            <X className="w-5 h-5 text-rose-400" />
                        )}
                        <p className={importStatus.success ? 'text-emerald-200' : 'text-rose-200'}>
                            {importStatus.message}
                        </p>
                        <button
                            onClick={() => setImportStatus(null)}
                            className="ml-2 text-slate-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
