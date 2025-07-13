import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { firebaseApp } from './firebaseConfig';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

const db = getFirestore(firebaseApp);

const TestFirestore = () => {
  useEffect(() => {
    // Add a test message
    const addTestMessage = async () => {
      try {
        await addDoc(collection(db, 'messages'), {
          text: 'Hello from Expo!',
          createdAt: new Date(),
        });
        console.log('✅ Test message added to Firestore!');
      } catch (err) {
        console.error('❌ Error adding test message:', err);
      }
    };

    // Read all messages
    const readMessages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'messages'));
        querySnapshot.forEach((doc) => {
          console.log('📄', doc.id, '=>', doc.data());
        });
      } catch (err) {
        console.error('❌ Error reading messages:', err);
      }
    };

    addTestMessage();
    readMessages();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Testing Firestore... Check your Firebase Console and Metro logs.</Text>
    </View>
  );
};

export default TestFirestore; 