import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useCurrentUser } from './useCurrentUser';
import { 
  registerForPushNotificationsAsync, 
  storeDeviceToken
} from '../utils/notifications';

export const useNotifications = () => {
  const { currentUser } = useCurrentUser();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token && currentUser?._id) {
        storeDeviceToken(currentUser._id, token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      console.log('Notification tapped:', response);
      // Handle navigation to conversation if needed
      const data = response.notification.request.content.data;
      if (data?.conversationId) {
        // Navigate to conversation
        console.log('Navigate to conversation:', data.conversationId);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [currentUser]);

  return { expoPushToken, notification };
};