import { useState } from 'react';
import { Search, Sparkles, Loader2, Link2 } from 'lucide-react';

export default function SearchSection({ onSearch, onOpenUrlImport, isLoading }) {
    const [keyword, setKeyword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (keyword.trim() && !isLoading) {
            onSearch(keyword.trim());
        }
    };

    return (
        <section className="relative py-16 lg:py-24 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Hero Text */}
                <div className="mb-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-6">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-indigo-300">Powered by Gemini AI</span>
                    </div>

                    <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                        <span className="gradient-text">あなただけの</span>
                        <br />
                        <span className="text-white">API養蜂場を育てよう</span>
                    </h2>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        キーワードを入力するだけで、AIが蜂のように世界中を飛び回り、
                        Web APIという蜜を集めてきます。あなただけのAPIデータベースを育ててください。
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSubmit} className="animate-slide-up">
                    <div className="relative max-w-2xl mx-auto">
                        <div className="relative glass rounded-2xl p-2 shadow-2xl shadow-indigo-500/10">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder="例: 天気予報, 決済, 画像認識, SNS..."
                                        className="w-full pl-12 pr-4 py-4 bg-slate-800/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!keyword.trim() || isLoading}
                                    className="btn-primary px-6 py-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="hidden sm:inline">検索中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            <span className="hidden sm:inline">AIで検索</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Quick Keywords */}
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {['Weather', 'Payment', 'Maps', 'AI/ML', 'Social', 'E-commerce'].map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setKeyword(tag)}
                                    className="px-3 py-1.5 rounded-lg text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 hover:text-slate-200 transition-all"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* URL Import Button */}
                        <div className="mt-6">
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-px flex-1 bg-slate-700/50"></div>
                                <span className="text-xs text-slate-500">または</span>
                                <div className="h-px flex-1 bg-slate-700/50"></div>
                            </div>
                            <button
                                type="button"
                                onClick={onOpenUrlImport}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all"
                            >
                                <Link2 className="w-4 h-4" />
                                <span>URLから直接登録</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
}

