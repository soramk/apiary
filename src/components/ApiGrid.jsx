import { Database, Search as SearchIcon } from 'lucide-react';
import ApiCard from './ApiCard';

export default function ApiGrid({ apis, onSelect, onDelete, isLoading }) {
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="text-center py-16">
                    <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl glass">
                        <div className="spinner"></div>
                        <span className="text-slate-600">AIが蜜を集めています...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (apis.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm mb-6">
                        <Database className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        巣箱はまだ空っぽです
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        キーワードを入力して検索すると、AIが蜂のように飛び回り、
                        APIという蜜を集めてきます。
                    </p>
                    <div className="flex items-center justify-center gap-2 text-indigo-400">
                        <SearchIcon className="w-5 h-5" />
                        <span>上の検索バーからAPIを探索してみましょう</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-800">集めた蜜 (API)</h2>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-medium">
                        {apis.length}件
                    </span>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apis.map((api, index) => (
                    <div
                        key={api.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <ApiCard
                            api={api}
                            onSelect={onSelect}
                            onDelete={onDelete}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
