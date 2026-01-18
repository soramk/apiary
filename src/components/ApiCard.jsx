import { ExternalLink, Trash2, Key, DollarSign, Building2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function ApiCard({ api, onSelect, onDelete }) {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'deprecated':
                return {
                    label: 'Deprecated',
                    className: 'status-deprecated',
                    icon: AlertTriangle
                };
            case 'eol':
                return {
                    label: 'EOL',
                    className: 'status-eol',
                    icon: XCircle
                };
            default:
                return {
                    label: 'Active',
                    className: 'status-active',
                    icon: CheckCircle
                };
        }
    };

    const statusConfig = getStatusConfig(api.status);
    const StatusIcon = statusConfig.icon;

    const getCategoryColor = (category) => {
        const colors = {
            Finance: 'from-emerald-500 to-teal-600',
            Weather: 'from-blue-500 to-cyan-600',
            Social: 'from-pink-500 to-rose-600',
            Maps: 'from-amber-500 to-orange-600',
            AI: 'from-violet-500 to-purple-600',
            'AI/ML': 'from-violet-500 to-purple-600',
            'E-commerce': 'from-indigo-500 to-blue-600',
            default: 'from-slate-500 to-slate-600'
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
                <div className="flex items-center gap-3">
                    {/* Category Badge */}
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(api.category)}`}>
                        {api.category}
                    </div>
                    {/* Status Indicator */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${statusConfig.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusConfig.label}</span>
                    </div>
                </div>

                {/* Delete Button */}
                <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                    title="削除"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* API Name & Provider */}
            <div className="mb-3">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {api.name}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{api.provider}</span>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-400 line-clamp-3 mb-4">
                {api.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/50 text-xs text-slate-300">
                    <Key className="w-3 h-3 text-amber-400" />
                    <span>{api.authType}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/50 text-xs text-slate-300">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span>{api.pricing}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <span className="text-xs text-slate-500">
                    {new Date(api.createdAt).toLocaleDateString('ja-JP')}
                </span>
                <a
                    href={api.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    <span>公式サイト</span>
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
