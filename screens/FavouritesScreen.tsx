import React from 'react';
import { View, Text } from 'react-native';
import BottomNav from '../components/BottomNav';

export default function FavouritesScreen() {
  return (
    <View className="flex-1 bg-black px-6 pt-4">
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-xl font-semibold">Favourites</Text>
        <Text className="text-gray-400 mt-2">No favourites yet</Text>
      </View>
      <BottomNav />
    </View>
  );
}



