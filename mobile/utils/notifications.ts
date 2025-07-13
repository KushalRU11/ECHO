import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { firebaseApp } from '../firebaseConfig';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const db = getFirestore(firebaseApp);

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // You'll need to replace this with your actual Expo project ID
    })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

// Store device token for a user
export const storeDeviceToken = async (userId: string, token: string) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      deviceToken: token,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error storing device token:', error);
  }
};

// Get device token for a user
export const getDeviceToken = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.data()?.deviceToken;
  } catch (error) {
    console.error('Error getting device token:', error);
    return null;
  }
};

// Send push notification
export const sendPushNotification = async (expoPushToken: string, title: string, body: string, data?: any) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data || {},
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    const result = await response.json();
    console.log('Push notification result:', result);
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

// Handle notification received while app is running
export const addNotificationReceivedListener = (callback: (notification: Notifications.Notification) => void) => {
  return Notifications.addNotificationReceivedListener(callback);
};

// Handle notification tapped
export const addNotificationResponseReceivedListener = (callback: (response: Notifications.NotificationResponse) => void) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
}; 