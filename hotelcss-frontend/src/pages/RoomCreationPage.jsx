import { useState } from 'react';
import Layout from '../components/Layout';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { createRoom, createAllRooms } from '../api/rooms';

const RoomCreationPage = () => {
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Single room form
  const [singleRoom, setSingleRoom] = useState({
    RoomNumber: '',
    Status: 'Available',
  });

  // Bulk room form
  const [bulkConfig, setBulkConfig] = useState({
    TotalFloors: '',
    RoomsPerFloor: '',
    StartingRoomNumber: 100,
  });

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await createRoom({
        RoomNumber: parseInt(singleRoom.RoomNumber),
        Status: singleRoom.Status,
      });

      setSuccess('Room created successfully!');
      setSingleRoom({ RoomNumber: '', Status: 'Available' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (bulkConfig.TotalFloors > 20 || bulkConfig.RoomsPerFloor > 50) {
        setError('Floors cannot be higher than 20 or rooms per floor cannot be more than 50');
        return;
      }

      const result = await createAllRooms({
        TotalFloors: parseInt(bulkConfig.TotalFloors),
        RoomsPerFloor: parseInt(bulkConfig.RoomsPerFloor),
        StartingRoomNumber: parseInt(bulkConfig.StartingRoomNumber),
      });

      setSuccess(
        result.message || `Successfully created rooms! ${result.skipped?.length ? `Skipped: ${result.skipped.join(', ')}` : ''}`
      );
      setBulkConfig({ TotalFloors: '', RoomsPerFloor: '', StartingRoomNumber: 100 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create rooms');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRooms = () => {
    if (!bulkConfig.TotalFloors || !bulkConfig.RoomsPerFloor) return 0;
    return parseInt(bulkConfig.TotalFloors) * parseInt(bulkConfig.RoomsPerFloor);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Room Creation</h2>

        {/* Mode Toggle */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setMode('single')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                mode === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Single Room
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                mode === 'bulk'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bulk Creation
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
        {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

        {mode === 'single' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Single Room</h3>
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number *
                </label>
                <input
                  type="number"
                  value={singleRoom.RoomNumber}
                  onChange={(e) => setSingleRoom({ ...singleRoom, RoomNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Status *
                </label>
                <select
                  value={singleRoom.Status}
                  onChange={(e) => setSingleRoom({ ...singleRoom, Status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bulk Room Creation</h3>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> Rooms are created using the formula: (Floor × StartingRoomNumber) + Room
                  <br />
                  Example: Floor 3, StartingRoomNumber 100, Room 5 = (3 × 100) + 5 = 305
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Floors * (Max: 20)
                </label>
                <input
                  type="number"
                  value={bulkConfig.TotalFloors}
                  onChange={(e) =>
                    setBulkConfig({ ...bulkConfig, TotalFloors: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rooms Per Floor * (Max: 50)
                </label>
                <input
                  type="number"
                  value={bulkConfig.RoomsPerFloor}
                  onChange={(e) =>
                    setBulkConfig({ ...bulkConfig, RoomsPerFloor: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Room Number Multiplier
                </label>
                <input
                  type="number"
                  value={bulkConfig.StartingRoomNumber}
                  onChange={(e) =>
                    setBulkConfig({ ...bulkConfig, StartingRoomNumber: parseInt(e.target.value) || 100 })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: 100 (creates rooms like 101, 102, 201, 202, etc.)
                </p>
              </div>

              {calculateTotalRooms() > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700">
                    Total rooms to be created: <span className="text-blue-600 font-bold">{calculateTotalRooms()}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Existing rooms with the same numbers will be skipped
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || calculateTotalRooms() === 0}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Rooms...' : `Create ${calculateTotalRooms() || 0} Rooms`}
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoomCreationPage;
