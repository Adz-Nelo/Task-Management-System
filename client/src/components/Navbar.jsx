import { SearchIcon, PanelLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/themeSlice";
import { MoonIcon, SunIcon } from "lucide-react";
import { assets } from "../assets/assets";
import { UserButton } from "@clerk/react";

const Navbar = ({ setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);

  return (
    <div className="w-full bg-white  dracula:bg-[#282a36] border-b border-gray-200  dracula:border-[#44475a] px-6 xl:px-16 py-3 flex-shrink-0">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Sidebar Trigger */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="sm:hidden p-2 rounded-lg transition-colors text-gray-700  dracula:text-[#f8f8f2] hover:bg-gray-100 :bg-zinc-800 dracula:hover:bg-[#44475a]"
          >
            <PanelLeft size={20} />
          </button>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400  dracula:text-[#6272a4] size-3.5" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="pl-8 pr-4 py-2 w-full bg-white  dracula:bg-[#44475a] border border-gray-300  dracula:border-[#6272a4] rounded-md text-sm text-gray-900  dracula:text-[#f8f8f2] placeholder-gray-400  dracula:placeholder-[#6272a4] focus:outline-none focus:ring-1 focus:ring-blue-500 :ring-blue-400 dracula:focus:ring-[#bd93f9] focus:border-blue-500 :border-blue-400 dracula:focus:border-[#bd93f9] transition"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="size-8 flex items-center justify-center bg-white  dracula:bg-[#44475a] shadow rounded-lg transition hover:scale-105 active:scale-95"
          >
            {theme === "light" ? (
              <MoonIcon className="size-4 text-gray-800 dracula:text-[#f8f8f2]" />
            ) : (
              <SunIcon className="size-4 text-[#ffb86c]" />
            )}
          </button>

          {/* User Button */}
          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
