import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, UsersIcon, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import CreateProjectDialog from "./CreateProjectDialog";

const ProjectOverview = () => {
    const statusColors = {
        PLANNING: "bg-zinc-200 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-200 dracula:bg-[#6272a4] dracula:text-[#f8f8f2]",
        ACTIVE: "bg-emerald-200 text-emerald-800 dark:bg-emerald-500 dark:text-emerald-900 dracula:bg-[#50fa7b] dracula:text-[#282a36]",
        ON_HOLD: "bg-amber-200 text-amber-800 dark:bg-amber-500 dark:text-amber-900 dracula:bg-[#ffb86c] dracula:text-[#282a36]",
        COMPLETED: "bg-blue-200 text-blue-800 dark:bg-blue-500 dark:text-blue-900 dracula:bg-[#8be9fd] dracula:text-[#282a36]",
        CANCELLED: "bg-red-200 text-red-800 dark:bg-red-500 dark:text-red-900 dracula:bg-[#ff5555] dracula:text-[#282a36]"
    };

    const priorityColors = {
        LOW: "border-zinc-300 text-zinc-600 dark:border-zinc-600 dark:text-zinc-400 dracula:border-[#6272a4] dracula:text-[#8be9fd]",
        MEDIUM: "border-amber-300 text-amber-700 dark:border-amber-500 dark:text-amber-400 dracula:border-[#ffb86c] dracula:text-[#ffb86c]",
        HIGH: "border-green-300 text-green-700 dark:border-green-500 dark:text-green-400 dracula:border-[#50fa7b] dracula:text-[#50fa7b]",
    };

    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        setProjects(currentWorkspace?.projects || []);
    }, [currentWorkspace]);

    return currentWorkspace && (
        <div className="bg-white dark:bg-zinc-950 dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 dracula:bg-[#282a36] dracula:bg-gradient-to-br dracula:from-[#1e1f29] dracula:to-[#282a36] border border-zinc-200 dark:border-zinc-800 dracula:border-[#44475a] hover:border-zinc-300 dark:hover:border-zinc-700 dracula:hover:border-[#6272a4] transition-all duration-200 rounded-lg overflow-hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-800 dracula:border-[#44475a] p-4 flex items-center justify-between">
                <h2 className="text-md text-zinc-800 dark:text-zinc-300 dracula:text-[#f8f8f2]">Project Overview</h2>
                <Link to={'/projects'} className="text-sm text-zinc-600 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 dracula:text-[#8be9fd] dracula:hover:text-[#ffb86c] flex items-center">
                    View all <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </div>

            <div className="p-0">
                {projects.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-500 dracula:bg-[#44475a] dracula:text-[#6272a4] rounded-full flex items-center justify-center">
                            <FolderOpen size={32} />
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 dracula:text-[#6272a4]">No projects yet</p>
                        <button onClick={() => setIsDialogOpen(true)} className="mt-4 px-4 py-2 text-sm bg-gradient-to-br from-blue-500 to-blue-600 dracula:from-[#bd93f9] dracula:to-[#ff79c6] text-white dark:text-zinc-200 rounded hover:opacity-90 transition">
                            Create your First Project
                        </button>
                        <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800 dracula:divide-[#44475a]">
                        {projects.slice(0, 5).map((project) => (
                            <Link key={project.id} to={`/projectsDetail?id=${project.id}&tab=tasks`} className="block p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 dracula:hover:bg-[#44475a]/50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-zinc-800 dark:text-zinc-300 dracula:text-[#f8f8f2] mb-1">
                                            {project.name}
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 dracula:text-[#6272a4] line-clamp-2">
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <span className={`text-xs px-2 py-1 rounded ${statusColors[project.status]}`}>
                                            {project.status.replace('_', ' ').replaceAll(/\b\w/g, c => c.toUpperCase())}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full border-2 ${priorityColors[project.priority]}`} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 dracula:text-[#6272a4] mb-3">
                                    <div className="flex items-center gap-4">
                                        {project.members?.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <UsersIcon className="w-3 h-3 dracula:text-[#8be9fd]" />
                                                {project.members.length} members
                                            </div>
                                        )}
                                        {project.end_date && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 dracula:text-[#ffb86c]" />
                                                {format(new Date(project.end_date), "MMM d, yyyy")}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500 dark:text-zinc-500 dracula:text-[#6272a4]">Progress</span>
                                        <span className="text-zinc-600 dark:text-zinc-400 dracula:text-[#8be9fd]">{project.progress || 0}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 dracula:bg-[#44475a] rounded h-1.5">
                                        <div className="h-1.5 bg-blue-500 rounded" style={{ width: `${project.progress || 0}%` }} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectOverview;
