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
import { getServiceItems } from '../api/serviceItems';

const EVENT_TYPES = [
  { value: 'General', label: 'General' },
  { value: 'Meal', label: 'Meal / Menu' },
  // Backend supports BonusPoint (creates BonusCampaign via controller)
  { value: 'BonusPoint', label: 'Bonus Point Campaign' },
];

const HotelEventsManagementPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [serviceItems, setServiceItems] = useState([]);
  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    EventType: 'General',
    StartDate: '',
    EndDate: '',
    BonusPoints: 0,
    CampaignType: 'AllItems',
    ServiceItemId: '',
    BonusRules: [{ ServiceItemId: '', BonusPoints: 0, CampaignType: 'AllItems' }],
    MealInfo: '',
    IsActive: true,
  });

  useEffect(() => {
    fetchEvents();
    fetchServiceItems();
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

  const fetchServiceItems = async () => {
    try {
      const res = await getServiceItems();
      const items = Array.isArray(res) ? res : res?.data ?? [];
      setServiceItems(items);
    } catch (err) {
      console.error(err);
      // non-blocking: event management can still work without items
      setServiceItems([]);
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
      CampaignType: 'AllItems',
      ServiceItemId: '',
      BonusRules: [{ ServiceItemId: '', BonusPoints: 0, CampaignType: 'AllItems' }],
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
        CampaignType: ev.campaignType || 'AllItems',
        ServiceItemId: ev.serviceItemId ?? '',
        BonusRules: [
          {
            ServiceItemId: ev.serviceItemId ?? '',
            BonusPoints: ev.bonusPoints ?? 0,
            CampaignType: ev.campaignType || 'AllItems',
          },
        ],
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

      const basePayload = {
        Title: formData.Title,
        Description: formData.Description || null,
        EventType: formData.EventType || null,
        StartDate: formData.StartDate || null,
        EndDate: formData.EndDate || null,
        MealInfo: formData.EventType === 'Meal' ? formData.MealInfo || null : null,
        IsActive: formData.IsActive,
      };

      // BonusPoint: allow multiple rules (input array). Each rule becomes one backend create call
      // because backend DTO accepts a single ServiceItemId + BonusPoints per request.
      if (!editingEvent && formData.EventType === 'BonusPoint') {
        const rules = (formData.BonusRules || [])
          .map((r) => ({
            CampaignType: r.CampaignType || 'AllItems',
            ServiceItemId: r.CampaignType === 'AllItems' ? null : Number(r.ServiceItemId) || null,
            BonusPoints: Number(r.BonusPoints) || 0,
          }))
          .filter((r) => r.BonusPoints > 0);

        if (rules.length === 0) {
          setError('Please add at least one bonus rule with Bonus Points > 0.');
          return;
        }

        await Promise.all(
          rules.map((r, idx) =>
            createHotelEvent({
              ...basePayload,
              Title: rules.length > 1 ? `${formData.Title} #${idx + 1}` : formData.Title,
              EventType: 'BonusPoint',
              CampaignType: r.CampaignType,
              ServiceItemId: r.ServiceItemId,
              BonusPoints: r.BonusPoints,
            }),
          ),
        );
        setSuccess('Bonus point campaign event(s) created successfully');
      } else {
        const payload = {
          ...basePayload,
          BonusPoints: formData.EventType === 'BonusPoint' ? Number(formData.BonusPoints) || 0 : 0,
          CampaignType: formData.EventType === 'BonusPoint' ? formData.CampaignType || null : null,
          ServiceItemId:
            formData.EventType === 'BonusPoint'
              ? formData.CampaignType === 'AllItems'
                ? null
                : Number(formData.ServiceItemId) || null
              : null,
        };

        if (editingEvent) {
          await updateHotelEvent(editingEvent.id, payload);
          setSuccess('Hotel event updated successfully');
        } else {
          await createHotelEvent(payload);
          setSuccess('Hotel event created successfully');
        }
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
      case 'BonusPoint':
        return 'bg-amber-100 text-amber-800';
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
            Create announcements, meal menus and bonus point campaigns for guests.
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

                {ev.eventType === 'BonusPoint' && (
                  <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                    Bonus point campaign is active for eligible purchases.
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

              {formData.EventType === 'BonusPoint' && editingEvent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extra Points
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
                    Editing an existing BonusPoint event updates its bonus points (single rule).
                  </p>
                </div>
              )}

              {formData.EventType === 'BonusPoint' && !editingEvent && (
                <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900">
                        Bonus rules (input array)
                      </h4>
                      <p className="text-xs text-amber-900/70 mt-0.5">
                        Each rule becomes a separate BonusPoint event+campaign in backend.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          BonusRules: [
                            ...(formData.BonusRules || []),
                            { ServiceItemId: '', BonusPoints: 0, CampaignType: 'AllItems' },
                          ],
                        })
                      }
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition"
                    >
                      + Add rule
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(formData.BonusRules || []).map((rule, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg border border-amber-200 p-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Campaign Type
                            </label>
                            <select
                              value={rule.CampaignType || 'AllItems'}
                              onChange={(e) => {
                                const next = [...(formData.BonusRules || [])];
                                next[idx] = {
                                  ...next[idx],
                                  CampaignType: e.target.value,
                                  ServiceItemId:
                                    e.target.value === 'AllItems' ? '' : next[idx].ServiceItemId,
                                };
                                setFormData({ ...formData, BonusRules: next });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                            >
                              <option value="AllItems">All Items</option>
                              <option value="SpecificItem">Specific Item</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Service Item (SpecificItem)
                            </label>
                            <select
                              value={rule.ServiceItemId || ''}
                              onChange={(e) => {
                                const next = [...(formData.BonusRules || [])];
                                next[idx] = { ...next[idx], ServiceItemId: e.target.value };
                                setFormData({ ...formData, BonusRules: next });
                              }}
                              disabled={(rule.CampaignType || 'AllItems') !== 'SpecificItem'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm disabled:bg-gray-100"
                            >
                              <option value="">Select service item...</option>
                              {serviceItems.map((it) => (
                                <option key={it.id} value={it.id}>
                                  {it.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Extra Points
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={rule.BonusPoints ?? 0}
                              onChange={(e) => {
                                const next = [...(formData.BonusRules || [])];
                                next[idx] = { ...next[idx], BonusPoints: e.target.value };
                                setFormData({ ...formData, BonusRules: next });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...(formData.BonusRules || [])];
                              next.splice(idx, 1);
                              setFormData({
                                ...formData,
                                BonusRules:
                                  next.length > 0
                                    ? next
                                    : [{ ServiceItemId: '', BonusPoints: 0, CampaignType: 'AllItems' }],
                              });
                            }}
                            className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.EventType === 'Meal' && (
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
                    required
                  />
                </div>
              )}

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

