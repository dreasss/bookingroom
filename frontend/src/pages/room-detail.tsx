export default function RoomDetail() {
  return (
    <div className="space-y-6">
      <section className="card p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="h-56 flex-1 rounded-xl bg-slate-100" aria-label="Room gallery" />
          <div className="flex-1 space-y-3">
            <h1 className="text-2xl font-semibold">Atlas</h1>
            <p className="text-slate-500">12 мест · TV · Zoom · Whiteboard</p>
            <div className="flex gap-3">
              <button className="btn-secondary">30 мин</button>
              <button className="btn-secondary">60 мин</button>
              <button className="btn-secondary">90 мин</button>
            </div>
            <button className="btn-primary">Забронировать</button>
          </div>
        </div>
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Доступность</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              {9 + idx}:00
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
