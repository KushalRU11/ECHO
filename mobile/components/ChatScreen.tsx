import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { listenForMessages, sendMessage, setTypingStatus, listenForTyping, deleteMessage, markMessagesAsRead, listenForReadStatus, addReaction, removeReaction, sendMediaMessage } from '@/utils/chatFirestore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import ReactionPicker from './ReactionPicker';
import MessageReactions from './MessageReactions';
import MediaPicker from './MediaPicker';
import MediaMessage from './MediaMessage';

interface ChatScreenProps {
  conversation: any;
  onBack: () => void;
}

const ChatScreen = ({ conversation, onBack }: ChatScreenProps) => {
  const { currentUser } = useCurrentUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [readStatus, setReadStatus] = useState<{ [key: string]: any }>({});
  const [reactionPickerVisible, setReactionPickerVisible] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Listen for messages
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = listenForMessages(conversation.id, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsubscribe;
  }, [conversation]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (!conversation?.id || !currentUser?._id) return;
    markMessagesAsRead(conversation.id, currentUser._id);
  }, [conversation, currentUser]);

  // Listen for typing status
  useEffect(() => {
    if (!conversation?.id || !currentUser?._id) return;
    const otherUserId = conversation.participants.find((id: string) => id !== currentUser._id);
    const unsubscribe = listenForTyping(conversation.id, (typingStatus) => {
      setIsOtherTyping(!!typingStatus[otherUserId]);
    });
    return unsubscribe;
  }, [conversation, currentUser]);

  // Listen for read status changes
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = listenForReadStatus(conversation.id, (status) => {
      setReadStatus(status);
    });
    return unsubscribe;
  }, [conversation]);

  // Handle typing status
  const handleInputChange = (text: string) => {
    setInput(text);
    if (!conversation?.id || !currentUser?._id) return;
    setTypingStatus(conversation.id, currentUser._id, true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTypingStatus(conversation.id, currentUser._id, false);
    }, 1500);
  };

  const handleSend = async () => {
    if (!input.trim() || !currentUser?._id) return;
    await sendMessage(conversation.id, currentUser._id, input.trim());
    setInput('');
    if (conversation?.id && currentUser?._id) {
      setTypingStatus(conversation.id, currentUser._id, false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(conversation.id, messageId);
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const handleReactionSelect = async (emoji: string) => {
    if (!selectedMessageId || !currentUser?._id) return;
    
    try {
      const message = messages.find(m => m.id === selectedMessageId);
      const hasReacted = message?.reactions?.[currentUser._id] === emoji;
      
      if (hasReacted) {
        await removeReaction(conversation.id, selectedMessageId, currentUser._id);
      } else {
        await addReaction(conversation.id, selectedMessageId, currentUser._id, emoji);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleReactionPress = (emoji: string) => {
    handleReactionSelect(emoji);
  };

  const showReactionPicker = (messageId: string) => {
    setSelectedMessageId(messageId);
    setReactionPickerVisible(true);
  };

  const handleMediaSelect = (uri: string, type: 'image' | 'video') => {
    setSelectedMedia({ uri, type });
    setShowMediaPicker(false);
  };

  const handleSendMedia = async () => {
    if (!selectedMedia || !currentUser?._id) return;
    
    try {
      await sendMediaMessage(conversation.id, currentUser._id, selectedMedia.uri, selectedMedia.type, input.trim() || undefined);
      setSelectedMedia(null);
      setInput('');
    } catch (error) {
      console.error('Error sending media message:', error);
      Alert.alert('Error', 'Failed to send media message');
    }
  };

  const cancelMediaSelection = () => {
    setSelectedMedia(null);
    setInput('');
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isOwnMessage = item.senderId === currentUser._id;
    const isLastMessage = messages[messages.length - 1]?.id === item.id;
    const otherUserId = conversation.participants.find((id: string) => id !== currentUser._id);
    const isRead = readStatus[otherUserId] && item.createdAt && 
                   readStatus[otherUserId].toDate && item.createdAt.toDate &&
                   readStatus[otherUserId].toDate() > item.createdAt.toDate();
    
    return (
      <TouchableOpacity
        onLongPress={() => handleDeleteMessage(item.id)}
        onPress={() => showReactionPicker(item.id)}
        activeOpacity={0.8}
        className={`px-4 py-2 my-1 rounded-lg max-w-[80%] ${
          isOwnMessage ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
        }`}
      >
        {item.mediaUrl ? (
          <MediaMessage
            mediaUrl={item.mediaUrl}
            mediaType={item.mediaType}
            caption={item.caption}
          />
        ) : (
          <Text className="text-gray-900">{item.text}</Text>
        )}
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-xs text-gray-500">
            {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString() : ''}
          </Text>
          {isOwnMessage && isLastMessage && (
            <Text className={`text-xs ml-2 ${isRead ? 'text-blue-500' : 'text-gray-400'}`}>
              {isRead ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
        <MessageReactions
          reactions={item.reactions || {}}
          currentUserId={currentUser._id}
          onReactionPress={handleReactionPress}
        />
        {isOwnMessage && (
          <Text className="text-xs text-gray-400 mt-1">Long press to delete • Tap to react</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={onBack} className="mr-3">
          <Text className="text-xl text-blue-500">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Chat</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 12, flexGrow: 1, justifyContent: 'flex-end' }}
      />
      {isOtherTyping && (
        <View className="px-4 pb-1">
          <Text className="text-blue-500 text-sm font-medium">User is typing...</Text>
        </View>
      )}
      
      {selectedMedia && (
        <View className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <View className="bg-white rounded-lg p-3">
            <Text className="text-sm text-gray-600 mb-2">
              {selectedMedia.type === 'image' ? '📷 Image' : '🎥 Video'} selected
            </Text>
            <TextInput
              className="bg-gray-100 rounded-lg px-3 py-2 mb-2"
              placeholder="Add a caption (optional)..."
              value={input}
              onChangeText={setInput}
            />
            <View className="flex-row justify-end">
              <TouchableOpacity onPress={cancelMediaSelection} className="mr-2">
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendMedia} className="bg-blue-500 px-4 py-2 rounded-lg">
                <Text className="text-white font-semibold">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      <View className="flex-row items-center px-4 py-2 border-t border-gray-100">
        <TouchableOpacity
          onPress={() => setShowMediaPicker(true)}
          className="mr-2 p-2"
        >
          <Text className="text-2xl">📎</Text>
        </TouchableOpacity>
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
          placeholder="Type a message..."
          value={input}
          onChangeText={handleInputChange}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={handleSend} className="bg-blue-500 rounded-full px-4 py-2">
          <Text className="text-white font-semibold">Send</Text>
        </TouchableOpacity>
      </View>
      
      <ReactionPicker
        visible={reactionPickerVisible}
        onClose={() => setReactionPickerVisible(false)}
        onSelectReaction={handleReactionSelect}
      />
      
      <MediaPicker
        visible={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onMediaSelect={handleMediaSelect}
      />
    </KeyboardAvoidingView>
  );
};

export default ChatScreen; 