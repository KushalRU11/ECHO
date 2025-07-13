import { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useUserSearch } from "@/hooks/useUserSearch";
import UserProfileScreen from "@/components/UserProfileScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrCreateConversation, getConversations } from "@/utils/chatFirestore";
import ChatScreen from "@/components/ChatScreen";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserSync } from "@/hooks/useUserSync";

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [chatModal, setChatModal] = useState<{ visible: boolean; conversation: any | null }>({ visible: false, conversation: null });
  const { users, isLoading } = useUserSearch(query);
  const { currentUser } = useCurrentUser();
  const { isSyncing, syncError } = useUserSync();

  const handleUserPress = (username: string) => {
    setSelectedUsername(username);
  };

  const handleCloseUserProfile = () => {
    setSelectedUsername(null);
  };

  const handleStartChat = async (otherUserId: string) => {
    if (!currentUser?._id) return;
    const conversationId = await getOrCreateConversation(currentUser._id, otherUserId);
    // Fetch the conversation data
    const conversations = await getConversations(currentUser._id);
    const conversation = conversations.find((c) => c.id === conversationId);
    setChatModal({ visible: true, conversation });
  };
  const handleCloseChat = () => setChatModal({ visible: false, conversation: null });

  if (isSyncing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text className="mt-4 text-gray-500">Setting up your account...</Text>
      </View>
    );
  }
  if (syncError) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 mb-4">Failed to set up your account. Please try again.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Feather name="search" size={20} color="#657786" className="mr-2" />
        <TextInput
          className="flex-1 text-lg"
          placeholder="Search users by name or username"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DA1F2" />
        </View>
      )}
      {!isLoading && query.trim() !== "" && (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 border-b border-gray-50"
              onPress={() => handleUserPress(item.username)}
            >
              <Image
                source={{ uri: item.profilePicture || undefined }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  {item.firstName} {item.lastName}
                </Text>
                <Text className="text-gray-500">@{item.username}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="p-8 items-center">
              <Text className="text-gray-500">No users found</Text>
            </View>
          )}
        />
      )}
      <Modal
        visible={!!selectedUsername}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedUsername && (
          <UserProfileScreen
            username={selectedUsername}
            onBack={handleCloseUserProfile}
            onStartChat={handleStartChat}
          />
        )}
      </Modal>
      <Modal
        visible={chatModal.visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseChat}
      >
        {chatModal.conversation && (
          <ChatScreen conversation={chatModal.conversation} onBack={handleCloseChat} />
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default SearchScreen;