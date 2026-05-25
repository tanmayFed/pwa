import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardKeys } from "../lib/query-keys";
import { Board } from "./useBoard";

interface CreateTaskArgs {
  id: string;
  title: string;
  content: string;
  columnId: string;
  position: string;
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTask: CreateTaskArgs) => {
      const response = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error("Failed to save task to server.");
      return response.json();
    },

    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail() });
      const previousBoard = queryClient.getQueryData<Board>(boardKeys.detail());

      queryClient.setQueryData<Board>(boardKeys.detail(), (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const updatedColumns = oldBoard.columns.map((col) => {
          if (col.id !== newTask.columnId) return col;

          const freshUiTask = {
            id: newTask.id,
            title: newTask.title,
            content: newTask.content,
            columnId: newTask.columnId,
            position: newTask.position,
            rank: col.tasks.length,
            createdAt: new Date().toISOString(),
          };

          return { ...col, tasks: [...col.tasks, freshUiTask] };
        });

        return { ...oldBoard, columns: updatedColumns };
      });

      return { previousBoard };
    },

    onError: (err, newTask, context) => {
      console.error("Error creating task:", err);
      if (context?.previousBoard) {
        queryClient.setQueryData(boardKeys.detail(), context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail() });
    },
  });
}
