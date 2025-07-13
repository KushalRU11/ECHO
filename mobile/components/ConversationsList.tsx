import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { getConversations } from '@/utils/chatFirestore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { userApi, useApiClient } from '@/utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ConversationsListProps {
  onSelectConversation: (conversation: any) => void;
}

const ConversationsList = ({ onSelectConversation }: ConversationsListProps) => {
  const { currentUser } = useCurrentUser();
  const api = useApiClient();
  const [conversations, setConversations] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let didCancel = false;
    let timeout: NodeJS.Timeout;
    const fetchConversations = async () => {
      if (!currentUser?._id) return;
      setLoading(true);
      setError(null);
      timeout = setTimeout(() => {
        if (!didCancel) setError('Loading is taking too long. Please check your connection or try again later.');
      }, 8000); // 8 seconds
      try {
        const data = await getConversations(currentUser._id);
        if (!didCancel) {
          setConversations(data);
          // Fetch user info for all other participants
          const otherUserIds = Array.from(new Set(data.map((c: any) => c.participants.find((id: string) => id !== currentUser._id))));
          const userInfoMap: Record<string, any> = {};
          await Promise.all(
            otherUserIds.map(async (userId) => {
              if (!userId) return;
              try {
                const res = await userApi.getUserById(api, userId);
                userInfoMap[userId] = res.data.user;
              } catch (e) {
                userInfoMap[userId] = { firstName: 'Unknown', lastName: '', username: userId, profilePicture: undefined };
              }
            })
          );
          setUserMap(userInfoMap);
          setLoading(false);
        }
      } catch (err) {
        if (!didCancel) setError('Failed to load conversations.');
      } finally {
        clearTimeout(timeout);
      }
    };
    fetchConversations();
    return () => {
      didCancel = true;
      clearTimeout(timeout);
    };
  }, [currentUser]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500 mb-4">{error}</Text>
        <TouchableOpacity onPress={() => setError(null)} className="bg-blue-500 px-4 py-2 rounded-lg">
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">No conversations yet</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12 }}
        renderItem={({ item }) => {
          // Find the other participant (not the current user)
          const otherUserId = item.participants.find((id: string) => id !== currentUser._id);
          const user = userMap[otherUserId] || {};
          return (
            <TouchableOpacity
              className="flex-row items-center mx-3 my-2 p-3 bg-white rounded-2xl shadow-sm"
              activeOpacity={0.7}
              onPress={() => onSelectConversation(item)}
            >
              <View className="w-14 h-14 rounded-full bg-gray-200 mr-4 items-center justify-center overflow-hidden border-2 border-blue-100 shadow-sm">
                {user.profilePicture ? (
                  <Image source={{ uri: user.profilePicture }} className="w-14 h-14 rounded-full" />
                ) : (
                  <Text className="text-xl font-bold text-gray-700">{user.firstName?.[0]?.toUpperCase() || otherUserId?.[0]?.toUpperCase()}</Text>
                )}
              </View>
              <View className="flex-1 justify-center">
                <Text className="font-bold text-base text-gray-900">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : otherUserId}
                </Text>
                <Text className="text-xs text-gray-500 mb-0.5">@{user.username || otherUserId}</Text>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>{item.lastMessage || 'No messages yet'}</Text>
              </View>
              <Text className="text-xs text-gray-400 ml-2 self-start mt-1">
                {item.updatedAt?.toDate ? item.updatedAt.toDate().toLocaleTimeString() : ''}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default ConversationsList; 