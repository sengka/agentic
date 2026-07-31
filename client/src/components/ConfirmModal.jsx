export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Sil",
  cancelLabel = "İptal",
  danger = true,
  loading = false,
  isDark = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div
        className={`w-full max-w-sm rounded-2xl p-6 border ${
          isDark ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm mb-6`}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
              isDark ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center gap-2 ${
              danger ? "bg-red-600 hover:bg-red-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? "İşleniyor..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}