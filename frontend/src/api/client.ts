import axios from 'axios';
import { EmployeePayload, EmployeeWithRelations, ScheduleHistory, StatusHistory } from '../types';
import { demoEmployee } from './mock';

const baseURL = import.meta.env.VITE_API_BASE ?? '/api';
const api = axios.create({ baseURL });

export type UserRole = 'hr' | 'admin' | 'manager' | 'employee';

export const setAuthHeaders = (id: string, role: UserRole) => {
  api.defaults.headers.common['x-user-id'] = id;
  api.defaults.headers.common['x-user-role'] = role;
};

// default demo user
setAuthHeaders('demo-admin', 'hr');

type EmployeeResponse = { data: EmployeeWithRelations[] };
type PlainEmployee = EmployeePayload & { id: string };

export const isStaticDemo = import.meta.env.PROD && !import.meta.env.VITE_API_BASE;

export async function fetchEmployee(id: string): Promise<EmployeeWithRelations> {
  try {
    const { data } = await api.get<EmployeeWithRelations>(`/employees/${id}`);
    return data;
  } catch (err) {
    if (id === demoEmployee.id) return demoEmployee;
    throw err;
  }
}

export async function fetchEmployees(): Promise<EmployeeWithRelations[]> {
  try {
    const { data } = await api.get<{ data: EmployeeWithRelations[] }>('/employees', {
      params: { pageSize: 50 }
    });
    if (!data.data.length) {
      return [demoEmployee];
    }
    return data.data;
  } catch {
    return [demoEmployee];
  }
}

export async function createEmployee(payload: EmployeePayload): Promise<EmployeeWithRelations> {
  const { data } = await api.post<PlainEmployee>('/employees', payload);
  return fetchEmployee(data.id);
}

export async function updateEmployee(id: string, payload: Partial<EmployeePayload>): Promise<EmployeeWithRelations> {
  await api.patch(`/employees/${id}`, payload);
  return fetchEmployee(id);
}

// Skills
type SkillPayload = { skill_id: string; level: string; verified_by?: string; verified_at?: string };

export async function setSkills(id: string, skills: SkillPayload[]): Promise<EmployeeWithRelations> {
  await api.post(`/employees/${id}/skills`, skills);
  return fetchEmployee(id);
}

export async function removeSkill(id: string, skillId: string): Promise<EmployeeWithRelations> {
  await api.delete(`/employees/${id}/skills/${skillId}`);
  return fetchEmployee(id);
}

// Roles
type RolePayload = { role_id: string; from_date: string; to_date?: string };

export async function setRoles(id: string, roles: RolePayload[]): Promise<EmployeeWithRelations> {
  await api.post(`/employees/${id}/roles`, roles);
  return fetchEmployee(id);
}

export async function removeRole(id: string, roleId: string): Promise<EmployeeWithRelations> {
  await api.delete(`/employees/${id}/roles/${roleId}`);
  return fetchEmployee(id);
}

// Responsibilities
export async function addResponsibility(
  id: string,
  responsibility: { title: string; description: string; from_date: string; to_date?: string }
): Promise<EmployeeWithRelations> {
  await api.post(`/employees/${id}/responsibilities`, responsibility);
  return fetchEmployee(id);
}

// Schedule history
export async function addScheduleHistory(
  id: string,
  schedule: Omit<ScheduleHistory, 'hours_per_week'> & { hours_per_week: number }
): Promise<EmployeeWithRelations> {
  await api.post(`/employees/${id}/schedules`, schedule);
  return fetchEmployee(id);
}

// Status history
export async function addStatusHistory(
  id: string,
  status: { to_status: StatusHistory['to_status']; reason?: string }
): Promise<EmployeeWithRelations> {
  await api.post(`/employees/${id}/status`, status);
  return fetchEmployee(id);
}

export async function createSkillDefinition(name: string, description?: string) {
  const { data } = await api.post('/skills', { name, description });
  return data;
}

export async function createRoleDefinition(name: string, description?: string) {
  const { data } = await api.post('/roles', { name, description });
  return data;
}
