import { useEffect, useState } from 'react';
import { EmployeeCard } from './components/EmployeeCard';
import { fetchEmployee } from './api/client';
import { EmployeeWithRelations } from './types';

const demoId = 'demo-employee';

export default function App() {
  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployee(demoId)
      .then(setEmployee)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="app"><h2>Ошибка загрузки</h2><p>{error}</p></div>;
  if (!employee) return <div className="app"><p>Загрузка...</p></div>;

  return (
    <div className="app">
      <EmployeeCard employee={employee} />
    </div>
  );
}
