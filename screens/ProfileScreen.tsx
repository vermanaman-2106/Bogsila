import React from 'react';
import { View, Text } from 'react-native';
import BottomNav from '../components/BottomNav';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-black px-6 pt-4">
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl font-semibold">Profile</Text>
        <Text className="text-gray-400 mt-2">Sign in and account details coming soon</Text>
      </View>
      <BottomNav />
    </View>
  );
}



