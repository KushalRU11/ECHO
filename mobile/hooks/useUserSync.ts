import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-expo";
import { useApiClient, userApi } from "../utils/api";
import { Alert } from "react-native";

export const useUserSync = () => {
  const { isSignedIn, getToken } = useAuth();
  const api = useApiClient();

  const syncUserMutation = useMutation({
    mutationFn: async () => {
      console.log("🔄 Starting user sync...");
      const token = await getToken();
      console.log("🔐 Sync token available:", !!token);
      
      const response = await userApi.syncUser(api);
      console.log("✅ User sync successful");
      return response;
    },
    onSuccess: (response: any) => {
      console.log("User synced successfully:", response.data.user);
    },
    onError: (error: any) => {
      console.error("User sync failed:", error);
      console.error("Sync error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Provide user-friendly error messages
      if (error.code === 'ECONNABORTED') {
        Alert.alert(
          "Connection Error", 
          "Unable to connect to the server. Please check your internet connection and try again.",
          [{ text: "OK" }]
        );
      } else if (error.response?.status === 401) {
        console.log("🔐 Token might be expired, trying to refresh...");
        Alert.alert(
          "Authentication Error", 
          "Please sign in again to continue.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Sync Error", 
          "Failed to sync user data. Please try again later.",
          [{ text: "OK" }]
        );
      }
    },
  });

  // auto-sync user when signed in
  useEffect(() => {
    console.log("🔍 useUserSync effect - isSignedIn:", isSignedIn);
    
    // if user is signed in and user is not synced yet, sync user
    if (isSignedIn && !syncUserMutation.data) {
      console.log("🚀 Attempting to sync user...");
      syncUserMutation.mutate();
    }
  }, [isSignedIn]);

  return {
    isSyncing: syncUserMutation.isPending,
    syncError: syncUserMutation.error,
    isSynced: !!syncUserMutation.data,
  };
};