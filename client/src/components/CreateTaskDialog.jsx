import { useState, useRef } from "react";
import { Calendar as CalendarIcon, XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { useAuth } from "@clerk/react";
import api from "../configs/api";
import toast from "react-hot-toast";
import { addTask } from "../features/workspaceSlice";

export default function CreateTaskDialog({
  showCreateTask,
  setShowCreateTask,
  projectId,
}) {
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );
  const theme = useSelector((state) => state.theme.theme);
  const project = currentWorkspace?.projects.find((p) => p.id === projectId);
  const teamMembers = project?.members || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const dueDateRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "TASK",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    due_date: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await api.post(
        "/api/tasks",
        {
          ...formData,
          workspaceId: currentWorkspace.id,
          projectId,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      setShowCreateTask(false);
      setFormData({
        title: "",
        description: "",
        type: "TASK",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        due_date: "",
      });
      toast.success(data.message);
      dispatch(addTask(data.task));
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showCreateTask) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50"
      onClick={() => setShowCreateTask(false)}
    >
      <div
        className="bg-white dark:bg-zinc-900 dracula:bg-[#282a36] border border-zinc-200 dark:border-zinc-800 dracula:border-[#44475a] rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] relative max-h-[90vh] overflow-y-auto mx-4 my-8 dialog-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          onClick={() => setShowCreateTask(false)}
        >
          <XIcon className="size-5" />
        </button>

        <h2 className="text-xl font-medium mb-1">Create New Task</h2>
        {currentWorkspace && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 dracula:text-[#6272a4] mb-4">
            In project:{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {project.name}
            </span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-200"
            >
              Title
            </label>
            <input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Task title"
              className="w-full px-3 py-2 rounded dark:bg-zinc-800 dracula:bg-[#44475a] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] text-sm mt-1 focus:outline-none focus:border-blue-500 dracula:focus:border-[#bd93f9]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-200"
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the task"
              className="w-full px-3 py-2 rounded dark:bg-zinc-800 dracula:bg-[#44475a] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] text-sm mt-1 h-24 focus:outline-none focus:border-blue-500 dracula:focus:border-[#bd93f9]"
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 rounded dark:bg-zinc-800 dracula:bg-[#44475a] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] text-sm mt-1"
              >
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
                <option value="TASK">Task</option>
                <option value="IMPROVEMENT">Improvement</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-3 py-2 rounded dark:bg-zinc-800 dracula:bg-[#44475a] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] text-sm mt-1"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Assignee and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200">
                Assignee
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) =>
                  setFormData({ ...formData, assigneeId: e.target.value })
                }
                className="w-full px-3 py-2 rounded dark:bg-zinc-800 dracula:bg-[#44475a] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] text-sm mt-1"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member?.user.id} value={member?.user.id}>
                    {member?.user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 rounded dark:bg-zinc-800 dracula:bg-[#44475a] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] text-sm mt-1"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200">
              Due Date
            </label>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
              <div className="relative flex-1">
                <input
                  ref={dueDateRef}
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 pr-10 rounded dark:bg-zinc-800 dracula:bg-[#44475a] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] text-sm cursor-pointer focus:border-blue-500 dracula:focus:border-[#bd93f9] focus:outline-none"
                  style={{
                    colorScheme: theme === "dracula" ? "dark" : "light",
                  }}
                />
                <button
                  type="button"
                  onClick={() => dueDateRef.current?.showPicker?.()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-900 dark:text-zinc-100 dracula:text-[#f8f8f2]"
                >
                  <CalendarIcon className="size-4" />
                </button>
              </div>
            </div>
            {formData.due_date && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 dracula:text-[#6272a4]">
                {format(new Date(formData.due_date), "PPP")}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 text-sm">
            <button
              type="button"
              onClick={() => setShowCreateTask(false)}
              className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 dracula:from-[#bd93f9] dracula:to-[#ff79c6] text-white disabled:opacity-50 hover:opacity-90 transition"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
