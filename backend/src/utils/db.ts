// sql.js typings via shim; keep Database as any
import initSqlJs from 'sql.js';
type SqlDatabase = any;
import fs from 'fs';
import path from 'path';

export async function createDatabaseConnection(dbFile: string): Promise<SqlDatabase> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => {
      const local = path.resolve('node_modules/sql.js/dist', file);
      const workspace = path.resolve('../node_modules/sql.js/dist', file);
      if (fs.existsSync(local)) return local;
      if (fs.existsSync(workspace)) return workspace;
      return local;
    }
  });

  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const buffer = fs.existsSync(dbFile) ? fs.readFileSync(dbFile) : undefined;
  const db = buffer ? new SQL.Database(buffer) : new SQL.Database();
  migrate(db);
  if (dbFile !== ':memory:') {
    persist(db, dbFile);
  }
  return db;
}

export function persist(db: SqlDatabase, dbFile: string) {
  if (dbFile === ':memory:') return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbFile, buffer);
}

function migrate(db: any) {
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (id TEXT PRIMARY KEY, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS responsibilities (id TEXT PRIMARY KEY, employee_id TEXT NOT NULL, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS skills (id TEXT PRIMARY KEY, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS roles (id TEXT PRIMARY KEY, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS employee_skills (employee_id TEXT NOT NULL, skill_id TEXT NOT NULL, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS employee_roles (employee_id TEXT NOT NULL, role_id TEXT NOT NULL, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS schedule_history (id TEXT PRIMARY KEY, employee_id TEXT NOT NULL, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS status_history (id TEXT PRIMARY KEY, employee_id TEXT NOT NULL, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS change_log (id TEXT PRIMARY KEY, employee_id TEXT NOT NULL, json TEXT NOT NULL);
  `);
}

export type DbConnection = SqlDatabase;
