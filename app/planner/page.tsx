"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays,
  Check,
  CheckCircle,
  Circle,
  Clock3,
  ClipboardList,
  Plus,
  Trash2,
  X,
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

type StatusFilter = "all" | "todo" | "in_progress" | "done";

const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["todo", "in_progress", "done"];

export default function PlannerPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PlannerTask | null>(null);

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

  const resetForm = () => {
    setSubject("");
    setTitle("");
    setDueDate("");
    setPriority("Medium");
    setDescription("");
    setMessage("");
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

    resetForm();
    setShowAddModal(false);
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

  const handleFilterClick = (status: StatusFilter) => {
    setStatusFilter((prev) => (prev === status ? "all" : status));
  };

  const getStatusLabel = (value: string) => {
    if (value === "todo") return "To do";
    if (value === "in_progress") return "Progress";
    if (value === "done") return "Done";
    return "All";
  };

  const getTaskCardStyle = (status: string) => {
    if (status === "todo") {
      return {
        card: "border-red-100 bg-red-50",
        badge: "bg-red-700 text-white",
        icon: "text-red-700",
        dot: "bg-red-600",
      };
    }

    if (status === "in_progress") {
      return {
        card: "border-yellow-100 bg-yellow-50",
        badge: "bg-yellow-500 text-white",
        icon: "text-yellow-600",
        dot: "bg-yellow-500",
      };
    }

    return {
      card: "border-green-100 bg-green-50",
      badge: "bg-green-600 text-white",
      icon: "text-green-700",
      dot: "bg-green-600",
    };
  };

  const getPriorityStyle = (value: string) => {
    if (value === "High") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (value === "Medium") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    return "bg-green-100 text-green-700 border-green-200";
  };

  const getPriorityDot = (value: string) => {
    if (value === "High") return "bg-red-600";
    if (value === "Medium") return "bg-yellow-500";
    return "bg-green-600";
  };

  const getStatusIcon = (status: string) => {
    if (status === "todo") return <Circle size={17} />;
    if (status === "in_progress") return <Clock3 size={17} />;
    return <CheckCircle size={17} />;
  };

  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const progressCount = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;
  const doneCount = tasks.filter((task) => task.status === "done").length;

  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);

  return (
    <MobileShell>
      <section className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-600">
              Study Planner
            </p>
            <h1 className="text-3xl font-bold text-slate-900">My Tasks</h1>
          </div>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => handleFilterClick("todo")}
          className={`rounded-[24px] border p-4 text-center transition active:scale-95 ${statusFilter === "todo"
              ? "border-red-300 bg-red-100 ring-2 ring-red-100"
              : "border-red-100 bg-red-50"
            }`}
        >
          <p className="text-2xl font-bold text-red-700">{todoCount}</p>
          <p className="mt-1 text-xs font-medium text-red-700">To do</p>
        </button>

        <button
          type="button"
          onClick={() => handleFilterClick("in_progress")}
          className={`rounded-[24px] border p-4 text-center transition active:scale-95 ${statusFilter === "in_progress"
              ? "border-yellow-300 bg-yellow-100 ring-2 ring-yellow-100"
              : "border-yellow-100 bg-yellow-50"
            }`}
        >
          <p className="text-2xl font-bold text-yellow-600">
            {progressCount}
          </p>
          <p className="mt-1 text-xs font-medium text-yellow-700">Progress</p>
        </button>

        <button
          type="button"
          onClick={() => handleFilterClick("done")}
          className={`rounded-[24px] border p-4 text-center transition active:scale-95 ${statusFilter === "done"
              ? "border-green-300 bg-green-100 ring-2 ring-green-100"
              : "border-green-100 bg-green-50"
            }`}
        >
          <p className="text-2xl font-bold text-green-600">{doneCount}</p>
          <p className="mt-1 text-xs font-medium text-green-700">Done</p>
        </button>
      </section>

      <section className="rounded-[32px] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Task List</h2>
            <p className="text-sm text-slate-500">
              {statusFilter === "all"
                ? `${tasks.length} tasks total`
                : `Showing ${filteredTasks.length} ${getStatusLabel(
                  statusFilter
                )} tasks`}
            </p>
          </div>

          {statusFilter === "all" ? (
            <ClipboardList size={24} className="shrink-0 text-red-700" />
          ) : (
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className="shrink-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
            >
              Show all
            </button>
          )}
        </div>

        {message && !showAddModal && (
          <div className="mb-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            {message}
          </div>
        )}

        {loading ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            Loading tasks...
          </p>
        ) : tasks.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-red-200 p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700">
              <ClipboardList size={28} />
            </div>

            <p className="font-semibold text-slate-800">No task yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Tap + to add your first study plan.
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-red-200 p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700">
              <ClipboardList size={28} />
            </div>

            <p className="font-semibold text-slate-800">
              No tasks in this status
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const style = getTaskCardStyle(task.status);

              return (
                <div
                  key={task.id}
                  className={`rounded-[28px] border p-4 ${style.card}`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${style.dot}`}
                        />

                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {task.subject || "General"}
                        </span>
                      </div>

                      <h3
                        className={`text-lg font-bold leading-tight ${task.status === "done"
                            ? "text-green-900"
                            : "text-slate-900"
                          }`}
                      >
                        <span className="relative inline-block">
                          {task.title}

                          {task.status === "done" && (
                            <span className="pointer-events-none absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-green-600/70" />
                          )}
                        </span>
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(task)}
                      className="rounded-full bg-white/80 p-2 text-slate-400 transition hover:text-red-700"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {task.description && (
                    <p className="mb-3 text-sm leading-6 text-slate-600">
                      {task.description}
                    </p>
                  )}

                  <div className="mb-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
                    >
                      {getStatusLabel(task.status)}
                    </span>

                    <span
                      className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${getPriorityStyle(
                        task.priority
                      )}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${getPriorityDot(
                          task.priority
                        )}`}
                      />
                      {task.priority}
                    </span>

                    {task.due_date && (
                      <span className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
                        <CalendarDays size={13} />
                        {task.due_date}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {STATUSES.map((status) => {
                      const active = task.status === status;
                      const buttonStyle = getTaskCardStyle(status);

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleUpdateStatus(task.id, status)}
                          className={`flex min-w-0 items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-[11px] font-bold whitespace-nowrap ${active
                              ? buttonStyle.badge
                              : "bg-white/80 text-slate-500"
                            }`}
                        >
                          <span
                            className={active ? "text-white" : buttonStyle.icon}
                          >
                            {getStatusIcon(status)}
                          </span>
                          <span className="whitespace-nowrap">
                            {getStatusLabel(status)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}
        className="fixed bottom-[calc(124px+env(safe-area-inset-bottom))] right-[calc(20px+max(0px,(100vw-430px)/2))] z-40 flex h-16 w-16 items-center justify-center rounded-full bg-red-700 text-white shadow-[0_16px_35px_rgba(185,28,28,0.18)]"
      >
        <Plus size={32} />
      </button>

      {showAddModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4">
          <div className="max-h-[86dvh] w-full max-w-[390px] overflow-y-auto rounded-[34px] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600">
                  New Planner Task
                </p>
                <h2 className="text-2xl font-bold text-slate-900">Add Task</h2>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                className="rounded-full bg-slate-100 p-2 text-slate-500"
              >
                <X size={22} />
              </button>
            </div>

            {message && (
              <div className="mb-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
                {message}
              </div>
            )}

            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Subject
            </label>
            <input
              type="text"
              className="mb-3 w-full rounded-2xl border border-slate-200 bg-white p-3 text-base outline-none focus:border-red-400"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />

            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Task title
            </label>
            <input
              type="text"
              className="mb-3 w-full rounded-2xl border border-slate-200 bg-white p-3 text-base outline-none focus:border-red-400"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Description optional
            </label>
            <textarea
              placeholder="Add more detail..."
              className="mb-3 min-h-[88px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-base outline-none focus:border-red-400"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Priority
            </label>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {PRIORITIES.map((item) => {
                const active = priority === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPriority(item)}
                    className={`flex items-center justify-center gap-1 rounded-2xl border px-3 py-3 text-sm font-bold ${getPriorityStyle(
                      item
                    )} ${active ? "ring-2 ring-offset-2 ring-red-200" : ""}`}
                  >
                    {active && <Check size={16} />}
                    {item}
                  </button>
                );
              })}
            </div>

            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Deadline
            </label>
            <div className="w-full min-w-0">
              <input
                type="date"
                className="block h-14 w-full min-w-0 max-w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-red-400"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>

            <button
              onClick={handleAddTask}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 py-3.5 font-bold text-white shadow-lg shadow-red-100"
            >
              <Plus size={20} />
              Add Task
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-[340px] rounded-[32px] bg-white p-5 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700">
              <Trash2 size={28} />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Delete this task?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              “{deleteTarget.title}” will be removed from your planner.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl bg-slate-100 py-3 font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleDeleteTask(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="rounded-2xl bg-red-700 py-3 font-bold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
