import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function BottomNav() {
  const navigation = useNavigation();
  const rootNav = (navigation as any).getParent?.() ?? navigation; // prefer root (Stack) navigator
  const route = useRoute();

  const activeRoute = route.name;
  const colorFor = (name: string) => (activeRoute === name ? '#ffffff' : '#b0b0b0');

  return (
    <View className="absolute bottom-6 left-6 right-6">
      <View className="flex-row items-center justify-between rounded-3xl border border-gray-600 bg-black px-8 py-3">
        <TouchableOpacity onPress={() => (rootNav as any).navigate('Home', { screen: 'HOME' })}>
          <Ionicons name="home-outline" size={28} color={colorFor('Home')} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => (rootNav as any).navigate('Search')}>
          <Ionicons name="search-outline" size={28} color={colorFor('Search')} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => (rootNav as any).navigate('Favourites')}>
          <Ionicons name="heart-outline" size={28} color={colorFor('Favourites')} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => (rootNav as any).navigate('Home', { screen: 'PROFILE' })}>
          <Ionicons name="person-outline" size={28} color={colorFor('Profile')} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => (rootNav as any).navigate('Home', { screen: 'CART' })}>
          <Ionicons name="bag-outline" size={28} color={colorFor('Cart')} />
        </TouchableOpacity>
      </View>
    </View>
  );
}


