"use client";
import { Board, Task, useBoard } from "@/hooks/useBoard";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useUpdateTaskPosition } from "@/hooks/useUpdateTaskPosition";
import { dexieDb } from "@/lib/dexie-cache";
import { generateLexicalRank } from "@/lib/lexical-ranking";
import { boardKeys } from "@/lib/query-keys";
import { ConfirmDeleteModal } from "@/src/components/ConfirmDeleteModal";
import Column from "@/src/components/Coulmn";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: board, isLoading, error, isFetching } = useBoard();
  const [mounted, setMounted] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const updateTaskPositionMutation = useUpdateTaskPosition();
  const isOnline = useNetworkStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen w-screen bg-slate-950" />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        <p className="text-sm font-medium text-slate-400 animate-pulse">
          Loading workspace...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <p className="text-red-400 font-semibold mb-1">
          Failed to establish system link
        </p>
        <p className="text-xs text-slate-500 font-mono max-w-md break-words">
          {error.message}
        </p>
      </div>
    );
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === "DEFAULT") {
      let taskToSaveToDb: any = null;

      queryClient.setQueryData<Board>(boardKeys.detail(), (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const newColumns = oldBoard.columns.map((col) => ({
          ...col,
          tasks: [...col.tasks].sort((a, b) => a.rank - b.rank),
        }));

        const sourceCol = newColumns.find(
          (col) => col.id === source.droppableId,
        );
        const destCol = newColumns.find(
          (col) => col.id === destination.droppableId,
        );

        if (!sourceCol || !destCol) return oldBoard;

        const [movedTask] = sourceCol.tasks.splice(source.index, 1);
        if (!movedTask) return oldBoard;

        movedTask.columnId = destination.droppableId;

        destCol.tasks.splice(destination.index, 0, movedTask);

        if (sourceCol.id !== destCol.id) {
          sourceCol.tasks.forEach((task, idx) => {
            task.rank = idx;
          });
        }
        destCol.tasks.forEach((task, idx) => {
          task.rank = idx;
        });

        const cardAbove = destCol.tasks[destination.index - 1];
        const cardBelow = destCol.tasks[destination.index + 1];

        movedTask.position = generateLexicalRank(
          cardAbove ? cardAbove.position : null,
          cardBelow ? cardBelow.position : null,
        );

        taskToSaveToDb = movedTask;
        return { ...oldBoard, columns: newColumns };
      });

      if (taskToSaveToDb) {
        try {
          await dexieDb.tasks.put({
            id: taskToSaveToDb.id,
            title: taskToSaveToDb.title,
            content: taskToSaveToDb.content,
            columnId: taskToSaveToDb.columnId,
            position: taskToSaveToDb.position,
          });

          updateTaskPositionMutation.mutate({
            id: taskToSaveToDb.id,
            columnId: taskToSaveToDb.columnId,
            position: taskToSaveToDb.position,
          });
        } catch (error) {
          console.error("Dexie sync write failure:", error);
        }
      }
    }
  };

  return (
    <div className="size-full flex flex-col bg-gray-800 text-slate-100 min-h-screen">
      {!isOnline && (
        <div className="flex justify-center p-1 bg-red-800 font-bold text-white">
          Offline mode - data will sync when you are online
        </div>
      )}
      <DragDropContext onDragEnd={handleDragEnd}>
        <header className="mb-8 p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {board?.title}
            </h1>
            <p className="text-xs mt-0.5 font-medium text-slate-400">
              Data Context:{" "}
              {isFetching
                ? "🔄 Fetching updates from Postgres..."
                : "⚡ Mounted from local memory"}
            </p>
          </div>
        </header>
        <main className="flex-1 overflow-x-auto p-8 select-none">
          <div className="flex gap-6 h-full min-w-max items-start">
            {board?.columns.map((column, index) => (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={column.tasks}
                index={index}
                setTaskToDelete={setTaskToDelete}
              />
            ))}
          </div>
        </main>
      </DragDropContext>
      <ConfirmDeleteModal
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
      />
    </div>
  );
}
