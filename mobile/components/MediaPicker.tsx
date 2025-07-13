import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';

interface MediaPickerProps {
  visible: boolean;
  onClose: () => void;
  onMediaSelect: (uri: string, type: 'image' | 'video') => void;
}

const MediaPicker = ({ visible, onClose, onMediaSelect }: MediaPickerProps) => {
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your media library');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onMediaSelect(result.assets[0].uri, 'image');
    }
  };

  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onMediaSelect(result.assets[0].uri, 'video');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
            <Text className="text-center text-lg font-semibold mb-6">Choose Media</Text>
            <View className="flex-row justify-around">
              <TouchableOpacity
                onPress={pickImage}
                className="items-center"
              >
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
                  <Text className="text-3xl">📷</Text>
                </View>
                <Text className="text-sm text-gray-600">Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={pickVideo}
                className="items-center"
              >
                <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-3">
                  <Text className="text-3xl">🎥</Text>
                </View>
                <Text className="text-sm text-gray-600">Video</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default MediaPicker; 