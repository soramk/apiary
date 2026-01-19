import {
    Sun,
    CreditCard,
    MapPin,
    Brain,
    Users,
    ShoppingBag,
    Database,
    Zap
} from 'lucide-react';

const QUICK_KEYWORDS = [
    { label: 'Weather', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Payment', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Maps', icon: MapPin, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
    { label: 'AI/ML', icon: Brain, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200' },
    { label: 'Social', icon: Users, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' },
    { label: 'E-commerce', icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200' },
];

export default function WelcomeBanner({ onQuickSearch, totalApis }) {
    // APIが登録済みの場合はバナーを表示しない
    if (totalApis > 0) {
        return null;
    }

    return (
        <section className="relative py-8 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-pink-200/20 via-sky-200/15 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-tl from-amber-200/20 via-pink-200/15 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Welcome Message */}
                <div className="mb-6 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-sky-100 border border-pink-200 mb-4">
                        <Zap className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-medium text-slate-700">AIがあなたのためにAPIを探します</span>
                    </div>

                    <h2 className="text-2xl lg:text-3xl font-bold mb-3">
                        <span className="gradient-text">はじめてのAPI検索</span>
                    </h2>

                    <p className="text-slate-600 max-w-xl mx-auto leading-relaxed">
                        上の検索バーにキーワードを入力するか、
                        <br className="hidden sm:inline" />
                        下のクイックキーワードから選んでください。
                    </p>
                </div>

                {/* Quick Keywords */}
                <div className="flex flex-wrap justify-center gap-2 animate-slide-up">
                    {QUICK_KEYWORDS.map(({ label, icon: Icon, color, bg, border }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => onQuickSearch?.(label)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${bg} ${border} border hover:shadow-md transition-all group`}
                        >
                            <Icon className={`w-4 h-4 ${color}`} />
                            <span className="text-slate-700">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Empty State Illustration */}
                <div className="mt-8 flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center">
                            <Database className="w-10 h-10 text-slate-300" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-pink-100 border border-pink-200 flex items-center justify-center animate-bounce">
                            <span className="text-lg">🐝</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
