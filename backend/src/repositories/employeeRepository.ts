// sql.js typings are provided via shim; using any to avoid build issues
type SqlDatabase = any;
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
import { persist } from '../utils/db.js';
import path from 'path';

const parseRow = <T>(row: { json?: string } | undefined): T | undefined => (row?.json ? (JSON.parse(row.json) as T) : undefined);
const parseRows = <T>(rows: { json: string }[]) => rows.map(r => JSON.parse(r.json) as T);

export class EmployeeRepository {
  private readonly dbFile: string;
  private readonly shouldPersist: boolean;

  constructor(private readonly db: SqlDatabase, dbPath: string) {
    this.dbFile = path.resolve(dbPath);
    this.shouldPersist = dbPath !== ':memory:';
  }

  private save() {
    if (this.shouldPersist) {
      persist(this.db, this.dbFile);
    }
  }

  createEmployee(payload: Omit<Employee, 'id'>): Employee {
    const id = uuid();
    const employee: Employee = { ...payload, id };
    this.db.run('INSERT INTO employees (id, json) VALUES (?, ?)', [id, JSON.stringify(employee)]);
    this.save();
    return employee;
  }

  updateEmployee(id: string, payload: Partial<Employee>): Employee | undefined {
    const existing = this.getEmployee(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...payload, id };
    this.db.run('UPDATE employees SET json = ? WHERE id = ?', [JSON.stringify(updated), id]);
    this.save();
    return updated;
  }

  replaceEmployee(id: string, payload: Omit<Employee, 'id'>): Employee | undefined {
    if (!this.getEmployee(id)) return undefined;
    const replaced: Employee = { ...payload, id };
    this.db.run('UPDATE employees SET json = ? WHERE id = ?', [JSON.stringify(replaced), id]);
    this.save();
    return replaced;
  }

  getEmployee(id: string): Employee | undefined {
    const stmt = this.db.prepare('SELECT json FROM employees WHERE id = ?');
    const row = stmt.getAsObject([id]) as { json?: string };
    return parseRow<Employee>(row);
  }

  listEmployees(): Employee[] {
    const rows = selectAll(this.db, 'SELECT json FROM employees');
    return parseRows<Employee>(rows as any);
  }

  addSkill(skill: Skill): Skill {
    this.db.run('INSERT OR REPLACE INTO skills (id, json) VALUES (?, ?)', [skill.id, JSON.stringify(skill)]);
    this.save();
    return skill;
  }

  addRole(role: Role): Role {
    this.db.run('INSERT OR REPLACE INTO roles (id, json) VALUES (?, ?)', [role.id, JSON.stringify(role)]);
    this.save();
    return role;
  }

  linkSkills(employee_id: string, payloads: EmployeeSkill[]): EmployeeSkill[] {
    this.db.run('DELETE FROM employee_skills WHERE employee_id = ?', [employee_id]);
    const stmt = this.db.prepare('INSERT INTO employee_skills (employee_id, skill_id, json) VALUES (?, ?, ?)');
    payloads.forEach(row => stmt.run([employee_id, row.skill_id, JSON.stringify(row)]));
    this.save();
    return payloads;
  }

  removeSkill(employee_id: string, skill_id: string) {
    this.db.run('DELETE FROM employee_skills WHERE employee_id = ? AND skill_id = ?', [employee_id, skill_id]);
    this.save();
  }

  linkRoles(employee_id: string, roles: EmployeeRole[]): EmployeeRole[] {
    this.db.run('DELETE FROM employee_roles WHERE employee_id = ?', [employee_id]);
    const stmt = this.db.prepare('INSERT INTO employee_roles (employee_id, role_id, json) VALUES (?, ?, ?)');
    roles.forEach(row => stmt.run([employee_id, row.role_id, JSON.stringify(row)]));
    this.save();
    return roles;
  }

  removeRole(employee_id: string, role_id: string) {
    this.db.run('DELETE FROM employee_roles WHERE employee_id = ? AND role_id = ?', [employee_id, role_id]);
    this.save();
  }

  addResponsibility(res: EmployeeResponsibility): EmployeeResponsibility {
    this.db.run('INSERT OR REPLACE INTO responsibilities (id, employee_id, json) VALUES (?, ?, ?)', [
      res.id,
      res.employee_id,
      JSON.stringify(res)
    ]);
    this.save();
    return res;
  }

  updateResponsibility(id: string, payload: Partial<EmployeeResponsibility>) {
    const existing = selectOne(this.db, 'SELECT json FROM responsibilities WHERE id = ?', [id]);
    const parsed = parseRow<EmployeeResponsibility>(existing as any);
    if (!parsed) return undefined;
    const updated = { ...parsed, ...payload };
    this.db.run('UPDATE responsibilities SET json = ? WHERE id = ?', [JSON.stringify(updated), id]);
    this.save();
    return updated;
  }

