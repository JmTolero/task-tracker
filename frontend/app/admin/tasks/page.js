"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../../utils/logout";
import TaskForm from "../../components/TaskForm";

export default function AdminTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [assignedTo, setAssignedTo] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }

    fetchTasks();
    fetchUsers();
  }, [router]);

  const fetchTasks = () => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/api/tasks", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || data))
      .catch((err) => console.error("Error fetching tasks:", err))
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8000/api/users?role=client", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.users || data))
      .catch((err) => console.error("Error fetching users:", err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const method = editTaskId ? "PUT" : "POST";
    const url = editTaskId
      ? `http://localhost:8000/api/tasks/${editTaskId}`
      : "http://localhost:8000/api/tasks";

    const body = JSON.stringify({
      title,
      description,
      status,
      assigned_to: assignedTo === "" ? null : assignedTo
    });

    try {
      console.log('Sending request:', { url, method, body: JSON.parse(body) });
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      const data = await res.json();
      console.log('Response:', data);

      if (!res.ok) {
        let errorMessage = data.message || 'Failed to save task';
        if (data.errors) {
          errorMessage += '\n' + Object.values(data.errors).flat().join('\n');
        }
        if (data.error) {
          errorMessage += '\nDetails: ' + data.error;
        }
        throw new Error(errorMessage);
      }

      setTitle("");
      setDescription("");
      setStatus("pending");
      setAssignedTo("");
      setEditTaskId(null);
      setShowAddForm(false);

      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      alert(error.message || "Error saving task");
    }
  };

  const handleEdit = (task) => {
    setEditTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setAssignedTo(task.assigned_to || "");
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete task");

      fetchTasks();
    } catch (error) {
      console.error(error);
      alert("Error deleting task");
    }
  };

  const getUserName = (id) => {
    if (!id) return "Unassigned";
    const user = users.find((u) => u.id === id);
    return user ? user.name || user.username : "Unknown User";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {localStorage.getItem("userName")}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Task Management Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Task Management</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showAddForm ? "Cancel" : "Add New Task"}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-8">
              <TaskForm
                onSubmit={handleSubmit}
                onCancel={() => {
                  setEditTaskId(null);
                  setTitle("");
                  setDescription("");
                  setStatus("pending");
                  setAssignedTo("");
                  setShowAddForm(false);
                }}
                editTaskId={editTaskId}
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                status={status}
                setStatus={setStatus}
                assignedTo={assignedTo}
                setAssignedTo={setAssignedTo}
                users={users}
              />
            </div>
          )}

          {/* Tasks List */}
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tasks available.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-500"
              >
                Create your first task
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Status:</span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <p>Created by: <span className="font-medium">{task.creator ? task.creator.name : 'Unknown'}</span></p>
                        <p>Assigned to: <span className="font-medium">{task.assigned_user ? task.assigned_user.name : 'Unassigned'}</span></p>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => {
                          setEditTaskId(task.id);
                          setTitle(task.title);
                          setDescription(task.description);
                          setStatus(task.status);
                          setAssignedTo(task.assigned_to || "");
                          setShowAddForm(true);
                        }}
                        className="flex-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="flex-1 bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Statistics</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === "completed").length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tasks.filter(t => t.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-purple-600">{users.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create New Task
              </button>
              <button
                onClick={() => router.push("/admin/tasks")}
                className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-md text-sm hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
