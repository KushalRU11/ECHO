import PostComposer from "@/components/PostComposer";
import PostsList from "@/components/PostsList";
import SignOutButton from "@/components/SignOutButton";
import UserProfileScreen from "@/components/UserProfileScreen";
import { usePosts } from "@/hooks/usePosts";
import { useUserSync } from "@/hooks/useUserSync";
import { getOrCreateConversation, getConversations } from "@/utils/chatFirestore";
import ChatScreen from "@/components/ChatScreen";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Image, RefreshControl, ScrollView, Text, View, Modal, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

const HomeScreen = () => {
  const [isRefetching, setIsRefetching] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [chatModal, setChatModal] = useState<{ visible: boolean; conversation: any | null }>({ visible: false, conversation: null });
  const { refetch: refetchPosts } = usePosts();
  const { currentUser } = useCurrentUser();
  const { isSyncing, syncError } = useUserSync();

  const handlePullToRefresh = async () => {
    setIsRefetching(true);

    await refetchPosts();
    setIsRefetching(false);
  };

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
      <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 28, height: 28 }}
        />
        <Text className="text-xl font-bold text-gray-900">Home</Text>
        <SignOutButton />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePullToRefresh}
            tintColor={"#1DA1F2"}
          />
        }
      >
        <PostComposer />
        <PostsList onUserPress={handleUserPress} />
      </ScrollView>

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
export default HomeScreen;