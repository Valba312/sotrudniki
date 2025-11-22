import { describe, expect, it } from 'vitest';
import { EmployeeRepository } from '../src/repositories/employeeRepository.js';
import { AuditService } from '../src/services/auditService.js';
import { EmployeeService } from '../src/services/employeeService.js';
import { Employee } from '../src/models/employee.js';

describe('EmployeeService', () => {
  const baseEmployee: Omit<Employee, 'id'> = {
    first_name: 'Ivan',
    last_name: 'Petrov',
    middle_name: 'Ivanovich',
    date_of_birth: '1990-01-01',
    personal_ids: ['123'],
    hire_date: '2020-01-01',
    employment_type: 'full_time',
    position: 'Engineer',
    department: 'R&D',
    manager_id: undefined,
    work_location: 'office',
    email_work: 'ivan@example.com',
    phone_work: '+70000000000',
    work_schedule_type: 'five_two',
    work_hours_per_week: 40,
    status: 'active'
  };

  const setup = () => {
    const repository = new EmployeeRepository();
    const audit = new AuditService(repository);
    const service = new EmployeeService(repository, audit);
    const employee = service.createEmployee(baseEmployee, 'system');
    return { service, employee };
  };

  it('changes status and records history', () => {
    const { service, employee } = setup();
    const change = service.changeStatus(employee.id, 'on_leave', 'manager-1', 'vacation');
    expect(change?.to_status).toBe('on_leave');
    const history = service.getStatusHistory(employee.id);
    expect(history.length).toBe(1);
    expect(history[0].reason).toBe('vacation');
  });

  it('creates change log entries on update', () => {
    const { service, employee } = setup();
    service.updateEmployee(employee.id, { position: 'Lead Engineer' }, 'manager-1');
    const log = service.getChangeLog(employee.id);
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].field_name).toBe('position');
  });
});
