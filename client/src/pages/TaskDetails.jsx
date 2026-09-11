import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon } from "lucide-react";
import { assets } from "../assets/assets";
import { useAuth, useUser } from "@clerk/react";
import api from "../configs/api";

const TaskDetails = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const taskId = searchParams.get("taskId");

  const { user } = useUser();
  const { getToken } = useAuth();

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const { currentWorkspace } = useSelector((state) => state.workspace);

  const fetchComments = async () => {
    if (!taskId) return;

    try {
      const token = await getToken();
      const { data } = await api.get(`/api/comments/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComments(data.comments || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const fetchTaskDetails = async () => {
    setLoading(true);
    if (!projectId || !taskId) return;

    const proj = currentWorkspace.projects.find((p) => p.id === projectId);
    if (!proj) return;

    const tsk = proj.tasks.find((t) => t.id === taskId);
    if (!tsk) return;

    setTask(tsk);
    setProject(proj);
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      toast.loading("Adding comment...");
      const token = await getToken();
      const { data } = await api.post(
        `/api/comments`,
        { taskId: task.id, content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments((prev) => [...prev, data.comment]);
      setNewComment("");
      toast.dismissAll();
      toast.success("Comment added.");
    } catch (error) {
      toast.dismissAll();
      toast.error(error?.response?.data?.message || error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  useEffect(() => {
    if (taskId && task) {
      fetchComments();
      const interval = setInterval(() => {
        fetchComments();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [taskId, task]);

  if (loading)
    return (
      <div className="text-gray-500 dark:text-zinc-400 dracula:text-[#6272a4] px-4 py-6">
        Loading task details...
      </div>
    );
  if (!task)
    return <div className="text-red-500 px-4 py-6">Task not found.</div>;

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 text-gray-900 dark:text-zinc-100 dracula:text-[#f8f8f2] max-w-6xl mx-auto">
      {/* Left: Comments / Chatbox */}
      <div className="w-full lg:w-2/3">
        <div className="p-5 rounded-md border border-gray-300 dark:border-zinc-800 dracula:border-[#44475a] dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 dracula:bg-[#282a36] dracula:bg-gradient-to-br dracula:from-[#1e1f29] dracula:to-[#282a36] flex flex-col lg:h-[80vh]">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-white dracula:text-[#f8f8f2]">
            <MessageCircle className="size-5" /> Task Discussion (
            {comments.length})
          </h2>

          <div className="flex-1 md:overflow-y-scroll no-scrollbar">
            {comments.length > 0 ? (
              <div className="flex flex-col gap-4 mb-6 mr-2">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`sm:max-w-4/5 dark:bg-gradient-to-br dracula:bg-[#262838] border border-gray-300 dark:border-zinc-700 dracula:border-[#6272a4] p-3 rounded-md ${
                      comment.user.id === user?.id ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-sm text-gray-500 dark:text-zinc-400 dracula:text-[#6272a4]">
                      <img
                        src={comment.user.image}
                        alt="avatar"
                        className="size-5 rounded-full"
                      />
                      <span className="font-medium text-gray-900 dark:text-white dracula:text-[#f8f8f2]">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-zinc-600 dracula:text-[#6272a4]">
                        •{" "}
                        {format(
                          new Date(comment.createdAt),
                          "dd MMM yyyy, HH:mm"
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-zinc-200 dracula:text-[#f8f8f2]">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-zinc-500 dracula:text-[#6272a4] mb-4 text-sm">
                No comments yet. Be the first!
              </p>
            )}
          </div>

          {/* Add Comment */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full dark:bg-zinc-800 dracula:bg-[#44475a] border border-gray-300 dark:border-zinc-700 dracula:border-[#44475a] rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200 dracula:text-[#f8f8f2] resize-none focus:outline-none focus:border-blue-500 dracula:focus:border-[#bd93f9]"
              rows={3}
            />
            <button
              onClick={handleAddComment}
              className="bg-gradient-to-l from-blue-500 to-blue-600 dracula:from-[#bd93f9] dracula:to-[#ff79c6] transition-colors text-white text-sm px-5 py-2 rounded "
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Right: Task + Project Info */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        {/* Task Info */}
        <div className="p-5 rounded-md bg-white dark:bg-zinc-900 dracula:bg-[#282a36] border border-gray-300 dark:border-zinc-800 dracula:border-[#44475a]">
          <div className="mb-3">
            <h1 className="text-lg font-medium text-gray-900 dark:text-zinc-100 dracula:text-[#f8f8f2]">
              {task.title}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 dracula:bg-[#6272a4] text-zinc-900 dark:text-zinc-300 dracula:text-[#f8f8f2] text-xs">
                {task.status}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-900 dracula:bg-[#8be9fd] text-blue-900 dark:text-blue-300 dracula:text-[#282a36] text-xs">
                {task.type}
              </span>
              <span className="px-2 py-0.5 rounded bg-green-200 dark:bg-emerald-900 dracula:bg-[#50fa7b] text-green-900 dark:text-emerald-300 dracula:text-[#282a36] text-xs">
                {task.priority}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-600 dark:text-zinc-400 dracula:text-[#6272a4] leading-relaxed mb-4">
              {task.description}
            </p>
          )}

          <hr className="border-zinc-200 dark:border-zinc-700 dracula:border-[#44475a] my-3" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-zinc-300 dracula:text-[#f8f8f2]">
            <div className="flex items-center gap-2">
              <img
                src={task.assignee?.image}
                className="size-5 rounded-full"
                alt="avatar"
              />
              {task.assignee?.name || "Unassigned"}
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-gray-500 dark:text-zinc-500 dracula:text-[#bd93f9]" />
              Due : {format(new Date(task.due_date), "dd MMM yyyy")}
            </div>
          </div>
        </div>

        {/* Project Info */}
        {project && (
          <div className="p-4 rounded-md bg-white dark:bg-zinc-900 dracula:bg-[#282a36] text-zinc-700 dark:text-zinc-200 dracula:text-[#f8f8f2] border border-gray-300 dark:border-zinc-800 dracula:border-[#44475a]">
            <p className="text-xl font-medium mb-4">Project Details</p>
            <h2 className="text-gray-900 dark:text-zinc-100 dracula:text-[#f8f8f2] flex items-center gap-2">
              {" "}
              <PenIcon className="size-4" /> {project.name}
            </h2>
            <p className="text-xs mt-3">
              Project Start Date:{" "}
              {format(new Date(project.start_date), "dd MMM yyyy")}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400 dracula:text-[#6272a4] mt-3">
              <span>Status: {project.status}</span>
              <span>Priority: {project.priority}</span>
              <span>Progress: {project.progress}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;
