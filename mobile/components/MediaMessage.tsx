import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';

interface MediaMessageProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
}

const MediaMessage = ({ mediaUrl, mediaType, caption }: MediaMessageProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const renderMedia = () => {
    if (mediaType === 'image') {
      return (
        <Image
          source={{ uri: mediaUrl }}
          style={{ width: '100%', height: 200, borderRadius: 8 }}
          contentFit="cover"
        />
      );
    } else {
      return (
        <Video
          source={{ uri: mediaUrl }}
          style={{ width: '100%', height: 200, borderRadius: 8 }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
        />
      );
    }
  };

  const renderFullScreen = () => {
    return (
      <Modal
        visible={isFullScreen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFullScreen(false)}
      >
        <View className="flex-1 bg-black">
          <TouchableOpacity
            className="absolute top-12 right-4 z-10 bg-black bg-opacity-50 rounded-full p-2"
            onPress={() => setIsFullScreen(false)}
          >
            <Text className="text-white text-xl">✕</Text>
          </TouchableOpacity>
          
          <View className="flex-1 justify-center items-center">
            {mediaType === 'image' ? (
              <Image
                source={{ uri: mediaUrl }}
                style={{ width: screenWidth, height: screenHeight * 0.8 }}
                contentFit="contain"
              />
            ) : (
              <Video
                source={{ uri: mediaUrl }}
                style={{ width: screenWidth, height: screenHeight * 0.8 }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={true}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setIsFullScreen(true)}>
        {renderMedia()}
      </TouchableOpacity>
      {caption && (
        <Text className="text-gray-900 mt-2">{caption}</Text>
      )}
      {renderFullScreen()}
    </View>
  );
};

export default MediaMessage; 