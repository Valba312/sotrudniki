import axios from 'axios';
import { EmployeeWithRelations } from '../types';
import { demoEmployee } from './mock';

codex/implement-employee-digital-card-module-j5qguu
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE ?? '/api' });
=======
codex/implement-employee-digital-card-module-vzo4s3
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE ?? '/api' });
=======
codex/implement-employee-digital-card-module
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE ?? '/api' });
=======
const api = axios.create({ baseURL: '/api' });
main
main
main

export async function fetchEmployee(id: string): Promise<EmployeeWithRelations> {
  try {
    const { data } = await api.get<EmployeeWithRelations>(`/employees/${id}`);
    return data;
  } catch (err) {
    // Fallback to mock data for demo environments
    if (id === demoEmployee.id) return demoEmployee;
    throw err;
  }
}
