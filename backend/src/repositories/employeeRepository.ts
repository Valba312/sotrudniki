import { v4 as uuid } from 'uuid';
import {
  Employee,
  EmployeeChangeLogEntry,
  EmployeeResponsibility,
  EmployeeRole,
  EmployeeSkill,
  EmployeeStatusChange,
  EmployeeWithRelations,
  EmployeeWorkScheduleHistory,
  Role,
  Skill
} from '../models/employee.js';
import { EmployeeStatus } from '../types/enums.js';

export class EmployeeRepository {
  private employees = new Map<string, Employee>();
  private responsibilities: EmployeeResponsibility[] = [];
  private skills: Skill[] = [];
  private roles: Role[] = [];
  private employeeSkills: EmployeeSkill[] = [];
  private employeeRoles: EmployeeRole[] = [];
  private scheduleHistory: EmployeeWorkScheduleHistory[] = [];
  private statusHistory: EmployeeStatusChange[] = [];
  private changeLog: EmployeeChangeLogEntry[] = [];

  createEmployee(payload: Omit<Employee, 'id'>): Employee {
    const id = uuid();
    const employee: Employee = { ...payload, id };
    this.employees.set(id, employee);
    return employee;
  }

  updateEmployee(id: string, payload: Partial<Employee>): Employee | undefined {
    const existing = this.employees.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...payload, id };
    this.employees.set(id, updated);
    return updated;
  }

  replaceEmployee(id: string, payload: Omit<Employee, 'id'>): Employee | undefined {
    if (!this.employees.has(id)) return undefined;
    const replaced: Employee = { ...payload, id };
    this.employees.set(id, replaced);
    return replaced;
  }

  getEmployee(id: string): Employee | undefined {
    return this.employees.get(id);
  }

  listEmployees(): Employee[] {
    return Array.from(this.employees.values());
  }

  addSkill(skill: Skill): Skill {
    this.skills.push(skill);
    return skill;
  }

  addRole(role: Role): Role {
    this.roles.push(role);
    return role;
  }

  linkSkills(employee_id: string, payloads: EmployeeSkill[]): EmployeeSkill[] {
    this.employeeSkills = this.employeeSkills.filter(es => es.employee_id !== employee_id);
    this.employeeSkills.push(...payloads);
    return payloads;
  }

  removeSkill(employee_id: string, skill_id: string) {
    this.employeeSkills = this.employeeSkills.filter(es => !(es.employee_id === employee_id && es.skill_id === skill_id));
  }

  linkRoles(employee_id: string, roles: EmployeeRole[]): EmployeeRole[] {
    this.employeeRoles = this.employeeRoles.filter(er => er.employee_id !== employee_id);
    this.employeeRoles.push(...roles);
    return roles;
  }

  removeRole(employee_id: string, role_id: string) {
    this.employeeRoles = this.employeeRoles.filter(er => !(er.employee_id === employee_id && er.role_id === role_id));
  }

  addResponsibility(res: EmployeeResponsibility): EmployeeResponsibility {
    this.responsibilities.push(res);
    return res;
  }

  updateResponsibility(id: string, payload: Partial<EmployeeResponsibility>) {
    const idx = this.responsibilities.findIndex(r => r.id === id);
    if (idx === -1) return undefined;
    const updated = { ...this.responsibilities[idx], ...payload };
    this.responsibilities[idx] = updated;
    return updated;
  }

  addScheduleHistory(entry: EmployeeWorkScheduleHistory) {
    this.scheduleHistory.push(entry);
    return entry;
  }

  addStatusChange(entry: EmployeeStatusChange) {
    this.statusHistory.push(entry);
    return entry;
  }

  addChangeLog(entry: EmployeeChangeLogEntry) {
    this.changeLog.push(entry);
    return entry;
  }

  getFullEmployee(id: string): EmployeeWithRelations | undefined {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    const responsibilities = this.responsibilities.filter(r => r.employee_id === id);
    const schedule_history = this.scheduleHistory.filter(s => s.employee_id === id);
    const status_history = this.statusHistory.filter(s => s.employee_id === id);
    const skills = this.employeeSkills
      .filter(es => es.employee_id === id)
      .map(es => ({ ...es, skill: this.skills.find(s => s.id === es.skill_id)! }))
      .filter(es => es.skill);
    const roles = this.employeeRoles
      .filter(er => er.employee_id === id)
      .map(er => ({ ...er, role: this.roles.find(r => r.id === er.role_id)! }))
      .filter(er => er.role);
    const changes = this.changeLog.filter(c => c.employee_id === id);
    return {
      ...employee,
      responsibilities,
      schedule_history,
      status_history,
      skills,
      roles,
      changes
    };
  }

  filterEmployees(filters: {
    status?: EmployeeStatus;
    department?: string;
    role?: string;
    skill?: string;
    manager_id?: string;
    q?: string;
  }): Employee[] {
    return this.listEmployees().filter(emp => {
      if (filters.status && emp.status !== filters.status) return false;
      if (filters.department && emp.department !== filters.department) return false;
      if (filters.manager_id && emp.manager_id !== filters.manager_id) return false;
      if (filters.q) {
        const haystack = `${emp.first_name} ${emp.last_name} ${emp.middle_name ?? ''} ${emp.email_work}`.toLowerCase();
        if (!haystack.includes(filters.q.toLowerCase())) return false;
      }
      if (filters.role) {
        const hasRole = this.employeeRoles.some(er => er.employee_id === emp.id && er.role_id === filters.role);
        if (!hasRole) return false;
      }
      if (filters.skill) {
        const hasSkill = this.employeeSkills.some(es => es.employee_id === emp.id && es.skill_id === filters.skill);
        if (!hasSkill) return false;
      }
      return true;
    });
  }
}
