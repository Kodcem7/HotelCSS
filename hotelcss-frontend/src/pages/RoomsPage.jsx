import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { getRooms, updateRoom } from '../api/rooms';
import { checkOutRoom } from '../api/users';

const RoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getRooms();
      setRooms(response?.data || []);
    } catch (err) {
      setError('Failed to load rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (roomNumber, newStatus) => {
    // If we are switching a room to Available, warn that all guest data will be cleared.
    if (newStatus === 'Available') {
      const confirmed = window.confirm(
        'Bu odayý \"Available\" yaparsan, odaya atanýþ tüm bilgiler (konuk maili vb.) silinecek.\nDevam etmek istiyor musun?'
      );
      if (!confirmed) {
        // Re-sync from server to revert the select change
        await fetchRooms();
        return;
      }
    }

    try {
      setError('');
      setSuccess('');
      await updateRoom(roomNumber, newStatus);
      setSuccess('Room status updated successfully');
      await fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update room status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Occupied':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRooms =
    filterStatus === 'All'
      ? rooms
      : rooms.filter((r) => r.status === filterStatus);

  const handleCheckOut = async (roomNumber) => {
    const confirmed = window.confirm(
      `Are you sure you want to check-out Room ${roomNumber}?\n` +
        'This will finalize the stay, move data to history, clear all requests and reset the room.'
    );
    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');
      const res = await checkOutRoom(roomNumber);
      setSuccess(res?.message || `Room ${roomNumber} has been checked out successfully.`);
      await fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check-out room');
      console.error(err);
    }
  };

  const statusCounts = {
    All: rooms.length,
    Available: rooms.filter((r) => r.status === 'Available').length,
    Occupied: rooms.filter((r) => r.status === 'Occupied').length,
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading rooms..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-10 space-y-8 max-w-7xl mx-auto">
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
            Room Management
          </h2>
          <p className="text-[14px] text-[#5D534A] leading-relaxed">
            Manage room availability, occupancy, and check-outs.
          </p>
          <div className="mt-6">
            <Link
              to="/admin/rooms/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[12px] uppercase tracking-widest bg-[#4A3728] text-white hover:bg-[#3a2b20] transition shadow-sm"
            >
              Create Rooms <span className="material-symbols-outlined text-sm">add</span>
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap justify-center gap-2">
          {['All', 'Available', 'Occupied'].map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition border ${
                filterStatus === status
                  ? 'bg-[#D35400] text-white border-[#D35400]'
                  : 'bg-[#FDFBF7] text-[#4A3728] border-[#E3DCD2]/50 hover:bg-[#F2EBE1]'
              }`}
            >
              {status} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>

        <div className="max-w-5xl mx-auto w-full">
          {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
          {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}
        </div>

        {filteredRooms.length === 0 ? (
          <div className="max-w-5xl mx-auto bg-[#FDFBF7] p-10 rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] text-center text-[#5D534A]">
            No rooms found
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.roomNumber}
                className="bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-6"
              >
                <div className="text-center mb-4">
                  <h3 className="font-headline text-2xl font-bold text-[#4A3728]">
                    Room {room.roomNumber}
                  </h3>
                  <span
                    className={`mt-2 inline-block px-3 py-1 text-[11px] font-bold rounded-full ${getStatusColor(
                      room.status
                    )}`}
                  >
                    {room.status}
                  </span>
                </div>

              <div className="space-y-3">
                <select
                  value={room.status}
                  onChange={(e) => handleStatusUpdate(room.roomNumber, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E] text-sm"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                </select>

                <div className="text-xs text-[#5D534A] bg-[#F2EBE1]/45 border border-[#E3DCD2]/40 rounded-2xl px-4 py-3 text-center">
                  <p className="font-bold text-[#4A3728] mb-1 uppercase tracking-widest text-[10px]">
                    Current guest email
                  </p>
                  <p className="font-mono break-all text-[12px]">
                    {room.currentGuestMail || '—'}
                  </p>
                </div>

                {room.status === 'Occupied' && (
                  <button
                    type="button"
                    onClick={() => handleCheckOut(room.roomNumber)}
                    className="w-full px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-2xl bg-[#B22222] text-white hover:bg-[#8f1b1b] transition"
                  >
                    Check-out room
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
};

export default RoomsPage;
