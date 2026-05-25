import { Task } from "@/hooks/useBoard";
import { useCreateTask } from "@/hooks/useCreateTask";
import { dexieDb } from "@/lib/dexie-cache";
import { generateLexicalRank } from "@/lib/lexical-ranking";
import React, { useState } from "react";
import { createPortal } from "react-dom";

interface AddTaskModalTriggerProps {
  columnId: string;
  existingTasks: Task[];
}

export function AddTaskModalTrigger({
  columnId,
  existingTasks,
}: AddTaskModalTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const createTaskMutation = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const sortedTasks = [...existingTasks].sort((a, b) => a.rank - b.rank);
    const lastCard = sortedTasks[sortedTasks.length - 1];

    const nextLexicalPosition = generateLexicalRank(
      lastCard ? lastCard.position : null,
      null,
    );

    const generatedId = crypto.randomUUID();

    const taskPayload = {
      id: generatedId,
      title: title.trim(),
      content: content.trim(),
      columnId,
      position: nextLexicalPosition,
    };

    await dexieDb.tasks.put(taskPayload);
    createTaskMutation.mutate(taskPayload);

    setTitle("");
    setContent("");
    setIsOpen(false);
  };

  return (
    <div className="ml-2">
      <button
        onClick={() => setIsOpen(true)}
        className="w-7 h-7 text-sm text-white rounded-full bg-sky-700 hover:bg-sky-800 transition font-medium"
      >
        +
      </button>

      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(15, 23, 42, 0.6)",
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
                cursor: "pointer",
              }}
              onClick={() => setIsOpen(false)}
            />
            <div
              className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl border border-gray-100"
              style={{
                position: "relative",
                zIndex: 100000,
                backgroundColor: "#ffffff",
                borderRadius: "0.75rem",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Create New Task
              </h3>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    autoFocus
                    required
                    placeholder=""
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about this ticket..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition"
                  />
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-400 rounded-md transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-sky-700 hover:bg-sky-900 rounded-md shadow-sm transition"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
