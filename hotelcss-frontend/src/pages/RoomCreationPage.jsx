import { useState } from 'react';
// import Layout from '../components/Layout'; // ❌ REMOVED
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
        <> {/* ✅ Replaced <Layout> with Fragment */}
            <div className="p-10 space-y-8 max-w-7xl mx-auto">
                <section className="text-center max-w-3xl mx-auto">
                    <h2 className="font-headline text-[52px] text-[#4A3728] mb-2 font-bold leading-tight">
                        Room Creation
                    </h2>
                    <p className="text-[14px] text-[#5D534A] leading-relaxed">
                        Create rooms one-by-one or in bulk.
                    </p>
                </section>

                {/* Mode Toggle */}
                <div className="max-w-4xl mx-auto bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => setMode('single')}
                            className={`flex-1 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition border ${mode === 'single'
                                    ? 'bg-[#D35400] text-white border-[#D35400]'
                                    : 'bg-[#F2EBE1] text-[#4A3728] border-[#E3DCD2]/40 hover:bg-[#E8DFD1]'
                                }`}
                        >
                            Single Room
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('bulk')}
                            className={`flex-1 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition border ${mode === 'bulk'
                                    ? 'bg-[#D35400] text-white border-[#D35400]'
                                    : 'bg-[#F2EBE1] text-[#4A3728] border-[#E3DCD2]/40 hover:bg-[#E8DFD1]'
                                }`}
                        >
                            Bulk Creation
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto w-full">
                    {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
                    {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}
                </div>

                {mode === 'single' ? (
                    <div className="max-w-4xl mx-auto bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-6">
                        <h3 className="font-headline text-2xl font-bold text-[#4A3728] mb-4 text-center">
                            Create Single Room
                        </h3>
                        <form onSubmit={handleSingleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                                    Room Number *
                                </label>
                                <input
                                    type="number"
                                    value={singleRoom.RoomNumber}
                                    onChange={(e) => setSingleRoom({ ...singleRoom, RoomNumber: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                                    required
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                                    Initial Status *
                                </label>
                                <select
                                    value={singleRoom.Status}
                                    onChange={(e) => setSingleRoom({ ...singleRoom, Status: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
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
                                className="w-full bg-[#4A3728] text-white py-3 px-4 rounded-2xl hover:bg-[#3a2b20] transition disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-widest text-xs"
                            >
                                {loading ? 'Creating...' : 'Create Room'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto bg-[#FDFBF7] rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-6">
                        <h3 className="font-headline text-2xl font-bold text-[#4A3728] mb-4 text-center">
                            Bulk Room Creation
                        </h3>
                        <form onSubmit={handleBulkSubmit} className="space-y-4">
                            <div className="bg-[#F2EBE1]/50 border border-[#E3DCD2]/50 rounded-2xl p-4 mb-4">
                                <p className="text-sm text-[#4A3728]">
                                    <strong>How it works:</strong> Rooms are created using the formula: (Floor × StartingRoomNumber) + Room
                                    <br />
                                    Example: Floor 3, StartingRoomNumber 100, Room 5 = (3 × 100) + 5 = 305
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                                    Total Floors * (Max: 20)
                                </label>
                                <input
                                    type="number"
                                    value={bulkConfig.TotalFloors}
                                    onChange={(e) =>
                                        setBulkConfig({ ...bulkConfig, TotalFloors: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                                    required
                                    min="1"
                                    max="20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                                    Rooms Per Floor * (Max: 50)
                                </label>
                                <input
                                    type="number"
                                    value={bulkConfig.RoomsPerFloor}
                                    onChange={(e) =>
                                        setBulkConfig({ ...bulkConfig, RoomsPerFloor: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                                    required
                                    min="1"
                                    max="50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#4A3728] mb-2">
                                    Starting Room Number Multiplier
                                </label>
                                <input
                                    type="number"
                                    value={bulkConfig.StartingRoomNumber}
                                    onChange={(e) =>
                                        setBulkConfig({ ...bulkConfig, StartingRoomNumber: parseInt(e.target.value) || 100 })
                                    }
                                    className="w-full px-4 py-3 border-2 border-[#E3DCD2]/70 rounded-2xl bg-[#F2EBE1]/55 focus:border-[#D35400]/40 focus:outline-none text-[#2C241E]"
                                    min="1"
                                />
                                <p className="text-xs text-[#8E735B] mt-1">
                                    Default: 100 (creates rooms like 101, 102, 201, 202, etc.)
                                </p>
                            </div>

                            {calculateTotalRooms() > 0 && (
                                <div className="bg-[#F2EBE1]/45 rounded-2xl p-4 border border-[#E3DCD2]/40 text-center">
                                    <p className="text-sm font-semibold text-[#4A3728]">
                                        Total rooms to be created: <span className="text-[#D35400] font-extrabold">{calculateTotalRooms()}</span>
                                    </p>
                                    <p className="text-xs text-[#8E735B] mt-1">
                                        Note: Existing rooms with the same numbers will be skipped
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || calculateTotalRooms() === 0}
                                className="w-full bg-[#4A3728] text-white py-3 px-4 rounded-2xl hover:bg-[#3a2b20] transition disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-widest text-xs"
                            >
                                {loading ? 'Creating Rooms...' : `Create ${calculateTotalRooms() || 0} Rooms`}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default RoomCreationPage;