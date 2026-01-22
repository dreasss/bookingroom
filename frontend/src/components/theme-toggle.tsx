import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <button
      className="btn-secondary"
      onClick={() => setIsDark((prev) => !prev)}
      aria-label="Toggle dark mode"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
