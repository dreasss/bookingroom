import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Rooms from "./pages/rooms";
import RoomDetail from "./pages/room-detail";
import MyBookings from "./pages/my-bookings";
import Admin from "./pages/admin";
import Analytics from "./pages/analytics";
import RoomDisplay from "./pages/room-display";
import ConferenceSystemPage from "./pages/conference";
import AppShell from "./components/app-shell";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/display" element={<RoomDisplay />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:roomId" element={<RoomDetail />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/conference" element={<ConferenceSystemPage />} />
      </Route>
    </Routes>
  );
}
