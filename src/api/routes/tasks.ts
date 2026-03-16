import { Router } from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../../tasks/taskStore";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const tasks = await getTasks(req.user!.id);
  res.json(tasks);
});

tasksRouter.post("/", async (req: AuthenticatedRequest, res) => {
  const task = await createTask({
    userId: req.user!.id,
    text: req.body.text,
    source: req.body.source ?? "manual",
    priority: req.body.priority ?? "NORMAL",
    dueDate: req.body.dueDate ?? null,
    status: req.body.status ?? "open"
  });
  res.status(201).json(task);
});

tasksRouter.patch("/:id", async (req, res) => {
  const updated = await updateTask(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(updated);
});

tasksRouter.delete("/:id", async (req, res) => {
  const deleted = await deleteTask(req.params.id);
  res.json({ deleted });
});
