import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initializeDB } from '../lib/db';

export default function RootLayout() {
  // Initialize the database on app load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDB();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="todo/[id]" options={{ headerShown: true }} />
    </Stack>
  );
}