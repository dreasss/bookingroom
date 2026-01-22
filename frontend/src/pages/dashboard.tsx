export default function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="text-2xl font-semibold">Добро пожаловать</h1>
        <p className="mt-2 text-slate-500">
          Быстрый поиск доступных переговорных. Локальное время комнат отображается в Europe/Berlin.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Когда?" aria-label="When" />
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="На сколько?" aria-label="Duration" />
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Сколько людей?" aria-label="Capacity" />
          <button className="btn-primary">Найти</button>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Ближайшие встречи</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <div>
                <div className="font-medium">Стратегия продукта</div>
                <div className="text-slate-500">Сегодня, 14:00–15:00</div>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                Room A3
              </span>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <div className="font-medium">Обзор бюджета</div>
                <div className="text-slate-500">Сегодня, 16:30–17:00</div>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs text-sky-700">Room B1</span>
            </li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Быстрое бронирование</h2>
          <p className="mt-2 text-sm text-slate-500">
            Выберите комнату и подтвердите встречу в 1–2 клика.
          </p>
          <div className="mt-4 flex gap-3">
            <button className="btn-secondary">30 мин</button>
            <button className="btn-secondary">60 мин</button>
            <button className="btn-secondary">90 мин</button>
          </div>
        </div>
      </section>
    </div>
  );
}
