import { useEffect, useState } from 'react';
import { EmployeeCard } from './components/EmployeeCard';
import { AdminPanel } from './components/AdminPanel';
import { fetchEmployees } from './api/client';
import { EmployeeWithRelations } from './types';
import logo from './assets/images.png';

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
        setError(err instanceof Error ? err.message : 'Не удалось загрузить сотрудников. Попробуйте обновить страницу.');
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
        <div className="brand">
          <img src={logo} alt="Логотип ТК «Луч»" className="brand__logo" />
          <div>
            <p className="hero__eyebrow">ТК «Луч» · HR-кабина</p>
            <p className="brand__slogan">Цифровая карточка сотрудника</p>
            <h1>Досье специалиста компании</h1>
          </div>
        </div>
      </header>
      <section className="intro">
        <p>
          Аккуратный профиль: статус, контакты, опыт, график и история изменений. Чёткая карточка для HR и руководителя —
          без лишнего визуального шума.
        </p>
      </section>

      <div className="dashboard">
        <div className="dashboard__card">
          {error && (
            <div className="alert alert--error">
              <strong>Ошибка:</strong> {error}
            </div>
          )}
          {!error && loading && <p className="muted">Загружаем профиль...</p>}
          {!loading && !activeEmployee && !error && (
            <p className="muted">Сотрудников пока нет. Добавьте первого через панель справа.</p>
          )}
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
