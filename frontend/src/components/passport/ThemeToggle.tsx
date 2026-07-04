import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function getInitial(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("silo-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const t = getInitial();
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        window.localStorage.setItem("silo-theme", next);
      } catch {}
      return next;
    });
  };

  return { theme, toggle };
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={
        "hairline press group relative grid h-9 w-9 place-items-center bg-background hover:bg-card " +
        className
      }
    >
      <Sun
        className={
          "h-4 w-4 absolute transition-all duration-500 " +
          (isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100")
        }
        strokeWidth={1.75}
      />
      <Moon
        className={
          "h-4 w-4 absolute transition-all duration-500 " +
          (isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50")
        }
        strokeWidth={1.75}
      />
    </button>
  );
}
