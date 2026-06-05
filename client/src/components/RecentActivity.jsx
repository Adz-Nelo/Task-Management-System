import { useEffect, useState } from "react";
import {
  GitCommit,
  MessageSquare,
  Clock,
  Bug,
  Zap,
  Square,
} from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";

const typeIcons = {
  BUG: {
    icon: Bug,
    color: "text-red-500 dark:text-red-400 dracula:text-[#ff5555]",
  },
  FEATURE: {
    icon: Zap,
    color: "text-blue-500 dark:text-blue-400 dracula:text-[#8be9fd]",
  },
  TASK: {
    icon: Square,
    color: "text-green-500 dark:text-green-400 dracula:text-[#50fa7b]",
  },
  IMPROVEMENT: {
    icon: MessageSquare,
    color: "text-amber-500 dark:text-amber-400 dracula:text-[#ffb86c]",
  },
  OTHER: {
    icon: GitCommit,
    color: "text-purple-500 dark:text-purple-400 dracula:text-[#bd93f9]",
  },
};

const statusColors = {
  TODO: "bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-200 dracula:bg-[#6272a4] dracula:text-[#f8f8f2]",
  IN_PROGRESS:
    "bg-amber-200 text-amber-800 dark:bg-amber-500 dark:text-amber-900 dracula:bg-[#ffb86c] dracula:text-[#282a36]",
  DONE: "bg-emerald-200 text-emerald-800 dark:bg-emerald-500 dark:text-emerald-900 dracula:bg-[#50fa7b] dracula:text-[#282a36]",
};

const RecentActivity = () => {
  const [tasks, setTasks] = useState([]);
  const { currentWorkspace } = useSelector((state) => state.workspace);

  const getTasksFromCurrentWorkspace = () => {
    if (!currentWorkspace) return;

    const tasks = currentWorkspace.projects.flatMap((project) =>
      project.tasks.map((task) => task)
    );
    setTasks(tasks);
  };

  useEffect(() => {
    getTasksFromCurrentWorkspace();
  }, [currentWorkspace]);

  return (
    <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 dracula:bg-[#282a36] dracula:bg-gradient-to-br dracula:from-[#1e1f29] dracula:to-[#282a36] border border-zinc-200 dark:border-zinc-800 dracula:border-[#44475a] hover:border-zinc-300 dark:hover:border-zinc-700 dracula:hover:border-[#6272a4] rounded-lg transition-all overflow-hidden">
      <div className="border-b border-zinc-200 dark:border-zinc-800 dracula:border-[#44475a] p-4">
        <h2 className="text-lg text-zinc-800 dark:text-zinc-200 dracula:text-[#f8f8f2]">
          Recent Activity
        </h2>
      </div>

      <div className="p-0">
        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-200 dark:bg-zinc-800 dracula:bg-[#44475a] rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-zinc-600 dark:text-zinc-500 dracula:text-[#6272a4]" />
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 dracula:text-[#6272a4]">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 dracula:divide-[#44475a]">
            {tasks.map((task) => {
              const TypeIcon = typeIcons[task.type]?.icon || Square;
              const iconColor =
                typeIcons[task.type]?.color ||
                "text-gray-500 dark:text-gray-400 dracula:text-[#6272a4]";

              return (
                <div
                  key={task.id}
                  className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 dracula:hover:bg-[#44475a]/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-zinc-200 dark:bg-zinc-800 dracula:bg-[#44475a] rounded-lg">
                      <TypeIcon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-zinc-800 dark:text-zinc-200 dracula:text-[#f8f8f2] truncate">
                          {task.title}
                        </h4>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs ${
                            statusColors[task.status] ||
                            "bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300 dracula:bg-[#44475a] dracula:text-[#f8f8f2]"
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 dracula:text-[#6272a4]">
                        <span className="capitalize">
                          {task.type.toLowerCase()}
                        </span>
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-zinc-300 dark:bg-zinc-700 dracula:bg-[#6272a4] rounded-full flex items-center justify-center text-[10px] text-zinc-800 dark:text-zinc-200 dracula:text-[#f8f8f2]">
                              {task.assignee.name[0].toUpperCase()}
                            </div>
                            {task.assignee.name}
                          </div>
                        )}
                        <span>
                          {format(new Date(task.updatedAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
