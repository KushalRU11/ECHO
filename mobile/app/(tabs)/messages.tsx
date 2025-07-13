import React, { useState } from 'react';
import { View, Modal } from 'react-native';
import ConversationsList from '@/components/ConversationsList';
import ChatScreen from '@/components/ChatScreen';

const MessagesScreen = () => {
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  return (
    <View className="flex-1 bg-white">
      <ConversationsList onSelectConversation={handleSelectConversation} />
      <Modal
        visible={!!selectedConversation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseChat}
      >
        {selectedConversation && (
          <ChatScreen conversation={selectedConversation} onBack={handleCloseChat} />
        )}
      </Modal>
    </View>
  );
};

export default MessagesScreen;