import axios from 'axios';
import { EmployeePayload, EmployeeWithRelations } from '../types';
import { demoEmployee } from './mock';

const baseURL = import.meta.env.VITE_API_BASE ?? '/api';
const api = axios.create({ baseURL });
api.defaults.headers.common['x-user-id'] = 'demo-admin';
api.defaults.headers.common['x-user-role'] = 'hr';

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
