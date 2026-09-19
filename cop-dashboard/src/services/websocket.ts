import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Sighting, HotlistEntry } from './api';

let stompClient: Client | null = null;
const subscribers: Map<string, ((data: any) => void)[]> = new Map();

export const connectWebSocket = (onConnect?: () => void) => {
  if (stompClient?.connected) {
    return stompClient;
  }

  const socket = new SockJS('http://localhost:8080/ws') as any;
  stompClient = new Client({
    webSocketFactory: () => socket,
    onConnect: () => {
      console.log('WebSocket connected');
      onConnect?.();
      
      // Subscribe to sighting updates
      stompClient?.subscribe('/topic/sightings', (message) => {
        const data = JSON.parse(message.body);
        notifySubscribers('/topic/sightings', data);
      });

      // Subscribe to hotlist updates
      stompClient?.subscribe('/topic/hotlist-updates', (message) => {
        const data = JSON.parse(message.body);
        notifySubscribers('/topic/hotlist-updates', data);
      });
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame.headers['message']);
    },
  });

  stompClient.activate();
  return stompClient;
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
  subscribers.clear();
};

export const subscribeToSightings = (callback: (sighting: Sighting) => void) => {
  subscribers.set('/topic/sightings', [...(subscribers.get('/topic/sightings') || []), callback]);
  return () => unsubscribeFrom('/topic/sightings', callback);
};

export const subscribeToHotlistUpdates = (callback: (entry: HotlistEntry) => void) => {
  subscribers.set('/topic/hotlist-updates', [...(subscribers.get('/topic/hotlist-updates') || []), callback]);
  return () => unsubscribeFrom('/topic/hotlist-updates', callback);
};

const notifySubscribers = (topic: string, data: any) => {
  const callbacks = subscribers.get(topic) || [];
  callbacks.forEach(cb => cb(data));
};

const unsubscribeFrom = (topic: string, callback: (data: any) => void) => {
  const callbacks = subscribers.get(topic) || [];
  subscribers.set(topic, callbacks.filter(cb => cb !== callback));
};
