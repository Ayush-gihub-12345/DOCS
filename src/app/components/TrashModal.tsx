import { X, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { Page } from '../types';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedPages: Page[];
  onRestore: (pageId: string) => void;
  onPermanentDelete: (pageId: string) => void;
}

export default function TrashModal({
  isOpen,
  onClose,
  deletedPages,
  onRestore,
  onPermanentDelete
}: TrashModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Trash ({deletedPages.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {deletedPages.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Trash is empty
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Deleted pages will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedPages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {page.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {page.content.substring(0, 120)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRestore(page.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      title="Restore page"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restore
                    </button>
                    <button
                      onClick={() => onPermanentDelete(page.id)}
                      className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {deletedPages.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-yellow-50 dark:bg-yellow-900/10">
            <div className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-400">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Pages in trash can be restored. Click "Delete permanently" to remove them forever.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
