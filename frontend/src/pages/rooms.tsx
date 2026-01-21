import { Link } from "react-router-dom";

const rooms = [
  {
    id: "1",
    name: "Atlas",
    capacity: 12,
    equipment: ["TV", "Zoom", "Whiteboard"],
    available: "Свободна с 15:30"
  },
  {
    id: "2",
    name: "Orion",
    capacity: 6,
    equipment: ["TV", "Teams"],
    available: "Свободна сейчас"
  }
];

export default function Rooms() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="card p-4">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <div className="mt-4 space-y-3 text-sm">
          <label className="block">
            <span className="text-slate-500">Вместимость</span>
            <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="10" />
          </label>
          <label className="block">
            <span className="text-slate-500">Оборудование</span>
            <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="TV, VC" />
          </label>
          <label className="block">
            <span className="text-slate-500">Локация</span>
            <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" placeholder="Building A" />
          </label>
          <button className="btn-primary w-full">Применить</button>
        </div>
      </aside>
      <section className="space-y-4">
        {rooms.map((room) => (
          <div key={room.id} className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold">{room.name}</h3>
              <p className="text-sm text-slate-500">{room.capacity} мест • {room.equipment.join(" · ")}</p>
              <p className="mt-2 text-sm text-emerald-600">{room.available}</p>
            </div>
            <div className="flex gap-2">
              <Link className="btn-secondary" to={`/rooms/${room.id}`}>Детали</Link>
              <button className="btn-primary">Забронировать</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
