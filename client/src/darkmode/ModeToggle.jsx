import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex h-5 w-10 cursor-pointer items-center rounded-full bg-gray-200 p-1 transition-colors dark:bg-gray-600"
    >
      <div
        className={`absolute h-4 w-4 rounded-full bg-white shadow-md transition-all dark:bg-[#1E2738] ${
          theme === "dark" ? "translate-x-[1.1rem]" : "translate-x-0"
        }`}
      />
      <Sun
        className="absolute left-1 h-3 w-3"
        stroke={theme === "dark" ? "white" : "black"}
      />
      <Moon
        className="absolute right-1 h-3 w-3"
        stroke={theme === "dark" ? "white" : "black"}
      />
    </div>
  );
}
