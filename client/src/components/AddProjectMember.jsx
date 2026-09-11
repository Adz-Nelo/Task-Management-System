import { useState } from "react";
import { Mail, UserPlus, XIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/react";
import api from "../configs/api";
import toast from "react-hot-toast";
import { fetchWorkspaces } from "../features/workspaceSlice";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );

  const project = currentWorkspace?.projects.find((p) => p.id === id);
  const projectMembersEmails = project?.members.map(
    (member) => member.user.email
  );

  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      await api.put(
        `/api/projects/${project.id}/addMember`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      toast.success("Project added successfully");
      setIsDialogOpen(false);
      dispatch(fetchWorkspaces({ getToken }));
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isDialogOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50"
      onClick={() => setIsDialogOpen(false)}
    >
      <div
        className="bg-white dark:bg-zinc-900 dracula:bg-[#282a36] border border-zinc-200 dark:border-zinc-800 dracula:border-[#44475a] rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] relative max-h-[90vh] overflow-y-auto mx-4 my-8 dialog-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          onClick={() => setIsDialogOpen(false)}
        >
          <XIcon className="size-5" />
        </button>

        <h2 className="text-xl font-medium mb-1 flex items-center gap-2">
          <UserPlus className="size-5 text-zinc-900 dark:text-zinc-200" /> Add
          Member to Project
        </h2>
        {currentWorkspace && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 dracula:text-[#6272a4] mb-4">
            Adding to Project:{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {project.name}
            </span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-900 dark:text-zinc-200"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
              {/* List All non project members from current workspace */}
              <select
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dracula:bg-[#44475a] text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] text-sm placeholder-zinc-400 dark:placeholder-zinc-500 py-2 focus:outline-none focus:border-blue-500 dracula:focus:border-[#bd93f9]"
                required
              >
                <option value="">Select a member</option>
                {currentWorkspace?.members
                  .filter(
                    (member) =>
                      !projectMembersEmails.includes(member.user.email)
                  )
                  .map((member) => (
                    <option key={member.user.id} value={member.user.email}>
                      {" "}
                      {member.user.email}{" "}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 text-sm">
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !currentWorkspace}
              className="px-4 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 dracula:from-[#bd93f9] dracula:to-[#ff79c6] text-white disabled:opacity-50 hover:opacity-90 transition"
            >
              {isAdding ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectMember;
