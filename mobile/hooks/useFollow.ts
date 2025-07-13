import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, followApi } from "../utils/api";
import { useCurrentUser } from "./useCurrentUser";

export const useFollow = () => {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();

  const followMutation = useMutation({
    mutationFn: (targetUserId: string) => followApi.followUser(api, targetUserId),
    onSuccess: () => {
      // Invalidate user-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const checkIsFollowing = (targetUserId: string) => {
    if (!currentUser?.following) return false;
    return currentUser.following.includes(targetUserId);
  };

  const toggleFollow = (targetUserId: string) => {
    followMutation.mutate(targetUserId);
  };

  return {
    toggleFollow,
    checkIsFollowing,
    isFollowing: followMutation.isPending,
  };
}; 