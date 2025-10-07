import React from 'react';
import { View, Text } from 'react-native';

export default function FavouritesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-semibold">Favourites</Text>
      <Text className="mt-2">No favourites yet</Text>
    </View>
  );
}



