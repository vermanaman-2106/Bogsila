import React from 'react';
import { View, ImageBackground, TouchableOpacity, Alert, Text, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const heroHeight = Math.round(Dimensions.get('window').height * 0.6);

  return (
    <View className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Hero section */}
        <ImageBackground
          source={require('../assest/Homescrren.webp')}
          resizeMode="cover"
          style={{ width: '100%', height: heroHeight }}
        />

        {/* Collections title */}
        <View className="px-6 mt-6">
          <Text className="text-white text-2xl font-semibold mb-3">Collections</Text>
        </View>

        {/* Collections grid */}
        <View className="px-6">
          <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            className="w-[48%]"
            onPress={() => navigation.navigate('Bottoms' as never)}
            activeOpacity={0.85}
          >
            <View className="rounded-2xl overflow-hidden">
              <ImageBackground
                source={require('../assest/bottom.webp')}
                resizeMode="cover"
                style={{ width: '100%', height: 160 }}
              />
            </View>
            <Text className="text-white mt-2 text-base">Bottom</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-[48%]"
            onPress={() => navigation.navigate('Co-ord' as never)}
            activeOpacity={0.85}
          >
            <View className="rounded-2xl overflow-hidden">
              <ImageBackground
                source={require('../assest/cordset.webp')}
                resizeMode="cover"
                style={{ width: '100%', height: 160 }}
              />
            </View>
            <Text className="text-white mt-2 text-base">Co-ord</Text>
          </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-8">
          <TouchableOpacity
            className="w-[48%]"
            onPress={() => navigation.navigate('Shirts' as never)}
            activeOpacity={0.85}
          >
            <View className="rounded-2xl overflow-hidden">
              <ImageBackground
                source={require('../assest/shirt.webp')}
                resizeMode="cover"
                style={{ width: '100%', height: 160 }}
              />
            </View>
            <Text className="text-white mt-2 text-base">Shirt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-[48%]"
            onPress={() => navigation.navigate('Tees' as never)}
            activeOpacity={0.85}
          >
            <View className="rounded-2xl overflow-hidden">
              <ImageBackground
                source={require('../assest/teees.webp')}
                resizeMode="cover"
                style={{ width: '100%', height: 160 }}
              />
            </View>
            <Text className="text-white mt-2 text-base">Tees</Text>
          </TouchableOpacity>
          </View>
        </View>

        {/* Bestsellers section */}
        <View className="px-6">
          <Text className="text-white text-2xl font-semibold mb-3">Bestsellers</Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Co-ord' as never)}
            className="rounded-2xl overflow-hidden mb-8"
          >
            <ImageBackground
              source={require('../assest/bestseller.webp')}
              resizeMode="cover"
              style={{ width: '100%', height: 200 }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  );
}


