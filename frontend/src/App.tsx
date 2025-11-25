import { useEffect, useState } from 'react';
import { EmployeeCard } from './components/EmployeeCard';
import { AdminPanel } from './components/AdminPanel';
import { fetchEmployees } from './api/client';
import { EmployeeWithRelations } from './types';

export default function App() {
  const [employees, setEmployees] = useState<EmployeeWithRelations[]>([]);
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEmployees();
        setEmployees(data);
        setActiveEmployeeId(data[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEmployeeChange = (employee: EmployeeWithRelations) => {
    setEmployees(prev => {
      const idx = prev.findIndex(item => item.id === employee.id);
      if (idx === -1) {
        return [...prev, employee];
      }
      const copy = [...prev];
      copy[idx] = employee;
      return copy;
    });
  };

  const activeEmployee = employees.find(emp => emp.id === activeEmployeeId) ?? null;

  return (
    <div className="page">
      <header className="hero">
        <p className="hero__eyebrow">HR‑workspace</p>
        <h1>Цифровая карточка сотрудника</h1>
        <p>Актуальные данные, история изменений и удобная админ‑панель в одном экране.</p>
      </header>

      <div className="dashboard">
        <div className="dashboard__card">
          {error && (
            <div className="alert alert--error">
              <strong>Ошибка:</strong> {error}
            </div>
          )}
          {!error && loading && <p className="muted">Загружаем данные...</p>}
          {!loading && !activeEmployee && !error && <p className="muted">Пока нет ни одной карточки. Создайте сотрудника справа.</p>}
          {activeEmployee && !error && <EmployeeCard employee={activeEmployee} />}
        </div>

        <AdminPanel
          employees={employees}
          activeEmployeeId={activeEmployeeId}
          onEmployeeChange={handleEmployeeChange}
          onSelect={setActiveEmployeeId}
        />
      </div>
    </div>
  );
}
