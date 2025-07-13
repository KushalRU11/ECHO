import { useUserProfile } from "@/hooks/useUserProfile";
import { useFollow } from "@/hooks/useFollow";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import PostsList from "@/components/PostsList";
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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

interface UserProfileScreenProps {
  username: string;
  onBack: () => void;
  onStartChat?: (userId: string) => void;
}

const UserProfileScreen = ({ username, onBack, onStartChat }: UserProfileScreenProps) => {
  const { userProfile, isLoading, refetch, isRefetching } = useUserProfile(username);
  const { currentUser } = useCurrentUser();
  const { toggleFollow, checkIsFollowing, isFollowing } = useFollow();
  const insets = useSafeAreaInsets();

  const isOwnProfile = currentUser?.username === username;
  const isFollowingUser = checkIsFollowing(userProfile?._id || "");

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={onBack} className="mr-3">
            <Feather name="arrow-left" size={24} color="#1DA1F2" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Profile</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleFollow = () => {
    if (userProfile._id) {
      toggleFollow(userProfile._id);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onBack} className="mr-3">
            <Feather name="arrow-left" size={24} color="#1DA1F2" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-gray-900">
              {userProfile.firstName} {userProfile.lastName}
            </Text>
            <Text className="text-gray-500 text-sm">@{userProfile.username}</Text>
          </View>
        </View>
        {!isOwnProfile && (
          <TouchableOpacity
            onPress={() => onStartChat && onStartChat(userProfile._id)}
            className="ml-2 px-4 py-2 rounded-full bg-green-500"
          >
            <Text className="text-white font-semibold">Message</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#1DA1F2"
          />
        }
      >
        <Image
          source={{
            uri:
              userProfile.bannerImage ||
              "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
          }}
          className="w-full h-48"
          resizeMode="cover"
        />

        <View className="px-4 pb-4 border-b border-gray-100">
          <View className="flex-row justify-between items-end -mt-16 mb-4">
            <Image
              source={{ uri: userProfile.profilePicture }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            {!isOwnProfile && (
              <TouchableOpacity
                onPress={handleFollow}
                disabled={isFollowing}
                className={`px-6 py-2 rounded-full ${
                  isFollowingUser ? "bg-gray-200" : "bg-blue-500"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    isFollowingUser ? "text-gray-600" : "text-white"
                  }`}
                >
                  {isFollowing ? "..." : isFollowingUser ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl font-bold text-gray-900 mr-1">
                {userProfile.firstName} {userProfile.lastName}
              </Text>
              <Feather name="check-circle" size={20} color="#1DA1F2" />
            </View>
            <Text className="text-gray-500 mb-2">@{userProfile.username}</Text>
            <Text className="text-gray-900 mb-3">{userProfile.bio}</Text>

            <View className="flex-row items-center mb-2">
              <Feather name="map-pin" size={16} color="#657786" />
              <Text className="text-gray-500 ml-2">{userProfile.location}</Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Feather name="calendar" size={16} color="#657786" />
              <Text className="text-gray-500 ml-2">
                Joined {format(new Date(userProfile.createdAt), "MMMM yyyy")}
              </Text>
            </View>

            <View className="flex-row">
              <TouchableOpacity className="mr-6">
                <Text className="text-gray-900">
                  <Text className="font-bold">{userProfile.following?.length || 0}</Text>
                  <Text className="text-gray-500"> Following</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-900">
                  <Text className="font-bold">{userProfile.followers?.length || 0}</Text>
                  <Text className="text-gray-500"> Followers</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <PostsList username={userProfile.username} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfileScreen; 