  addScheduleHistory(entry: EmployeeWorkScheduleHistory) {
    const id = uuid();
    this.db.run('INSERT OR REPLACE INTO schedule_history (id, employee_id, json) VALUES (?, ?, ?)', [
      id,
      entry.employee_id,
      JSON.stringify(entry)
    ]);
    this.save();
    return entry;
  }

  addStatusChange(entry: EmployeeStatusChange) {
    this.db.run('INSERT OR REPLACE INTO status_history (id, employee_id, json) VALUES (?, ?, ?)', [
      entry.id,
      entry.employee_id,
      JSON.stringify(entry)
    ]);
    this.save();
    return entry;
  }

  addChangeLog(entry: EmployeeChangeLogEntry) {
    this.db.run('INSERT OR REPLACE INTO change_log (id, employee_id, json) VALUES (?, ?, ?)', [
      entry.id,
      entry.employee_id,
      JSON.stringify(entry)
    ]);
    this.save();
    return entry;
  }

  private getSkill(skill_id: string): Skill | undefined {
    const row = selectOne(this.db, 'SELECT json FROM skills WHERE id = ?', [skill_id]);
    return parseRow<Skill>(row as any);
  }

  private getRole(role_id: string): Role | undefined {
    const row = selectOne(this.db, 'SELECT json FROM roles WHERE id = ?', [role_id]);
    return parseRow<Role>(row as any);
  }

  getFullEmployee(id: string): EmployeeWithRelations | undefined {
    const employee = this.getEmployee(id);
    if (!employee) return undefined;
    const responsibilities = parseRows<EmployeeResponsibility>(
      selectAll(this.db, 'SELECT json FROM responsibilities WHERE employee_id = ?', [id]) as any
    );
    const schedule_history = parseRows<EmployeeWorkScheduleHistory>(
      selectAll(this.db, 'SELECT json FROM schedule_history WHERE employee_id = ?', [id]) as any
    );
    const status_history = parseRows<EmployeeStatusChange>(
      selectAll(this.db, 'SELECT json FROM status_history WHERE employee_id = ?', [id]) as any
    );
    const skills = parseRows<EmployeeSkill>(selectAll(this.db, 'SELECT json FROM employee_skills WHERE employee_id = ?', [id]) as any)
      .map(es => ({ ...es, skill: this.getSkill(es.skill_id)! }))
      .filter(es => es.skill);
    const roles = parseRows<EmployeeRole>(selectAll(this.db, 'SELECT json FROM employee_roles WHERE employee_id = ?', [id]) as any)
      .map(er => ({ ...er, role: this.getRole(er.role_id)! }))
      .filter(er => er.role);
    const changes = parseRows<EmployeeChangeLogEntry>(selectAll(this.db, 'SELECT json FROM change_log WHERE employee_id = ?', [id]) as any);

    return { ...employee, responsibilities, schedule_history, status_history, skills, roles, changes };
  }

  filterEmployees(filters: {
    status?: EmployeeStatus;
    department?: string;
    role?: string;
    skill?: string;
    manager_id?: string;
    q?: string;
  }): Employee[] {
    const all = this.listEmployees();
    return all.filter(emp => {
      if (filters.status && emp.status !== filters.status) return false;
      if (filters.department && emp.department !== filters.department) return false;
      if (filters.manager_id && emp.manager_id !== filters.manager_id) return false;
      if (filters.q) {
        const haystack = `${emp.first_name} ${emp.last_name} ${emp.middle_name ?? ''} ${emp.email_work}`.toLowerCase();
        if (!haystack.includes(filters.q.toLowerCase())) return false;
      }
      if (filters.role) {
        const hasRole =
          selectAll(this.db, 'SELECT 1 FROM employee_roles WHERE employee_id = ? AND role_id = ? LIMIT 1', [emp.id, filters.role]).length > 0;
        if (!hasRole) return false;
      }
      if (filters.skill) {
        const hasSkill =
          selectAll(this.db, 'SELECT 1 FROM employee_skills WHERE employee_id = ? AND skill_id = ? LIMIT 1', [emp.id, filters.skill]).length > 0;
        if (!hasSkill) return false;
      }
      return true;
    });
  }
}

function selectAll(db: any, sql: string, params: any[] = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  return rows;
}

function selectOne(db: any, sql: string, params: any[] = []) {
  const stmt = db.prepare(sql);
  const row = stmt.getAsObject(params);
  return row;
}
