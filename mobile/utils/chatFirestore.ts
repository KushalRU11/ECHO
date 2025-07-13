import { firebaseApp } from '../firebaseConfig';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  serverTimestamp,
  updateDoc,
  onSnapshot as firestoreOnSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { getDeviceToken, sendPushNotification } from './notifications';

const db = getFirestore(firebaseApp);

// Create or get a conversation between two users
export const getOrCreateConversation = async (userId1: string, userId2: string) => {
  const participants = [userId1, userId2].sort();
  const q = query(
    collection(db, 'conversations'),
    where('participants', '==', participants)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  // Create new conversation
  const docRef = await addDoc(collection(db, 'conversations'), {
    participants,
    lastMessage: '',
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Send a message in a conversation
export const sendMessage = async (conversationId: string, senderId: string, text: string) => {
  const messageRef = collection(db, 'conversations', conversationId, 'messages');
  await addDoc(messageRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  // Update conversation's last message
  await setDoc(
    doc(db, 'conversations', conversationId),
    {
      lastMessage: text,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Send push notification to other participants
  await sendNotificationToParticipants(conversationId, senderId, text, 'text');
};

// Listen for messages in a conversation (real-time)
export const listenForMessages = (conversationId: string, callback: (messages: any[]) => void) => {
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

// Set typing status for a user in a conversation
export const setTypingStatus = async (conversationId: string, userId: string, isTyping: boolean) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    [`typing.${userId}`]: isTyping,
  });
};

// Listen for typing status changes in a conversation
export const listenForTyping = (conversationId: string, callback: (typingStatus: { [key: string]: boolean }) => void) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  return firestoreOnSnapshot(conversationRef, (docSnap) => {
    const data = docSnap.data();
    callback(data?.typing || {});
  });
};

// Get all conversations for a user
export const getConversations = async (userId: string) => {
  console.log("Fetching conversations for userId:", userId); // Debug log
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    console.log("Conversations found:", snapshot.docs.length); // Debug log
    snapshot.docs.forEach(doc => {
      console.log("Doc ID:", doc.id, "Data:", doc.data());
    });
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

// Delete a message from a conversation
export const deleteMessage = async (conversationId: string, messageId: string) => {
  const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  await deleteDoc(messageRef);
};

// Mark messages as read in a conversation
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  await updateDoc(conversationRef, {
    [`readBy.${userId}`]: serverTimestamp(),
  });
};

// Get read status for a conversation
export const getReadStatus = async (conversationId: string) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  const docSnap = await getDoc(conversationRef);
  return docSnap.data()?.readBy || {};
};

// Listen for read status changes in a conversation
export const listenForReadStatus = (conversationId: string, callback: (readStatus: { [key: string]: any }) => void) => {
  const conversationRef = doc(db, 'conversations', conversationId);
  return firestoreOnSnapshot(conversationRef, (docSnap) => {
    const data = docSnap.data();
    callback(data?.readBy || {});
  });
};

// Add a reaction to a message
export const addReaction = async (conversationId: string, messageId: string, userId: string, emoji: string) => {
  const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  await updateDoc(messageRef, {
    [`reactions.${userId}`]: emoji,
  });
};

// Remove a reaction from a message
export const removeReaction = async (conversationId: string, messageId: string, userId: string) => {
  const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
  await updateDoc(messageRef, {
    [`reactions.${userId}`]: null,
  });
};

// Send a media message in a conversation
export const sendMediaMessage = async (conversationId: string, senderId: string, mediaUrl: string, mediaType: 'image' | 'video', caption?: string) => {
  const messageRef = collection(db, 'conversations', conversationId, 'messages');
  const messageData: any = {
    senderId,
    mediaUrl,
    mediaType,
    createdAt: serverTimestamp(),
  };
  
  // Only add caption if it's not empty
  if (caption && caption.trim()) {
    messageData.caption = caption.trim();
  }
  
  await addDoc(messageRef, messageData);
  
  // Update conversation's last message
  const lastMessageText = (caption && caption.trim()) || (mediaType === 'image' ? '📷 Image' : '🎥 Video');
  await setDoc(
    doc(db, 'conversations', conversationId),
    {
      lastMessage: lastMessageText,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Send push notification to other participants
  await sendNotificationToParticipants(conversationId, senderId, lastMessageText, mediaType);
};

// Send notification to conversation participants
const sendNotificationToParticipants = async (conversationId: string, senderId: string, messageText: string, messageType: 'text' | 'image' | 'video') => {
  try {
    // Get conversation data
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    const conversationData = conversationSnap.data();
    
    if (!conversationData?.participants) return;

    // Get sender info
    const senderRef = doc(db, 'users', senderId);
    const senderSnap = await getDoc(senderRef);
    const senderData = senderSnap.data();
    const senderName = senderData?.firstName || senderData?.username || 'Someone';

    // Send notification to other participants
    for (const participantId of conversationData.participants) {
      if (participantId !== senderId) {
        const deviceToken = await getDeviceToken(participantId);
        if (deviceToken) {
          const title = senderName;
          const body = messageType === 'text' ? messageText : `${messageType === 'image' ? '📷' : '🎥'} ${messageText}`;
          
          await sendPushNotification(deviceToken, title, body, {
            conversationId,
            messageType,
            senderId,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error sending notification to participants:', error);
  }
}; 