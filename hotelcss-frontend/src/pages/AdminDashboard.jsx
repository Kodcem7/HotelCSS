import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getStaffList } from '../api/users';
import { getDepartments } from '../api/departments';
import { getRequests } from '../api/requests';

const statCards = [
  {
    key: 'totalStaff',
    label: 'Total Staff',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    ),
    gradient: 'from-slate-600 to-slate-700',
    shadow: 'shadow-slate-500/15',
  },
  {
    key: 'totalDepartments',
    label: 'Departments',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    ),
    gradient: 'from-slate-500 to-slate-600',
    shadow: 'shadow-slate-500/15',
  },
  {
    key: 'totalRequests',
    label: 'Total Requests',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    ),
    gradient: 'from-slate-500 to-slate-700',
    shadow: 'shadow-slate-500/15',
  },
  {
    key: 'pendingRequests',
    label: 'Pending Requests',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    gradient: 'from-slate-600 to-slate-800',
    shadow: 'shadow-slate-600/20',
  },
];

const quickLinks = [
  {
    to: '/admin/staff',
    title: 'Manage Staff',
    desc: 'View, create, and manage staff members',
    cta: 'Staff Management',
    icon:
      'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    to: '/admin/departments',
    title: 'Manage Departments',
    desc: 'Configure hotel departments',
    cta: 'Departments',
    icon:
      'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    to: '/admin/requests',
    title: 'View Requests',
    desc: 'Monitor and manage guest requests',
    cta: 'Requests',
    icon:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    to: '/admin/rooms',
    title: 'Manage Rooms',
    desc: 'View and manage hotel rooms',
    cta: 'Rooms',
    icon:
      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    to: '/admin/rooms/create',
    title: 'Create Rooms',
    desc: 'Create single or bulk rooms',
    cta: 'Create Rooms',
    icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
  },
  {
    to: '/admin/service-items',
    title: 'Service Items',
    desc: 'Manage service items and menu',
    cta: 'Service Items',
    icon:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
  {
    to: '/reception/services',
    title: 'Reception Services',
    desc: 'Manage wake-up and pick-up times',
    cta: 'Reception Services',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalDepartments: 0,
    totalRequests: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const [staffRes, deptRes, requestsRes] = await Promise.all([
          getStaffList(),
          getDepartments(),
          getRequests().catch(() => []),
        ]);

        const staffData = staffRes?.data || [];
        const departments = Array.isArray(deptRes) ? deptRes : [];
        const requests = Array.isArray(requestsRes) ? requestsRes : [];

        setStats({
          totalStaff: staffData.length,
          totalDepartments: departments.length,
          totalRequests: requests.length,
          pendingRequests: requests.filter((r) => r.status === 'Pending').length,
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner text="Loading dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout>
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg ${card.shadow} hover:shadow-xl transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-slate-800 mt-2 tabular-nums">
                  {stats[card.key]}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-md`}>
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {card.icon}
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-slate-500" />
          Quick actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group flex items-start gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-500/10 hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-all duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 group-hover:text-slate-700 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-slate-600 mt-0.5 mb-3">{link.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 group-hover:text-slate-800">
                  {link.cta}
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
