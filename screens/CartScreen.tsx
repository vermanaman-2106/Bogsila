import React from 'react';
import { View, Text } from 'react-native';

export default function CartScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-semibold">Cart</Text>
      <Text className="mt-2">Your cart is empty</Text>
    </View>
  );
}



