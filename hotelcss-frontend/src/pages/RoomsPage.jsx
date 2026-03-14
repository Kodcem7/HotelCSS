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
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
        <Link
          to="/admin/rooms/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Create Rooms
        </Link>
      </div>

      <div className="flex space-x-2 mb-4">
        {['All', 'Available', 'Occupied'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {status} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No rooms found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <div key={room.roomNumber} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Room {room.roomNumber}</h3>
                  <span
                    className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      room.status
                    )}`}
                  >
                    {room.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <select
                  value={room.status}
                  onChange={(e) => handleStatusUpdate(room.roomNumber, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                </select>

                <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <p className="font-semibold mb-1">Current guest email</p>
                  <p className="font-mono break-all">
                    {room.currentGuestMail || '—'}
                  </p>
                </div>

                {room.status === 'Occupied' && (
                  <button
                    type="button"
                    onClick={() => handleCheckOut(room.roomNumber)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Check-out room
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default RoomsPage;
