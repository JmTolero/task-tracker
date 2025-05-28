export const logout = async () => {
  const token = localStorage.getItem("token");

  try {
    await fetch("http://localhost:8000/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
  }

  // Clear local storage and redirect to login
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login";
};


