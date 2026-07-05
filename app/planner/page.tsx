"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Plus,
  Trash2,
} from "lucide-react";

type PlannerTask = {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  created_at: string;
};

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["todo", "in_progress", "done"];

export default function PlannerPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadPlanner();
  }, []);

  const loadPlanner = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/login");
      return;
    }

    setUserId(userData.user.id);

    const { data, error } = await supabase
      .from("planner_tasks")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setTasks(data || []);
    setLoading(false);
  };

  const handleAddTask = async () => {
    setMessage("");

    if (!userId) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setMessage("Please enter task title.");
      return;
    }

    const { error } = await supabase.from("planner_tasks").insert({
      user_id: userId,
      subject: subject || "General",
      title,
      description: description || null,
      due_date: dueDate || null,
      priority,
      status: "todo",
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setSubject("");
    setTitle("");
    setDueDate("");
    setPriority("Medium");
    setDescription("");

    await loadPlanner();
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    const { error } = await supabase
      .from("planner_tasks")
      .update({ status })
      .eq("id", taskId);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadPlanner();
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("planner_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadPlanner();
  };

  const getPriorityStyle = (value: string) => {
    if (value === "High") return "bg-red-100 text-red-700";
    if (value === "Medium") return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const getStatusLabel = (value: string) => {
    if (value === "todo") return "To do";
    if (value === "in_progress") return "In progress";
    return "Done";
  };

  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const progressCount = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;
  const doneCount = tasks.filter((task) => task.status === "done").length;

  return (
    <MobileShell title="Study Planner">
      <section className="mb-5 rounded-3xl bg-red-700 p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-red-700">
            <ClipboardList size={32} />
          </div>

          <div>
            <h2 className="text-xl font-extrabold">My Study Plan</h2>
            <p className="text-sm text-red-100">
              Plan your tasks, deadlines, and study progress
            </p>
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-3 text-center shadow">
          <p className="text-xl font-extrabold text-red-700">{todoCount}</p>
          <p className="text-xs text-gray-500">To do</p>
        </div>

        <div className="rounded-2xl bg-white p-3 text-center shadow">
          <p className="text-xl font-extrabold text-yellow-600">
            {progressCount}
          </p>
          <p className="text-xs text-gray-500">Progress</p>
        </div>

        <div className="rounded-2xl bg-white p-3 text-center shadow">
          <p className="text-xl font-extrabold text-green-600">{doneCount}</p>
          <p className="text-xs text-gray-500">Done</p>
        </div>
      </section>

      <section className="mb-5 rounded-3xl bg-white p-4 shadow">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-red-700">
          <Plus size={18} />
          Add Study Task
        </h3>

        {message && (
          <div className="mb-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            {message}
          </div>
        )}

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Subject
        </label>
        <input
          type="text"
          placeholder="Example: Marketing"
          className="mb-3 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Task title
        </label>
        <input
          type="text"
          placeholder="Example: Review SWOT Analysis"
          className="mb-3 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Description optional
        </label>
        <textarea
          placeholder="Add more detail..."
          className="mb-3 min-h-[80px] w-full resize-none rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Deadline
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Priority
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              {PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAddTask}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 py-3 font-bold text-white"
        >
          <Plus size={20} />
          Add Task
        </button>
      </section>

      <section className="rounded-3xl bg-white p-4 shadow">
        <h3 className="mb-3 font-bold text-red-700">My Tasks</h3>

        {loading ? (
          <p className="text-sm text-gray-500">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-red-200 p-5 text-center text-sm text-gray-500">
            No study task yet.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-2xl border p-4 ${
                  task.status === "done"
                    ? "border-green-100 bg-green-50"
                    : "border-red-100 bg-red-50"
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-red-700">
                      {task.subject || "General"}
                    </p>
                    <h4
                      className={`font-extrabold ${
                        task.status === "done"
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="rounded-full bg-white p-2 text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {task.description && (
                  <p className="mb-3 text-sm text-gray-600">
                    {task.description}
                  </p>
                )}

                <div className="mb-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityStyle(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-600">
                    {getStatusLabel(task.status)}
                  </span>

                  {task.due_date && (
                    <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-600">
                      <CalendarDays size={13} />
                      {task.due_date}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(task.id, status)}
                      className={`rounded-xl border px-2 py-2 text-xs font-bold ${
                        task.status === status
                          ? "border-red-700 bg-red-700 text-white"
                          : "border-red-100 bg-white text-red-700"
                      }`}
                    >
                      {status === "done" ? (
                        <span className="flex items-center justify-center gap-1">
                          <CheckCircle size={13} />
                          Done
                        </span>
                      ) : (
                        getStatusLabel(status)
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </MobileShell>
  );
}