import { useState, useEffect } from "react";
import { useApiClient, userApi } from "../utils/api";
import { useQuery } from "@tanstack/react-query";

export const useUserSearch = (query: string) => {
  const api = useApiClient();
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userSearch", debouncedQuery],
    queryFn: () => userApi.searchUsers(api, debouncedQuery),
    enabled: !!debouncedQuery,
    select: (response) => response.data.users,
  });

  return { users: data || [], isLoading, error, refetch };
}; 