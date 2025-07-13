import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface MessageReactionsProps {
  reactions: { [userId: string]: string };
  currentUserId: string;
  onReactionPress: (emoji: string) => void;
}

const MessageReactions = ({ reactions, currentUserId, onReactionPress }: MessageReactionsProps) => {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  // Group reactions by emoji
  const reactionCounts: { [emoji: string]: string[] } = {};
  Object.entries(reactions).forEach(([userId, emoji]) => {
    if (emoji && emoji !== 'null') {
      if (!reactionCounts[emoji]) {
        reactionCounts[emoji] = [];
      }
      reactionCounts[emoji].push(userId);
    }
  });

  return (
    <View className="flex-row flex-wrap mt-2">
      {Object.entries(reactionCounts).map(([emoji, userIds]) => (
        <TouchableOpacity
          key={emoji}
          onPress={() => onReactionPress(emoji)}
          className={`px-2 py-1 rounded-full mr-1 mb-1 ${
            userIds.includes(currentUserId) ? 'bg-blue-100' : 'bg-gray-100'
          }`}
        >
          <Text className="text-sm">
            {emoji} {userIds.length}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default MessageReactions; 