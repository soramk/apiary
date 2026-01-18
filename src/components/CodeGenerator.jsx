import { useState } from 'react';
import { Code2, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { generateCode } from '../services/gemini';

export default function CodeGenerator({ api }) {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const languages = [
        { id: 'python', name: 'Python', color: 'text-yellow-400' },
        { id: 'nodejs', name: 'Node.js', color: 'text-green-400' },
        { id: 'powershell', name: 'PowerShell', color: 'text-blue-400' },
        { id: 'curl', name: 'cURL', color: 'text-orange-400' }
    ];

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setCode('');

        try {
            const generatedCode = await generateCode(api, language);
            setCode(generatedCode);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Language Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    プログラミング言語を選択
                </label>
                <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => setLanguage(lang.id)}
                            className={`px-4 py-2.5 rounded-xl font-medium transition-all ${language === lang.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200'
                                }`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 disabled:opacity-50 group"
                title="AI（トークン）を使用してサンプルコードを生成します"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        生成中...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                        コードを生成
                    </>
                )}
            </button>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <p className="text-rose-300 text-sm">{error}</p>
                </div>
            )}

            {/* Generated Code */}
            {code && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-700">生成されたコード</h4>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400">コピーしました</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    <span>コピー</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="code-block">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
                            <span className="text-xs text-slate-500">
                                {languages.find(l => l.id === language)?.name}
                            </span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-sm text-slate-300 max-h-[500px]">
                            <code>{code}</code>
                        </pre>
                    </div>
                </div>
            )}

            {/* Placeholder */}
            {!code && !error && !isLoading && (
                <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl bg-white/50">
                    <Code2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">
                        「コードを生成」をクリックすると、<br />
                        選択した言語のサンプルコードが生成されます
                    </p>
                </div>
            )}
        </div>
    );
}
