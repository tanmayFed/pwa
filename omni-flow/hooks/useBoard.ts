"use client";

import { useQuery } from "@tanstack/react-query";
import { boardKeys } from "../lib/query-keys";
import { dexieDb } from "@/lib/dexie-cache";

export interface Task {
  id: string;
  title: string;
  content: string | null;
  position: string;
  columnId: string;
  rank: number;
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  createdAt: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  createdAt: string;
  columns: Column[];
}

async function fetchActiveBoard(): Promise<Board> {
  const offlineTasks = await dexieDb.tasks.toArray();
  let localBoard: any = null;
  if (offlineTasks.length > 0) {
    localBoard = {
      id: "workspace",
      columns: [
        {
          id: "todo",
          title: "To Do",
          tasks: offlineTasks.filter((t: any) => t.columnId === "todo"),
        },
        {
          id: "in-progress",
          title: "In Progress",
          tasks: offlineTasks.filter((t: any) => t.columnId === "in-progress"),
        },
        {
          id: "done",
          title: "Done",
          tasks: offlineTasks.filter((t: any) => t.columnId === "done"),
        },
      ],
    };
  }

  try {
    const response = await fetch("/api/board");
    if (!response.ok) {
      throw new Error("Failed to retrieve the active board workspace.");
    }

    const serverBoard = await response.json();

    const allNetworkTasks = serverBoard.columns.flatMap((col: any) =>
      col.tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        content: task.content ?? null,
        columnId: col.id,
        position: task.position,
      })),
    );
    if (allNetworkTasks.length > 0) {
      await dexieDb.tasks.bulkPut(allNetworkTasks);
    }

    return processBoardRanks(serverBoard);
  } catch (error) {
    console.warn(
      "Network fetch failed. Falling back to offline Dexie cache:",
      error,
    );

    if (!localBoard) {
      localBoard = {
        id: "empty",
        columns: [
          { id: "todo", title: "To Do", tasks: [] },
          { id: "in-progress", title: "In Progress", tasks: [] },
          { id: "done", title: "Done", tasks: [] },
        ],
      };
    }

    return processBoardRanks(localBoard);
  }
}

function processBoardRanks(board: any): Board {
  const updatedColumns = board.columns.map((col: any) => {
    const sortedByPosition = [...col.tasks].sort((a, b) =>
      a.position.localeCompare(b.position),
    );

    const tasksWithRanks = sortedByPosition.map((task, index) => ({
      ...task,
      rank: index,
    }));

    return { ...col, tasks: tasksWithRanks };
  });

  return { ...board, columns: updatedColumns };
}

export function useBoard() {
  return useQuery({
    queryKey: boardKeys.detail(),
    queryFn: fetchActiveBoard,
    staleTime: 5000,
  });
}
