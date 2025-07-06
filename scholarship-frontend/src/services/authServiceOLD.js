///src/services/authService.js
const API_BASE_URL = "https://localhost:7230/api";

export async function login(personId, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ PersonId: personId, Password: password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Login failed");
    }

    const data = await response.json();
    // הקפד לשמור במפתחות camelCase כפי שמוחזר מהשרת
    localStorage.setItem("token", data.token);
    localStorage.setItem("currentUser", JSON.stringify(data.person));
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
}



