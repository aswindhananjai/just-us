// Supabase Edge Function to send FCM push notifications
// This function is called when a memory is added to send notification to the partner

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY') || '';
const FCM_SEND_URL = 'https://fcm.googleapis.com/fcm/send';

interface NotificationRequest {
  token: string;
  title: string;
  body: string;
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, title, body }: NotificationRequest = await req.json();

    if (!token || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: token, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!FIREBASE_SERVER_KEY) {
      return new Response(
        JSON.stringify({ error: 'Firebase server key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send FCM notification
    const fcmResponse = await fetch(FCM_SEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: title,
          body: body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'memory-notification',
          requireInteraction: false,
        },
        data: {
          click_action: '/',
        },
        priority: 'high',
      }),
    });

    const fcmData = await fcmResponse.json();

    if (!fcmResponse.ok) {
      console.error('FCM Error:', fcmData);
      return new Response(
        JSON.stringify({ error: 'Failed to send notification', details: fcmData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: fcmData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
