export default function Admin() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Админка</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Комнаты</h2>
          <p className="text-sm text-slate-500">CRUD комнат, фото и оборудования.</p>
          <button className="btn-primary mt-4">Добавить комнату</button>
        </section>
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Политики</h2>
          <p className="text-sm text-slate-500">Auto-release, max duration, рабочие часы.</p>
          <button className="btn-secondary mt-4">Настроить</button>
        </section>
      </div>
    </div>
  );
}
