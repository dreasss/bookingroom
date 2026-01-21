export default function RoomDisplay() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-between px-10 py-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase text-slate-400">Room Display</p>
            <h1 className="text-4xl font-semibold">Atlas</h1>
            <p className="text-slate-400">Europe/Berlin</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-semibold">14:32</div>
            <div className="text-slate-400">Вторник, 24 июня</div>
          </div>
        </header>
        <main className="space-y-6">
          <div className="rounded-2xl bg-emerald-500/20 p-8">
            <p className="text-sm uppercase text-emerald-200">Свободно</p>
            <h2 className="mt-2 text-3xl font-semibold">Следующая встреча: 15:30</h2>
            <p className="mt-2 text-slate-300">Product Sync · 45 мин</p>
          </div>
          <div className="flex gap-4">
            <button className="rounded-xl bg-white/10 px-6 py-3 text-lg">Быстро 15 мин</button>
            <button className="rounded-xl bg-white/10 px-6 py-3 text-lg">Быстро 30 мин</button>
          </div>
        </main>
        <footer className="flex items-center justify-between">
          <div className="text-sm text-slate-400">Сканируйте QR для check-in</div>
          <div className="h-24 w-24 rounded-xl bg-white/10" aria-label="QR" />
        </footer>
      </div>
    </div>
  );
}
