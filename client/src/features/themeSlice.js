import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "dracula",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const theme = state.theme === "light" ? "dracula" : "light";
      localStorage.setItem("theme", theme);

      // Remove all theme classes
      document.documentElement.classList.remove("dark", "dracula");

      // Add the appropriate theme class
      if (theme === "dracula") {
        document.documentElement.classList.add("dracula");
      }

      state.theme = theme;
    },
    setTheme: (state, action) => {
      // Remove all theme classes
      document.documentElement.classList.remove("dark", "dracula");

      // Add the appropriate theme class
      if (action.payload === "dracula") {
        document.documentElement.classList.add("dracula");
      }

      state.theme = action.payload;
    },
    loadTheme: (state) => {
      const theme = localStorage.getItem("theme");
      if (theme) {
        state.theme = theme;
        // Remove all theme classes first
        document.documentElement.classList.remove("dark", "dracula");

        // Add the appropriate theme class
        if (theme === "dracula") {
          document.documentElement.classList.add("dracula");
        }
      }
    },
  },
});

export const { toggleTheme, setTheme, loadTheme } = themeSlice.actions;
export default themeSlice.reducer;
