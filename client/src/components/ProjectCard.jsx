import { Link } from "react-router-dom";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  PLANNING:
    "bg-gray-200 dark:bg-zinc-600 dracula:bg-[#6272a4] text-gray-900 dark:text-zinc-200 dracula:text-[#f8f8f2]",
  ACTIVE:
    "bg-emerald-200 dark:bg-emerald-500 dracula:bg-[#50fa7b] text-emerald-900 dark:text-emerald-900 dracula:text-[#282a36]",
  ON_HOLD:
    "bg-amber-200 dark:bg-amber-500 dracula:bg-[#ffb86c] text-amber-900 dark:text-amber-900 dracula:text-[#282a36]",
  COMPLETED:
    "bg-blue-200 dark:bg-blue-500 dracula:bg-[#8be9fd] text-blue-900 dark:text-blue-900 dracula:text-[#282a36]",
  CANCELLED:
    "bg-red-200 dark:bg-red-500 dracula:bg-[#ff5555] text-red-900 dark:text-red-900 dracula:text-[#282a36]",
};

const ProjectCard = ({ project }) => {
  const members = project.members || [];
  const visibleMembers = members.slice(0, 3);
  const remainingCount = members.length - visibleMembers.length;

  return (
    <Link
      to={`/projectsDetail?id=${project.id}&tab=tasks`}
      className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 dracula:bg-[#282a36] dracula:bg-gradient-to-br dracula:from-[#1e1f29] dracula:to-[#282a36] border border-gray-200 dark:border-zinc-800 dracula:border-[#44475a] hover:border-gray-300 dark:hover:border-zinc-700 dracula:hover:border-[#6272a4] rounded-lg p-5 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-zinc-200 dracula:text-[#f8f8f2] mb-1 truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 dracula:group-hover:text-[#bd93f9] transition-colors">
            {project.name}
          </h3>
          <p className="text-gray-500 dark:text-zinc-400 dracula:text-[#6272a4] text-sm line-clamp-2 mb-3">
            {project.description || "No description"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            statusColors[project.status]
          }`}
        >
          {project.status.replace("_", " ")}
        </span>
        <span className="text-xs text-gray-500 dark:text-zinc-500 dracula:text-[#6272a4] capitalize">
          {project.priority} priority
        </span>
      </div>

      {/* Team Members */}
      {members.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {visibleMembers.map((member) => (
              <img
                key={member.user.id}
                src={member.user.image || "/default-avatar.png"}
                alt={member.user.name}
                className="size-7 rounded-full border-2 border-white dark:border-zinc-900 dracula:border-[#282a36] bg-gray-200 dark:bg-zinc-800"
                title={member.user.name}
              />
            ))}
            {remainingCount > 0 && (
              <div className="size-7 rounded-full border-2 border-white dark:border-zinc-900 dracula:border-[#282a36] bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-xs text-gray-600 dark:text-zinc-400 font-medium">
                +{remainingCount}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-zinc-500 dracula:text-[#6272a4]">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* End Date */}
      {project.end_date && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-500 dracula:text-[#6272a4] mb-4">
          <CalendarIcon className="size-3.5" />
          <span>Ends {format(new Date(project.end_date), "dd MMM yyyy")}</span>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-zinc-500 dracula:text-[#6272a4]">
            Progress
          </span>
          <span className="text-gray-400 dark:text-zinc-400 dracula:text-[#8be9fd]">
            {project.progress || 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-zinc-800 dracula:bg-[#44475a] h-1.5 rounded">
          <div
            className="h-1.5 rounded bg-blue-500 dark:dracula:bg-[#bd93f9] transition-all duration-300"
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
