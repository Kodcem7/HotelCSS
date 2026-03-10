import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

type RoomStatus = "Available" | "Occupied";

interface Room {
  roomNumber: number;
  status: RoomStatus;
}

interface RoomsResponse {
  data: Room[];
}

export const RoomManagementPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingRoom, setSavingRoom] = useState<number | null>(null);

  const loadRooms = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await axiosInstance.get<RoomsResponse>("/Room");
      setRooms(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError("Odalar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
  }, []);

  const handleStatusChange = (roomNumber: number, status: RoomStatus) => {
    setRooms((prev) =>
      prev.map((r) => (r.roomNumber === roomNumber ? { ...r, status } : r))
    );
  };

  const saveStatus = async (room: Room) => {
    try {
      setSavingRoom(room.roomNumber);
      setError(null);
      await axiosInstance.put(`/Room/${room.roomNumber}`, {
        status: room.status
      });
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message ?? "Durum kaydedilirken hata oluştu.";
      setError(msg);
      // reload from server to avoid inconsistent state
      void loadRooms();
    } finally {
      setSavingRoom(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
        <h1 className="text-xl font-semibold text-slate-50">Room Management</h1>
      </header>

      <main className="flex-1 px-6 py-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-50">
            Tüm Odalar
          </h2>

          {error && (
            <p className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {loading ? (
            <p className="text-sm text-slate-300">Yükleniyor...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-3 py-2 font-medium text-slate-300">Room</th>
                    <th className="px-3 py-2 font-medium text-slate-300">Status</th>
                    <th className="px-3 py-2 font-medium text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr
                      key={room.roomNumber}
                      className="border-t border-slate-800 hover:bg-slate-900/60"
                    >
                      <td className="px-3 py-2 text-slate-100">
                        {room.roomNumber}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={room.status}
                          onChange={(e) =>
                            handleStatusChange(
                              room.roomNumber,
                              e.target.value as RoomStatus
                            )
                          }
                          className="rounded-md bg-slate-900 border border-slate-700 text-slate-50 text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => saveStatus(room)}
                          disabled={savingRoom === room.roomNumber}
                          className="text-xs px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white"
                        >
                          {savingRoom === room.roomNumber ? "Saving..." : "Save"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

