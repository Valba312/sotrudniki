import { ChangeLog } from '../types';

export const ChangeTable = ({ changes }: { changes: ChangeLog[] }) => (
  <table className="table">
    <thead>
      <tr>
        <th>Дата/время</th>
        <th>Пользователь</th>
        <th>Поле</th>
        <th>Старое значение</th>
        <th>Новое значение</th>
        <th>Комментарий</th>
      </tr>
    </thead>
    <tbody>
      {changes.length === 0 && (
        <tr>
          <td colSpan={6}>Пока нет изменений</td>
        </tr>
      )}
      {changes.map((change, idx) => (
        <tr key={idx}>
          <td>{change.changed_at}</td>
          <td>{change.changed_by}</td>
          <td>{change.field_name}</td>
          <td>{change.old_value ?? '—'}</td>
          <td>{change.new_value ?? '—'}</td>
          <td>{change.comment ?? '—'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
