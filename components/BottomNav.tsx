import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();

  const activeRoute = route.name;
  const colorFor = (name: string) => (activeRoute === name ? '#ffffff' : '#b0b0b0');

  return (
    <View className="absolute bottom-6 left-6 right-6">
      <View className="flex-row items-center justify-between rounded-3xl border border-gray-600 bg-black px-8 py-3">
        <TouchableOpacity onPress={() => (navigation as any).navigate('Home', { screen: 'HOME' })}>
          <Ionicons name="home-outline" size={28} color={colorFor('Home')} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => (navigation as any).navigate('SearchStack')}>
          <Ionicons name="search-outline" size={28} color={colorFor('SearchStack')} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => (navigation as any).navigate('FavouritesStack')}>
          <Ionicons name="heart-outline" size={28} color={colorFor('FavouritesStack')} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => (navigation as any).navigate('ProfileStack')}>
          <Ionicons name="person-outline" size={28} color={colorFor('ProfileStack')} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => (navigation as any).navigate('CartStack')}>
          <Ionicons name="bag-outline" size={28} color={colorFor('CartStack')} />
        </TouchableOpacity>
      </View>
    </View>
  );
}


