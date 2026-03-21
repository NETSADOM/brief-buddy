import { randomUUID } from "node:crypto";
import { pool } from "../db/queries";

export interface TaskRecord {
  id: string;
  userId: string;
  text: string;
  source: "email" | "slack" | "manual";
  priority: "CRITICAL" | "HIGH" | "NORMAL" | "FYI";
  dueDate: string | null;
  status: "open" | "done" | "snoozed" | "delegated";
  createdAt: string;
}

export async function createTask(input: Omit<TaskRecord, "id" | "createdAt">): Promise<TaskRecord> {
  const id = randomUUID();
  const result = await pool.query<TaskRecord>(
    `INSERT INTO tasks (id, user_id, text, source, priority, due_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING
       id,
       user_id AS "userId",
       text,
       source,
       priority,
       due_date::text AS "dueDate",
       status,
       created_at::text AS "createdAt"`,
    [id, input.userId, input.text, input.source, input.priority, input.dueDate, input.status]
  );
  return result.rows[0];
}

export async function getTasks(userId: string): Promise<TaskRecord[]> {
  const result = await pool.query<TaskRecord>(
    `SELECT
       id,
       user_id AS "userId",
       text,
       source,
       priority,
       due_date::text AS "dueDate",
       status,
       created_at::text AS "createdAt"
     FROM tasks
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function updateTask(
  taskId: string,
  userId: string,
  updates: Partial<Pick<TaskRecord, "text" | "priority" | "dueDate" | "status">>
): Promise<TaskRecord | null> {
  const result = await pool.query<TaskRecord>(
    `UPDATE tasks
        SET text = COALESCE($2, text),
            priority = COALESCE($3, priority),
            due_date = COALESCE($4::timestamptz, due_date),
            status = COALESCE($5, status)
      WHERE id = $1
        AND user_id = $2
      RETURNING
        id,
        user_id AS "userId",
        text,
        source,
        priority,
        due_date::text AS "dueDate",
        status,
        created_at::text AS "createdAt"`,
    [taskId, userId, updates.text ?? null, updates.priority ?? null, updates.dueDate ?? null, updates.status ?? null]
  );
  return result.rows[0] ?? null;
}

export async function deleteTask(taskId: string, userId: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [taskId, userId]);
  return (result.rowCount ?? 0) > 0;
}

export async function getTaskById(taskId: string, userId: string): Promise<TaskRecord | null> {
  const result = await pool.query<TaskRecord>(
    `SELECT
       id,
       user_id AS "userId",
       text,
       source,
       priority,
       due_date::text AS "dueDate",
       status,
       created_at::text AS "createdAt"
     FROM tasks
     WHERE id = $1
       AND user_id = $2`,
    [taskId, userId]
  );
  return result.rows[0] ?? null;
}

export async function getTopOpenTasks(userId: string, limit: number): Promise<TaskRecord[]> {
  const result = await pool.query<TaskRecord>(
    `SELECT
       id,
       user_id AS "userId",
       text,
       source,
       priority,
       due_date::text AS "dueDate",
       status,
       created_at::text AS "createdAt"
     FROM tasks
     WHERE user_id = $1 AND status = 'open'
     ORDER BY
       CASE priority
         WHEN 'CRITICAL' THEN 1
         WHEN 'HIGH' THEN 2
         WHEN 'NORMAL' THEN 3
         ELSE 4
       END,
       created_at ASC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}
