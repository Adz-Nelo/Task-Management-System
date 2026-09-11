import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useSelector } from "react-redux";
import { useOrganization } from "@clerk/react";
import toast from "react-hot-toast";

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }) => {
  const { organization } = useOrganization();

  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "org:member",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await organization.inviteMember({
        emailAddress: formData.email,
        role: formData.role,
      });

      toast.success("Invitation sent successfully!");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
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
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-medium mb-1 flex items-center gap-2">
            <UserPlus className="size-5 text-zinc-900 dark:text-zinc-200" />{" "}
            Invite Team Member
          </h2>
          {currentWorkspace && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 dracula:text-[#6272a4]">
              Inviting to workspace:{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {currentWorkspace.name}
              </span>
            </p>
          )}
        </div>

        {/* Form */}
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
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
                className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dracula:bg-[#44475a] text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] text-sm placeholder-zinc-400 dark:placeholder-zinc-500 py-2 focus:outline-none focus:border-blue-500 dracula:focus:border-[#bd93f9]"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-200">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dracula:bg-[#44475a] text-zinc-900 dark:text-zinc-200 dracula:text-[#f8f8f2] py-2 px-3 mt-1 focus:outline-none focus:border-blue-500 dracula:focus:border-[#bd93f9] text-sm"
            >
              <option value="org:member">Member</option>
              <option value="org:admin">Admin</option>
            </select>
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
              disabled={isSubmitting || !currentWorkspace}
              className="px-4 py-2 rounded bg-gradient-to-br from-blue-500 to-blue-600 dracula:from-[#bd93f9] dracula:to-[#ff79c6] text-white disabled:opacity-50 hover:opacity-90 transition"
            >
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberDialog;
