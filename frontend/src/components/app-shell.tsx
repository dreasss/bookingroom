import { NavLink, Outlet } from "react-router-dom";
import ThemeToggle from "./theme-toggle";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/rooms", label: "Rooms" },
  { to: "/bookings", label: "My bookings" },
  { to: "/admin", label: "Admin" },
  { to: "/analytics", label: "Analytics" },
  { to: "/conference", label: "Conference Kiosk" }
];

export default function AppShell() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
              BR
            </div>
            <div>
              <div className="text-lg font-semibold">Booking Room</div>
              <div className="text-xs text-slate-500">Europe/Berlin</div>
            </div>
          </div>
          <nav className="flex gap-4 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition ${
                    isActive
                      ? "bg-brand-500 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
