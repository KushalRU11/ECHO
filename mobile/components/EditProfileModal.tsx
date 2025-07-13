import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  formData: {
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
    profilePicture?: string;
    bannerImage?: string;
  };
  saveProfile: () => void;
  updateFormField: (field: string, value: string) => void;
  isUpdating: boolean;
}

const EditProfileModal = ({
  formData,
  isUpdating,
  isVisible,
  onClose,
  saveProfile,
  updateFormField,
}: EditProfileModalProps) => {
  const handleSave = () => {
    saveProfile();
    onClose();
  };

  const pickImage = async (field: "profilePicture" | "bannerImage") => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: field === "bannerImage" ? [3, 1] : [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      updateFormField(field, result.assets[0].uri);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={onClose}>
          <Text className="text-blue-500 text-lg">Cancel</Text>
        </TouchableOpacity>

        <Text className="text-lg font-semibold">Edit Profile</Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isUpdating}
          className={`${isUpdating ? "opacity-50" : ""}`}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#1DA1F2" />
          ) : (
            <Text className="text-blue-500 text-lg font-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Banner Image Picker */}
        <View className="mb-4 items-center">
          <TouchableOpacity onPress={() => pickImage("bannerImage")}
            style={{ width: "100%", height: 100, backgroundColor: "#f3f4f6", borderRadius: 12, overflow: "hidden", justifyContent: "center", alignItems: "center" }}>
            {formData.bannerImage ? (
              <Image source={{ uri: formData.bannerImage }} style={{ width: "100%", height: 100, resizeMode: "cover" }} />
            ) : (
              <Text className="text-gray-400">Pick Banner Image</Text>
            )}
          </TouchableOpacity>
        </View>
        {/* Profile Image Picker */}
        <View className="mb-4 items-center">
          <TouchableOpacity onPress={() => pickImage("profilePicture")}
            style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center", overflow: "hidden", borderWidth: 2, borderColor: "#fff", marginTop: -48 }}>
            {formData.profilePicture ? (
              <Image source={{ uri: formData.profilePicture }} style={{ width: 96, height: 96, borderRadius: 48 }} />
            ) : (
              <Text className="text-gray-400">Pick Profile Image</Text>
            )}
          </TouchableOpacity>
        </View>
        <View className="space-y-4">
          <View>
            <Text className="text-gray-500 text-sm mb-2">First Name</Text>
            <TextInput
              className="border border-gray-200 rounded-lg p-3 text-base"
              value={formData.firstName}
              onChangeText={(text) => updateFormField("firstName", text)}
              placeholder="Your first name"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Last Name</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-3 text-base"
              value={formData.lastName}
              onChangeText={(text) => updateFormField("lastName", text)}
              placeholder="Your last name"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Bio</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-3 text-base"
              value={formData.bio}
              onChangeText={(text) => updateFormField("bio", text)}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-sm mb-2">Location</Text>
            <TextInput
              className="border border-gray-200 rounded-lg px-3 py-3 text-base"
              value={formData.location}
              onChangeText={(text) => updateFormField("location", text)}
              placeholder="Where are you located?"
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default EditProfileModal;