import axios from 'axios';
import { EmployeeWithRelations } from '../types';
import { demoEmployee } from './mock';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE ?? '/api' });

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
