const bookings = [
  { id: 1, title: "Командный sync", time: "Сегодня 10:00–11:00", room: "Orion" },
  { id: 2, title: "Product review", time: "Завтра 14:00–15:00", room: "Atlas" }
];

export default function MyBookings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Мои бронирования</h1>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="card flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold">{booking.title}</h3>
              <p className="text-sm text-slate-500">{booking.time}</p>
              <p className="text-sm text-slate-500">{booking.room}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary">Перенести</button>
              <button className="btn-secondary">Отменить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
