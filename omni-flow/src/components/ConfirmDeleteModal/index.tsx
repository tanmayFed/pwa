import { useDeleteTask } from "@/hooks/useDeleteTask";
import { dexieDb } from "@/lib/dexie-cache";
import { createPortal } from "react-dom";

interface ConfirmDeleteModalProps {
  task: { id: string; title: string } | null;
  onClose: () => void;
}

export function ConfirmDeleteModal({ task, onClose }: ConfirmDeleteModalProps) {
  const deleteTaskMutation = useDeleteTask();

  if (!task || typeof window === "undefined") return null;

  const handleConfirmDelete = async () => {
    await dexieDb.tasks.delete(task.id);
    deleteTaskMutation.mutate(task.id);
    onClose();
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(52, 57, 75, 0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
        }}
        onClick={onClose}
      />

      <div
        className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-center"
        style={{ position: "relative", zIndex: 1000000 }}
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-950/40 border border-red-900/30 mb-3 text-red-400 text-lg">
          ⚠️
        </div>

        <h3 className="text-lg font-semibold text-slate-100 mb-1">
          Delete Task Card?
        </h3>
        <p className="text-xs text-slate-400 mb-5 px-2 leading-relaxed">
          Are you sure you want to remove{" "}
          <span className="text-cyan-400 font-medium">"{task.title}"</span>{" "}
          permanently?
        </p>

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition w-24"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-md transition w-24"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
