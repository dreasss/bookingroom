import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

type FlowMode = "qr" | "search" | "guest";

type TerminalConfig = {
  max_files: number;
  max_size_mb: number;
  allowed_formats: string[];
  languages: string[];
  brand: {
    conference_name: string;
    help_desk: string;
    primary_color: string;
    secondary_color: string;
  };
};

type DashboardPayload = {
  submitted_today: number;
  problematic: number;
  online_terminals: number;
  terminals_total: number;
};

type SessionItem = {
  id: string;
  speaker_name: string;
  organization: string;
  title: string;
  section: string;
  hall: string;
  slot_time: string;
  speaker_code: string;
};

const scenarios = {
  qr: [
    "Сканируйте QR/код докладчика",
    "Подтвердите выступление",
    "Загрузите файл (USB/QR с телефона)",
    "Получите подтверждение с номером и QR",
  ],
  search: [
    "Введите фамилию или организацию",
    "Выберите карточку из результатов",
    "Загрузите файл и дождитесь проверки",
  ],
  guest: [
    "Заполните краткую форму гостя",
    "Загрузите файл и получите подтверждение",
    "В админке отметится requires mapping",
  ],
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) throw new Error("request_failed");
  return response.json();
}

export default function ConferenceSystemPage() {
  const [language, setLanguage] = useState<"RU" | "EN">("RU");
  const [mode, setMode] = useState<FlowMode>("qr");
  const [code, setCode] = useState("AI7421");
  const [lookupResult, setLookupResult] = useState<SessionItem | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestTitle, setGuestTitle] = useState("");
  const [guestSection, setGuestSection] = useState("Special");
  const [guestStatus, setGuestStatus] = useState<string | null>(null);

  const { data: config } = useQuery({
    queryKey: ["conference-config"],
    queryFn: () => fetchJson<TerminalConfig>("/conference/terminal-config"),
  });

  const { data: dashboard } = useQuery({
    queryKey: ["conference-dashboard"],
    queryFn: () => fetchJson<DashboardPayload>("/conference/dashboard"),
  });

  const gradient = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${config?.brand.primary_color ?? "#5b21b6"}, ${config?.brand.secondary_color ?? "#06b6d4"})`,
    }),
    [config]
  );

  const handleLookup = async (event: FormEvent) => {
    event.preventDefault();
    setLookupError(null);
    setLookupResult(null);
    try {
      const session = await fetchJson<SessionItem>(`/conference/sessions/by-code/${code}`);
      setLookupResult(session);
    } catch {
      setLookupError("Код не найден");
    }
  };

  const handleGuestSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setGuestStatus(null);
    try {
      const payload = await fetchJson<{ status: string; session: SessionItem }>("/conference/sessions/guest", {
        method: "POST",
        body: JSON.stringify({
          full_name: guestName,
          talk_title: guestTitle,
          section: guestSection,
        }),
      });
      setGuestStatus(`Создано: ${payload.session.speaker_code} (${payload.status})`);
      setGuestName("");
      setGuestTitle("");
    } catch {
      setGuestStatus("Ошибка при создании гостевого доклада");
    }
  };

  return (
    <div className="space-y-8">
      <section className="card p-6 text-white" style={gradient}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{config?.brand.conference_name ?? "Conference Upload Kiosk"}</h1>
            <p className="text-sm opacity-90">Терминал сдачи докладов + админ-панель техдирекции</p>
          </div>
          <div className="flex gap-2 rounded-lg bg-white/20 p-1">
            {["RU", "EN"].map((item) => (
              <button
                key={item}
                onClick={() => setLanguage(item as "RU" | "EN")}
                className={`rounded px-3 py-1 text-sm ${item === language ? "bg-white text-slate-900" : "text-white"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold">Потоки терминала</h2>
          <div className="mt-3 flex gap-2">
            <button className={`btn-secondary ${mode === "qr" ? "bg-slate-200 dark:bg-slate-700" : ""}`} onClick={() => setMode("qr")}>QR/Код</button>
            <button className={`btn-secondary ${mode === "search" ? "bg-slate-200 dark:bg-slate-700" : ""}`} onClick={() => setMode("search")}>Поиск</button>
            <button className={`btn-secondary ${mode === "guest" ? "bg-slate-200 dark:bg-slate-700" : ""}`} onClick={() => setMode("guest")}>Срочная сдача</button>
          </div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {scenarios[mode].map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold">Правила</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Форматы: {config?.allowed_formats.join(", ") ?? "..."}</li>
            <li>Лимит размера: {config?.max_size_mb ?? "..."} MB</li>
            <li>Файлов за сессию: {config?.max_files ?? "..."}</li>
            <li>Языки: {config?.languages.join("/") ?? "..."}</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form className="card p-6" onSubmit={handleLookup}>
          <h2 className="text-xl font-semibold">Проверка по коду докладчика</h2>
          <div className="mt-3 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              placeholder="AI7421"
            />
            <button className="btn-primary" type="submit">Найти</button>
          </div>
          {lookupResult && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {lookupResult.speaker_name} • {lookupResult.title} • {lookupResult.section} • {lookupResult.slot_time}
            </div>
          )}
          {lookupError && <div className="mt-4 text-sm text-rose-600">{lookupError}</div>}
        </form>

        <form className="card p-6" onSubmit={handleGuestSubmit}>
          <h2 className="text-xl font-semibold">Гостевой доклад</h2>
          <div className="mt-3 space-y-2">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="ФИО" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Тема доклада" value={guestTitle} onChange={(e) => setGuestTitle(e.target.value)} required />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900" placeholder="Секция" value={guestSection} onChange={(e) => setGuestSection(e.target.value)} required />
            <button className="btn-primary" type="submit">Создать срочную сдачу</button>
            {guestStatus && <div className="text-sm text-slate-500">{guestStatus}</div>}
          </div>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Dashboard техдирекции</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Metric title="Сдано сегодня" value={String(dashboard?.submitted_today ?? "...")} />
          <Metric title="Проблемные" value={String(dashboard?.problematic ?? "...")} />
          <Metric title="Онлайн терминалов" value={`${dashboard?.online_terminals ?? "..."}/${dashboard?.terminals_total ?? "..."}`} />
          <Metric title="Help Desk" value={config?.brand.help_desk ?? "..."} />
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}
