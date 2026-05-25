import { Draggable } from "@hello-pangea/dnd";

interface CardProps {
  id: string;
  index: number;
  title: string;
  content: string;
  position: string;
  rank: number;
  setTaskToDelete: (task: any) => void;
}

export default function Card({
  id,
  index,
  title,
  content,
  position,
  rank,
  setTaskToDelete,
}: CardProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
          }}
          className="group rounded-lg bg-slate-900 p-4 border border-slate-500 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all duration-200 shadow-md cursor-pointer"
        >
          <h3 className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
            {title}
          </h3>

          {content && (
            <p className="mt-1.5 text-xs text-slate-400 line-clamp-3 leading-relaxed">
              {content}
            </p>
          )}

          <div className="flex justify-end items-center pt-2 mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTaskToDelete({ id, title });
              }}
              className="text-[11px] font-medium text-red-400 hover:text-red-300 hover:!bg-red-500 px-2 py-0.5 rounded transition border border-red-400 hover:border-red-900/30"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
