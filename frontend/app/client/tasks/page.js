"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../../utils/logout";

export default function ClientTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "client") {
      router.push("/login");
      return;
    }

    fetchClientTasks();
  }, [router]);

  const fetchClientTasks = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/api/my-tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch tasks");

      const data = await res.json();
      const fetchedTasks = data.tasks || data;
      setTasks(fetchedTasks);
      
      // Update statistics
      setStats({
        total: fetchedTasks.length,
        completed: fetchedTasks.filter(t => t.status === "completed").length,
        inProgress: fetchedTasks.filter(t => t.status === "in_progress").length,
        pending: fetchedTasks.filter(t => t.status === "pending").length
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Unable to fetch tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      fetchClientTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Could not update task status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "in_progress":
        return "🔄";
      case "completed":
        return "✅";
      default:
        return "❓";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
              <p className="text-sm text-gray-600">Welcome back, {localStorage.getItem("userName")}! 👋</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2"
            >
              <span>Logout</span>
              <span>🚪</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <span className="text-2xl">🔄</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Task List</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading your tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-gray-500 text-lg">You're all caught up! No tasks assigned yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)} border`}>
                          {getStatusEmoji(task.status)} {task.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">Task #{task.id}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                      <p className="text-gray-600 mb-4">{task.description}</p>
                      
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {task.status !== "in_progress" && (
                            <button
                              onClick={() => handleStatusChange(task.id, "in_progress")}
                              className="flex-1 bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
                            >
                              <span>🔄</span> Start Progress
                            </button>
                          )}
                          {task.status !== "completed" && (
                            <button
                              onClick={() => handleStatusChange(task.id, "completed")}
                              className="flex-1 bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center gap-2"
                            >
                              <span>✅</span> Complete
                            </button>
                          )}
                          {task.status !== "pending" && task.status !== "completed" && (
                            <button
                              onClick={() => handleStatusChange(task.id, "pending")}
                              className="flex-1 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center justify-center gap-2"
                            >
                              <span>⏳</span> Mark Pending
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
