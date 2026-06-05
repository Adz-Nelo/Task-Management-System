import { useEffect, useState } from "react";
import { ArrowRight, Clock, AlertTriangle, User } from "lucide-react";
import { useSelector } from "react-redux";

export default function TasksSummary() {
  const { currentWorkspace } = useSelector((state) => state.workspace);
  const user = { id: "user_1" };
  const [tasks, setTasks] = useState([]);

  // Get all tasks for all projects in current workspace
  useEffect(() => {
    if (currentWorkspace) {
      setTasks(currentWorkspace.projects.flatMap((project) => project.tasks));
    }
  }, [currentWorkspace]);

  const myTasks = tasks.filter((i) => i.assigneeId === user.id);
  const overdueTasks = tasks.filter(
    (t) =>
      t.due_date && new Date(t.due_date) < new Date() && t.status !== "DONE"
  );
  const inProgressIssues = tasks.filter((i) => i.status === "IN_PROGRESS");

  const summaryCards = [
    {
      title: "My Tasks",
      count: myTasks.length,
      icon: User,
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 dracula:bg-[#44475a] dracula:text-[#50fa7b]",
      items: myTasks.slice(0, 3),
    },
    {
      title: "Overdue",
      count: overdueTasks.length,
      icon: AlertTriangle,
      color:
        "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 dracula:bg-[#44475a] dracula:text-[#ff5555]",
      items: overdueTasks.slice(0, 3),
    },
    {
      title: "In Progress",
      count: inProgressIssues.length,
      icon: Clock,
      color:
        "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 dracula:bg-[#44475a] dracula:text-[#8be9fd]",
      items: inProgressIssues.slice(0, 3),
    },
  ];

  return (
    <div className="space-y-6">
      {summaryCards.map((card) => (
        <div
          key={card.title}
          className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 dracula:bg-[#282a36] dracula:bg-gradient-to-br dracula:from-[#1e1f29] dracula:to-[#282a36] border border-zinc-200 dark:border-zinc-800 dracula:border-[#44475a] hover:border-zinc-300 dark:hover:border-zinc-700 dracula:hover:border-[#6272a4] transition-all duration-200 rounded-lg overflow-hidden"
        >
          <div className="border-b border-zinc-200 dark:border-zinc-800 dracula:border-[#44475a] p-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-50 dark:bg-zinc-800 dracula:bg-[#44475a] rounded-lg">
                <card.icon className="w-4 h-4 text-gray-500 dark:text-zinc-400 dracula:text-[#8be9fd]" />
              </div>
              <div className="flex items-center justify-between flex-1">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white dracula:text-[#f8f8f2]">
                  {card.title}
                </h3>
                <span
                  className={`inline-block mt-1 px-2 py-1 rounded text-xs font-semibold ${card.color}`}
                >
                  {card.count}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4">
            {card.items.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-zinc-400 dracula:text-[#6272a4] text-center py-4">
                No {card.title.toLowerCase()}
              </p>
            ) : (
              <div className="space-y-3">
                {card.items.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 dracula:bg-[#1e1f29] hover:bg-zinc-100 dark:hover:bg-zinc-800 dracula:hover:bg-[#44475a] transition-colors cursor-pointer"
                  >
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white dracula:text-[#f8f8f2] truncate">
                      {issue.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-zinc-400 dracula:text-[#6272a4] capitalize mt-1">
                      {issue.type} • {issue.priority} priority
                    </p>
                  </div>
                ))}
                {card.count > 3 && (
                  <button className="flex items-center justify-center w-full text-sm text-gray-500 dark:text-zinc-400 dracula:text-[#8be9fd] hover:text-gray-800 dark:hover:text-white dracula:hover:text-[#ffb86c] mt-2">
                    View {card.count - 3} more{" "}
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
