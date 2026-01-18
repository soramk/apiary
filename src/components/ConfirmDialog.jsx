import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            ></div>

            {/* Dialog */}
            <div className="relative glass rounded-2xl p-6 max-w-md w-full animate-slide-up shadow-2xl">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${type === 'danger'
                            ? 'bg-rose-500/20'
                            : 'bg-amber-500/20'
                        }`}>
                        <AlertTriangle className={`w-6 h-6 ${type === 'danger' ? 'text-rose-400' : 'text-amber-400'
                            }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                        <p className="text-slate-400 text-sm">{message}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2.5 rounded-xl font-medium text-white transition-all ${type === 'danger'
                                ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/30'
                                : 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-500/30'
                            }`}
                    >
                        削除する
                    </button>
                </div>
            </div>
        </div>
    );
}
