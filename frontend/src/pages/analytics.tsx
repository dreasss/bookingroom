const stats = [
  { label: "Загрузка", value: "68%" },
  { label: "No-show", value: "4.2%" },
  { label: "Отмены", value: "8%" }
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Аналитика</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
      <section className="card p-6">
        <h2 className="text-lg font-semibold">Топ комнат</h2>
        <div className="mt-4 space-y-3">
          {[
            { name: "Atlas", rate: "82%" },
            { name: "Orion", rate: "71%" }
          ].map((room) => (
            <div key={room.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <span>{room.name}</span>
              <span className="text-slate-500">{room.rate}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
