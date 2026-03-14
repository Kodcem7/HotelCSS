import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import {
  getHotelEvents,
  createHotelEvent,
  updateHotelEvent,
  deleteHotelEvent,
} from '../api/events';

const EVENT_TYPES = [
  { value: 'General', label: 'General' },
  { value: 'Meal', label: 'Meal / Menu' },
  { value: 'EarnPoints', label: 'Earn Points Campaign' },
  { value: 'Discount', label: 'Discount / Promotion' },
];

const HotelEventsManagementPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    EventType: 'General',
    StartDate: '',
    EndDate: '',
    BonusPoints: 0,
    MealInfo: '',
    IsActive: true,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getHotelEvents();
      setEvents(res?.data || []);
    } catch (err) {
      setError('Failed to load hotel events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      Title: '',
      Description: '',
      EventType: 'General',
      StartDate: '',
      EndDate: '',
      BonusPoints: 0,
      MealInfo: '',
      IsActive: true,
    });
  };

  const openModal = (ev = null) => {
    if (ev) {
      setEditingEvent(ev);
      setFormData({
        Title: ev.title || '',
        Description: ev.description || '',
        EventType: ev.eventType || 'General',
        StartDate: ev.startDate ? ev.startDate.slice(0, 16) : '',
        EndDate: ev.endDate ? ev.endDate.slice(0, 16) : '',
        BonusPoints: ev.bonusPoints ?? 0,
        MealInfo: ev.mealInfo || '',
        IsActive: ev.isActive ?? true,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      const payload = {
        Title: formData.Title,
        Description: formData.Description || null,
        EventType: formData.EventType || null,
        // datetime-local already gives local time in \"YYYY-MM-DDTHH:mm\" format.
        // We send this string directly so backend stores it as local time without UTC shift.
        StartDate: formData.StartDate || null,
        EndDate: formData.EndDate || null,
        BonusPoints: Number(formData.BonusPoints) || 0,
        MealInfo: formData.MealInfo || null,
        IsActive: formData.IsActive,
      };

      if (editingEvent) {
        await updateHotelEvent(editingEvent.id, payload);
        setSuccess('Hotel event updated successfully');
      } else {
        await createHotelEvent(payload);
        setSuccess('Hotel event created successfully');
      }

      closeModal();
      await fetchEvents();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        'Failed to save hotel event';
      setError(msg);
      console.error(err);
    }
  };

  const handleDelete = async (ev) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the event "${ev.title}"?`,
      )
    ) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteHotelEvent(ev.id);
      setSuccess('Hotel event deleted successfully');
      await fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete hotel event';
      setError(msg);
      console.error(err);
    }
  };

  const renderTypeBadge = (type) => {
    switch (type) {
      case 'Meal':
        return 'bg-blue-100 text-blue-800';
      case 'EarnPoints':
        return 'bg-green-100 text-green-800';
      case 'Discount':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading hotel events..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hotel Events Management</h2>
          <p className="text-gray-600 mt-1 text-sm">
            Create announcements, meal menus and earn-points campaigns for guests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
        >
          + Add Event
        </button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
          No hotel events defined yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-lg shadow p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ev.title}</h3>
                    {ev.eventType && (
                      <span
                        className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${renderTypeBadge(
                          ev.eventType,
                        )}`}
                      >
                        {ev.eventType}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      ev.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {ev.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {ev.description && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">{ev.description}</p>
                )}

                {(ev.startDate || ev.endDate) && (
                  <p className="text-xs text-gray-500 mt-2">
                    {ev.startDate && (
                      <>
                        <span className="font-medium">Start:</span>{' '}
                        {new Date(ev.startDate).toLocaleString()}
                      </>
                    )}
                    {ev.endDate && (
                      <>
                        {' '}
                        • <span className="font-medium">End:</span>{' '}
                        {new Date(ev.endDate).toLocaleString()}
                      </>
                    )}
                  </p>
                )}

                {ev.eventType === 'EarnPoints' && (
                  <p className="mt-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded px-2 py-1">
                    Earn Points campaign: current eligible purchases will grant extra{' '}
                    <span className="font-semibold">{ev.bonusPoints}</span> points.
                  </p>
                )}

                {ev.eventType === 'Meal' && ev.mealInfo && (
                  <p className="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-1 whitespace-pre-wrap">
                    {ev.mealInfo}
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => openModal(ev)}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(ev)}
                  className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.Title}
                  onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.Description}
                  onChange={(e) =>
                    setFormData({ ...formData, Description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={formData.EventType}
                    onChange={(e) =>
                      setFormData({ ...formData, EventType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center mt-6 md:mt-0">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.IsActive}
                      onChange={(e) =>
                        setFormData({ ...formData, IsActive: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date/Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.StartDate}
                    onChange={(e) =>
                      setFormData({ ...formData, StartDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date/Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.EndDate}
                    onChange={(e) =>
                      setFormData({ ...formData, EndDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bonus Points (for Earn Points campaigns)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.BonusPoints}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      BonusPoints: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  When Event Type is <span className="font-semibold">EarnPoints</span>, this
                  value will be shown on the guest event page as extra points that can be
                  earned from purchases.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Info (breakfast / lunch / dinner details)
                </label>
                <textarea
                  value={formData.MealInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, MealInfo: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g. Breakfast: ...&#10;Lunch: ...&#10;Dinner: ..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HotelEventsManagementPage;

