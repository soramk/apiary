import { ExternalLink, Trash2, Key, DollarSign, Building2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function ApiCard({ api, onSelect, onDelete }) {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'deprecated':
                return {
                    label: 'Deprecated',
                    className: 'bg-amber-100 text-amber-700 border border-amber-300',
                    icon: AlertTriangle
                };
            case 'eol':
                return {
                    label: 'EOL',
                    className: 'bg-rose-100 text-rose-700 border border-rose-300',
                    icon: XCircle
                };
            default:
                return {
                    label: 'Active',
                    className: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
                    icon: CheckCircle
                };
        }
    };

    const statusConfig = getStatusConfig(api.status);
    const StatusIcon = statusConfig.icon;

    // 明るいテーマに合わせたカテゴリカラー
    const getCategoryColor = (category) => {
        const colors = {
            Finance: 'bg-emerald-100 text-emerald-700 border-emerald-300',
            Weather: 'bg-sky-100 text-sky-700 border-sky-300',
            Social: 'bg-pink-100 text-pink-700 border-pink-300',
            Maps: 'bg-amber-100 text-amber-700 border-amber-300',
            AI: 'bg-violet-100 text-violet-700 border-violet-300',
            'AI/ML': 'bg-violet-100 text-violet-700 border-violet-300',
            'E-commerce': 'bg-indigo-100 text-indigo-700 border-indigo-300',
            Communication: 'bg-cyan-100 text-cyan-700 border-cyan-300',
            Data: 'bg-blue-100 text-blue-700 border-blue-300',
            Entertainment: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
            default: 'bg-slate-100 text-slate-700 border-slate-300'
        };
        return colors[category] || colors.default;
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(api);
    };

    return (
        <div
            onClick={() => onSelect(api)}
            className="glass-card rounded-2xl p-6 cursor-pointer group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Category Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(api.category)}`}>
                        {api.category}
                    </div>
                    {/* Status Indicator */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusConfig.label}</span>
                    </div>
                </div>

                {/* Delete Button */}
                <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 transition-all"
                    title="削除"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* API Name & Provider */}
            <div className="mb-3">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-pink-600 transition-colors">
                    {api.name}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{api.provider}</span>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {api.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                    <Key className="w-3 h-3" />
                    <span>{api.authType}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                    <DollarSign className="w-3 h-3" />
                    <span>{api.pricing}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-xs text-slate-400">
                    {new Date(api.createdAt).toLocaleDateString('ja-JP')}
                </span>
                <a
                    href={api.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 transition-colors"
                >
                    <span>公式サイト</span>
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
