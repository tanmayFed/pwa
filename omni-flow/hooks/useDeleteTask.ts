import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardKeys } from "../lib/query-keys";
import { Board } from "./useBoard";

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/board`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });
      if (!response.ok) throw new Error("Failed to delete task from server.");
      return response.json();
    },

    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail() });
      const previousBoard = queryClient.getQueryData<Board>(boardKeys.detail());

      queryClient.setQueryData<Board>(boardKeys.detail(), (oldBoard) => {
        if (!oldBoard) return oldBoard;

        const updatedColumns = oldBoard.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((task) => task.id !== taskId),
        }));

        return { ...oldBoard, columns: updatedColumns };
      });

      return { previousBoard };
    },

    onError: (err, taskId, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(boardKeys.detail(), context.previousBoard);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail() });
    },
  });
}
