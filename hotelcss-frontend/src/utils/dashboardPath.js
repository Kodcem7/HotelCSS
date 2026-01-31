/**
 * Map role to dashboard path.
 * Department roles (Kitchen, Technic, Housekeeping, Restaurant, Staff) go to /staff.
 */
export const getDashboardPathForRole = (role) => {
  if (!role) return '/login';
  const r = role.toLowerCase();
  if (r === 'admin') return '/admin';
  if (r === 'manager') return '/manager';
  if (r === 'reception') return '/reception';
  if (r === 'room') return '/room';
  return '/staff';
};

/** Roles that should access the staff dashboard (department staff). */
export const STAFF_DASHBOARD_ROLES = [
  'Staff',
  'Housekeeping',
  'Restaurant',
  'Kitchen',
  'Technic',
];
