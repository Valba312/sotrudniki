import { useEffect, useState } from 'react';
import { setAuthHeaders, UserRole } from '../api/client';

const roles: { value: UserRole; label: string }[] = [
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'employee', label: 'Employee' }
];

export const RoleSwitcher = () => {
  const saved = (localStorage.getItem('luch-role') as UserRole | null) ?? 'hr';
  const [role, setRole] = useState<UserRole>(saved);

  useEffect(() => {
    setAuthHeaders(`demo-${role}`, role);
    localStorage.setItem('luch-role', role);
  }, [role]);

  return (
    <div className="role-switcher">
      <span className="muted">Роль просмотра:</span>
      <select value={role} onChange={e => setRole(e.target.value as UserRole)}>
        {roles.map(r => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
};
