import { Droppable } from "@hello-pangea/dnd";
import Card from "../Card";
import { AddTaskModalTrigger } from "../AddTask";

interface Task {
  id: string;
  columnId: string;
  content: string | null;
  createdAt: string;
  position: string;
  title: string;
  rank: number;
}

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  index: number;
  setTaskToDelete: (task: any) => void;
}

export default function Column({
  id,
  title,
  tasks,
  index,
  setTaskToDelete,
}: ColumnProps) {
  return (
    <section
      key={id}
      className="w-80 shrink-0 rounded-xl bg-slate-950 p-4 border border-slate-800 shadow-xl"
    >
      <h2 className="pb-3 mb-2 font-semibold text-slate-200 flex items-center justify-between border-b border-slate-50 pb-2">
        <span className="truncate pr-2">{title}</span>
        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-mono text-slate-400">
          {tasks.length}
        </span>
      </h2>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-3 p-2 mb-4 rounded-lg p-1 transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-slate-900/30" : "bg-transparent "
            }`}
            style={{
              minHeight: snapshot.isUsingPlaceholder ? "250px" : undefined,
            }}
          >
            {[...tasks]
              .sort((a, b) => a.rank - b.rank)
              .map((task, index) => (
                <Card
                  key={task.id}
                  id={task.id}
                  index={index}
                  title={task.title}
                  content={task.content ?? ""}
                  position={task.position}
                  rank={task.rank}
                  setTaskToDelete={setTaskToDelete}
                />
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {index === 0 ? (
        <AddTaskModalTrigger columnId={id} existingTasks={tasks} />
      ) : null}
    </section>
  );
}
