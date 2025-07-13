import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import SignOutButton from "@/components/SignOutButton";
import UserProfileScreen from "@/components/UserProfileScreen";
import { getOrCreateConversation, getConversations } from "@/utils/chatFirestore";
import ChatScreen from "@/components/ChatScreen";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { useProfile } from "@/hooks/useProfile";
import { useUserSync } from "@/hooks/useUserSync";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

const ProfileScreens = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const insets = useSafeAreaInsets();
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [chatModal, setChatModal] = useState<{ visible: boolean; conversation: any | null }>({ visible: false, conversation: null });

  const {
    posts: userPosts,
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(currentUser?.username);

  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
  } = useProfile();

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

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text className="text-gray-500 text-sm">{userPosts.length} Posts</Text>
        </View>
        <SignOutButton />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchProfile();
              refetchPosts();
            }}
            tintColor="#1DA1F2"
          />
        }
      >
        <Image
          source={{
            uri:
              currentUser.bannerImage ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />

        <View className="px-4 pb-4 border-b border-gray-100">
          <View className="flex-row justify-between items-end -mt-16 mb-4">
            <Image
              source={{ uri: currentUser.profilePicture }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            <TouchableOpacity
              className="border border-gray-300 px-6 py-2 rounded-full"
              onPress={openEditModal}
            >
              <Text className="font-semibold text-gray-900">Edit profile</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl font-bold text-gray-900 mr-1">
                {currentUser.firstName} {currentUser.lastName}
              </Text>
              <Feather name="check-circle" size={20} color="#1DA1F2" />
            </View>
            <Text className="text-gray-500 mb-2">@{currentUser.username}</Text>
            <Text className="text-gray-900 mb-3">{currentUser.bio}</Text>

            <View className="flex-row items-center mb-2">
              <Feather name="map-pin" size={16} color="#657786" />
              <Text className="text-gray-500 ml-2">{currentUser.location}</Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Feather name="calendar" size={16} color="#657786" />
              <Text className="text-gray-500 ml-2">
                Joined {format(new Date(currentUser.createdAt), "MMMM yyyy")}
              </Text>
            </View>

            <View className="flex-row">
              <TouchableOpacity className="mr-6">
                <Text className="text-gray-900">
                  <Text className="font-bold">{currentUser.following?.length}</Text>
                  <Text className="text-gray-500"> Following</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-900">
                  <Text className="font-bold">{currentUser.followers?.length}</Text>
                  <Text className="text-gray-500"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <PostsList username={currentUser?.username} onUserPress={handleUserPress} />
      </ScrollView>

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        formData={formData}
        saveProfile={saveProfile}
        updateFormField={updateFormField}
        isUpdating={isUpdating}
      />

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

export default ProfileScreens;