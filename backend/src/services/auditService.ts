import { v4 as uuid } from 'uuid';
import { Employee, EmployeeChangeLogEntry } from '../models/employee.js';
import { EmployeeRepository } from '../repositories/employeeRepository.js';

export class AuditService {
  constructor(private readonly repository: EmployeeRepository) {}

  captureChange(
    before: Employee,
    after: Employee,
    userId: string,
    comment?: string
  ): EmployeeChangeLogEntry[] {
    const entries: EmployeeChangeLogEntry[] = [];
    Object.keys(after).forEach(key => {
      const typedKey = key as keyof Employee;
      if (before[typedKey] !== after[typedKey]) {
        const entry: EmployeeChangeLogEntry = {
          id: uuid(),
          employee_id: after.id,
          changed_at: new Date().toISOString(),
          changed_by: userId,
          field_name: typedKey,
          old_value: before[typedKey] === undefined ? null : String(before[typedKey]),
          new_value: after[typedKey] === undefined ? null : String(after[typedKey]),
          comment
        };
        this.repository.addChangeLog(entry);
        entries.push(entry);
      }
    });
    return entries;
  }
}
