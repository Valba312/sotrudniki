import { v4 as uuid } from 'uuid';
import {
  Employee,
  EmployeeResponsibility,
  EmployeeRole,
  EmployeeSkill,
  EmployeeStatusChange,
  EmployeeWithRelations,
  EmployeeWorkScheduleHistory,
  Role,
  Skill
} from '../models/employee.js';
import { EmployeeRepository } from '../repositories/employeeRepository.js';
import { AuditService } from './auditService.js';
import { EmployeeStatus } from '../types/enums.js';

export class EmployeeService {
  constructor(private readonly repository: EmployeeRepository, private readonly audit: AuditService) {}

  createEmployee(payload: Omit<Employee, 'id'>, userId: string): Employee {
    const employee = this.repository.createEmployee(payload);
    this.audit.captureChange(employee, employee, userId, 'created');
    return employee;
  }

  updateEmployee(id: string, payload: Partial<Employee>, userId: string): Employee | undefined {
    const existing = this.repository.getEmployee(id);
    if (!existing) return undefined;
    const updated = this.repository.updateEmployee(id, payload);
    if (updated) this.audit.captureChange(existing, updated, userId, 'updated');
    return updated;
  }

  replaceEmployee(id: string, payload: Omit<Employee, 'id'>, userId: string): Employee | undefined {
    const existing = this.repository.getEmployee(id);
    if (!existing) return undefined;
    const replaced = this.repository.replaceEmployee(id, payload);
    if (replaced) this.audit.captureChange(existing, replaced, userId, 'replaced');
    return replaced;
  }

  getEmployee(id: string): EmployeeWithRelations | undefined {
    return this.repository.getFullEmployee(id);
  }

  listEmployees(filters: {
    status?: EmployeeStatus;
    department?: string;
    role?: string;
    skill?: string;
    manager_id?: string;
    q?: string;
  }): EmployeeWithRelations[] {
    return this.repository
      .filterEmployees(filters)
      .map(emp => this.repository.getFullEmployee(emp.id)!)
      .filter(Boolean);
  }

  setSkills(employee_id: string, skillPayloads: EmployeeSkill[]): EmployeeSkill[] {
    return this.repository.linkSkills(employee_id, skillPayloads);
  }

  removeSkill(employee_id: string, skill_id: string) {
    return this.repository.removeSkill(employee_id, skill_id);
  }

  setRoles(employee_id: string, roles: EmployeeRole[]) {
    return this.repository.linkRoles(employee_id, roles);
  }

  removeRole(employee_id: string, role_id: string) {
    return this.repository.removeRole(employee_id, role_id);
  }

  addResponsibility(employee_id: string, payload: Omit<EmployeeResponsibility, 'id' | 'employee_id'>) {
    const responsibility: EmployeeResponsibility = { ...payload, employee_id, id: uuid() };
    return this.repository.addResponsibility(responsibility);
  }

  addScheduleHistory(employee_id: string, payload: Omit<EmployeeWorkScheduleHistory, 'employee_id'>) {
    const entry: EmployeeWorkScheduleHistory = { ...payload, employee_id };
    return this.repository.addScheduleHistory(entry);
  }

  changeStatus(employee_id: string, to_status: EmployeeStatus, changed_by: string, reason?: string) {
    const employee = this.repository.getEmployee(employee_id);
    if (!employee) return undefined;
    const statusChange: EmployeeStatusChange = {
      id: uuid(),
      employee_id,
      from_status: employee.status,
      to_status,
      changed_at: new Date().toISOString(),
      changed_by,
      reason
    };
    this.repository.addStatusChange(statusChange);
    this.repository.updateEmployee(employee_id, { status: to_status });
    this.audit.captureChange(employee, { ...employee, status: to_status }, changed_by, reason);
    return statusChange;
  }

  addSkillDefinition(name: string, description?: string): Skill {
    const skill: Skill = { id: uuid(), name, description };
    return this.repository.addSkill(skill);
  }

  addRoleDefinition(name: string, description?: string): Role {
    const role: Role = { id: uuid(), name, description };
    return this.repository.addRole(role);
  }

  getStatusHistory(employee_id: string): EmployeeStatusChange[] {
    return this.repository.getFullEmployee(employee_id)?.status_history ?? [];
  }

  getChangeLog(employee_id: string): EmployeeWithRelations['changes'] {
    return this.repository.getFullEmployee(employee_id)?.changes ?? [];
  }
}
