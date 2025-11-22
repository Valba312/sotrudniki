import { useMemo, useState } from 'react';
import { EmployeeWithRelations } from '../types';
import { TabList } from './TabList';
import { InfoRow } from './InfoRow';
import { Timeline } from './Timeline';
import { ChangeTable } from './ChangeTable';
import './card.css';

interface Props {
  employee: EmployeeWithRelations;
}

const tabs = ['Общие данные', 'Время работы', 'Обязанности', 'Навыки и роли', 'Статусы', 'История изменений'] as const;

type TabKey = (typeof tabs)[number];

export const EmployeeCard = ({ employee }: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey>('Общие данные');
  const fullName = useMemo(
    () => `${employee.last_name} ${employee.first_name}${employee.middle_name ? ' ' + employee.middle_name : ''}`,
    [employee]
  );

  return (
    <div className="card">
      <header className="card__header">
        <div className="card__avatar">{employee.first_name.charAt(0)}</div>
        <div>
          <div className="card__title">{fullName}</div>
          <div className="card__subtitle">{employee.position} · {employee.department}</div>
          <div className={`badge badge--${employee.status}`}>Статус: {employee.status}</div>
          <div className="muted">Дата приема: {employee.hire_date}</div>
        </div>
        <div className="card__contacts">
          <div>{employee.email_work}</div>
          <div>{employee.phone_work}</div>
        </div>
      </header>

      <TabList tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Общие данные' && (
        <div className="grid">
          <InfoRow label="Тип занятости" value={employee.employment_type} />
          <InfoRow label="Место работы" value={employee.work_location} />
          <InfoRow label="Дата рождения" value={employee.date_of_birth} />
          <InfoRow label="Менеджер" value={employee.manager_id ?? '—'} />
          <InfoRow label="Личные ID" value={employee.personal_ids.join(', ')} />
          {employee.email_personal && <InfoRow label="Личный email" value={employee.email_personal} />}
        </div>
      )}

      {activeTab === 'Время работы' && (
        <div>
          <h4>Текущий график</h4>
          <InfoRow label="Тип" value={employee.work_schedule_type} />
          <InfoRow label="Часов в неделю" value={`${employee.work_hours_per_week}`} />
          <h4>История графиков</h4>
          <Timeline items={employee.schedule_history.map(item => ({
            title: `${item.schedule_type} · ${item.hours_per_week}ч`,
            subtitle: item.comment,
            date: `${item.from_date}${item.to_date ? ' — ' + item.to_date : ''}`
          }))} />
        </div>
      )}

      {activeTab === 'Обязанности' && (
        <ul className="list">
          {employee.responsibilities.map(res => (
            <li key={res.id}>
              <div className="list__title">{res.title}</div>
              <div className="muted">{res.from_date}{res.to_date ? ' — ' + res.to_date : ''}</div>
              <p>{res.description}</p>
            </li>
          ))}
        </ul>
      )}

      {activeTab === 'Навыки и роли' && (
        <div className="grid">
          <div>
            <h4>Навыки</h4>
            <ul className="pill-list">
              {employee.skills.map(skill => (
                <li key={skill.skill_id} className="pill">
                  {skill.skill.name} · {skill.level}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Роли</h4>
            <ul className="pill-list">
              {employee.roles.map(role => (
                <li key={role.role_id} className="pill">
                  {role.role.name} · {role.from_date}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'Статусы' && (
        <Timeline
          items={employee.status_history.map(item => ({
            title: `${item.from_status} → ${item.to_status}`,
            subtitle: item.reason,
            date: item.changed_at
          }))}
        />
      )}

      {activeTab === 'История изменений' && (
        <ChangeTable changes={employee.changes} />
      )}
    </div>
  );
};
