import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectReaction: (emoji: string) => void;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const ReactionPicker = ({ visible, onClose, onSelectReaction }: ReactionPickerProps) => {
  const handleReactionSelect = (emoji: string) => {
    onSelectReaction(emoji);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-2xl p-4 shadow-lg">
            <Text className="text-center text-gray-600 mb-3 font-medium">React with</Text>
            <View className="flex-row flex-wrap justify-center">
              {REACTIONS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleReactionSelect(emoji)}
                  className="w-12 h-12 items-center justify-center m-1 rounded-full bg-gray-100"
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ReactionPicker; 