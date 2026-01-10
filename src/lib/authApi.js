// lib/authApi.js - Authentication API functions
const API_URL = "http://127.0.0.1:8000/api";

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", token);
  }
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  }
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

/**
 * Store user data
 */
export const setStoredUser = (user) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  try {
    // Check if there's a file upload (profile_picture)
    const hasFile = userData.profile_picture instanceof File;

    let body;
    let headers = {};

    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (
          userData[key] !== null &&
          userData[key] !== undefined &&
          userData[key] !== ""
        ) {
          formData.append(key, userData[key]);
        }
      });
      body = formData;
      // Don't set Content-Type header - let browser set it with boundary
    } else {
      // Use JSON for non-file data
      headers["Content-Type"] = "application/json";
      // Remove empty profile_picture field
      const cleanData = { ...userData };
      delete cleanData.profile_picture;
      body = JSON.stringify(cleanData);
    }

    const response = await fetch(`${API_URL}/auth/register/`, {
      method: "POST",
      headers: headers,
      body: body,
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    // Store token and user data
    if (data.token) {
      setAuthToken(data.token);
      setStoredUser({ ...data.user, author: data.author });
    }

    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      // Extract error message from response
      let errorMessage = "Login failed";
      if (data.non_field_errors) {
        errorMessage = data.non_field_errors[0];
      } else if (data.error) {
        errorMessage = data.error;
      } else if (typeof data === "object") {
        const firstError = Object.values(data)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      throw new Error(errorMessage);
    }

    // Store token and user data
    if (data.token) {
      setAuthToken(data.token);
      setStoredUser({ ...data.user, author: data.author });
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    const token = getAuthToken();

    if (token) {
      await fetch(`${API_URL}/auth/logout/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
    }

    // Clear local storage
    removeAuthToken();

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    // Clear local storage even if request fails
    removeAuthToken();
    throw error;
  }
};

/**
 * Get current user data
 */
export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_URL}/auth/user/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    setStoredUser(data);
    return data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const checkAuth = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      return { authenticated: false };
    }

    const response = await fetch(`${API_URL}/auth/check/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      removeAuthToken();
      return { authenticated: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Check auth error:", error);
    return { authenticated: false };
  }
};

/**
 * Update author profile
 */
export const updateAuthorProfile = async (profileData) => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();

    // Append all fields to FormData
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== null && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });

    const response = await fetch(`${API_URL}/auth/profile/`, {
      method: "PATCH",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Profile update failed");
    }

    // Update stored user data
    if (data.user) {
      setStoredUser(data.user);
    }

    return data;
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
};
