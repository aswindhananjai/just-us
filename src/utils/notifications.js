import { messaging, getToken, onMessage } from './firebase';
import { supabase } from './supabase';
import { getCurrentUser } from './auth';

// VAPID key - You'll need to generate this in Firebase Console
// Go to Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'YOUR_VAPID_KEY';

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission() {
  if (!messaging) {
    console.warn('Messaging not supported in this browser');
    return null;
  }

  try {
    // Check if notification permission is already granted
    if (Notification.permission === 'granted') {
      return await getFCMToken();
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted');
      return await getFCMToken();
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

/**
 * Get FCM token and save it to Supabase
 */
async function getFCMToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY
    });

    if (token) {
      console.log('FCM Token obtained:', token);
      await saveFCMToken(token);
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Save FCM token to user's record in Supabase
 */
async function saveFCMToken(token) {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const { error } = await supabase
      .from('users')
      .update({ fcm_token: token })
      .eq('name', currentUser);

    if (error) {
      console.error('Error saving FCM token:', error);
    } else {
      console.log('FCM token saved successfully');
    }
  } catch (error) {
    console.error('Error in saveFCMToken:', error);
  }
}

/**
 * Set up foreground message listener
 */
export function setupForegroundMessageListener() {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);

    const notificationTitle = payload.notification?.title || 'New Memory';
    const notificationOptions = {
      body: payload.notification?.body || 'A new memory was added',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'memory-notification',
      requireInteraction: false,
    };

    // Show notification if browser supports it
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationTitle, notificationOptions);
    }
  });
}

/**
 * Send notification to partner when memory is added
 */
export async function sendMemoryAddedNotification(memoryTitle, addedBy) {
  try {
    // Get partner's name
    const partnerName = addedBy === 'Aswin' ? 'Anu' : 'Aswin';

    // Get partner's FCM token
    const { data, error } = await supabase
      .from('users')
      .select('fcm_token')
      .eq('name', partnerName)
      .single();

    if (error || !data?.fcm_token) {
      console.log('Partner FCM token not found');
      return;
    }

    // Get Supabase URL and anon key
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase configuration missing');
      return;
    }

    // Call Supabase Edge Function to send notification
    const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        token: data.fcm_token,
        title: 'New Memory Added',
        body: `${addedBy} added a memory`,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send notification:', errorData);
    } else {
      console.log('Notification sent successfully to', partnerName);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
