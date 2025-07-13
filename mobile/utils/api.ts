import axios from "axios";
import type { AxiosInstance } from "axios"; 

import { useAuth } from "@clerk/clerk-expo";

// Use environment variable or fallback to computer's IP for development
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.3:5001/api";

// this will basically create an authenticated api, pass the token into our headers
export const createApiClient = (getToken: () => Promise<string | null>): AxiosInstance => {
  const api = axios.create({ 
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
    }
  });

  api.interceptors.request.use(async (config) => {
    const token = await getToken();
    console.log("🔐 Clerk Token:", token);
    console.log("🌐 Making request to:", config.method?.toUpperCase(), config.url);
    console.log("📡 Full URL:", config.baseURL + config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Authorization header set");
    } else {
      console.log("❌ No token available");
    }
    return config;
  });

  // Add response interceptor for better error handling
  api.interceptors.response.use(
    (response) => {
      console.log("✅ Response received:", response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error("❌ API Error:", error.message);
      console.error("📊 Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      });
      
      if (error.code === 'ECONNABORTED') {
        console.error("⏰ Request timeout - server might be down or network issue");
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();
  return createApiClient(getToken);
};

export const userApi = {
  syncUser: (api: AxiosInstance) => api.post("/users/sync"),
  getCurrentUser: (api: AxiosInstance) => api.get("/users/me"),
  updateProfile: (api: AxiosInstance, data: any) => api.put("/users/profile", data),
  getUserProfile: (api: AxiosInstance, username: string) => api.get(`/users/profile/${username}`),
  searchUsers: (api: AxiosInstance, query: string) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
  getUserById: (api: AxiosInstance, userId: string) => api.get(`/users/${userId}`),
};

export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) =>
    api.post("/posts", data),
  getPosts: (api: AxiosInstance) => api.get("/posts"),
  getUserPosts: (api: AxiosInstance, username: string) => api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) => api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
};

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),
};

export const followApi = {
  followUser: (api: AxiosInstance, targetUserId: string) => 
    api.post(`/users/follow/${targetUserId}`),
};