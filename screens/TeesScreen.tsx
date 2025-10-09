import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import { BASE_URL } from '../config/api';

export default function TeesScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const navigation = useNavigation();


  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/api/tshirts?limit=1000`);
      const json = await res.json();
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch T-shirts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" />
        <Text className="text-white mt-3">Loading T-Shirts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-red-400 mb-3">{error}</Text>
        <TouchableOpacity onPress={load} className="rounded-xl bg-white px-4 py-2">
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-5 pt-5">
      <Text className="text-white text-2xl font-semibold mb-4">T-Shirts</Text>
      <FlatList
        data={items}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 24 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        keyExtractor={(item, idx) => String(item?._id || idx)}
        renderItem={({ item }) => {
          const title = item.name || item.title || item.productName || 'Product';
          const price = item.price || item.amount || item.mrp;
          const rawImage = (item as any)?.image;
          const img = Array.isArray(rawImage)
            ? rawImage[0]
            : (rawImage || (item as any)?.imageUrl || (item as any)?.thumbnail || (item as any)?.img);
          return (
            <TouchableOpacity className="w-[48%]" activeOpacity={0.85} onPress={() => (navigation as any).navigate('ProductDetail', { item })}>
              <View className="rounded-3xl overflow-hidden bg-white">
                {img ? (
                  <Image source={{ uri: img }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
                ) : (
                  <View style={{ width: '100%', height: 200 }} className="items-center justify-center bg-gray-200">
                    <Text>No Image</Text>
                  </View>
                )}
              </View>
              <Text className="text-white mt-3 text-base" numberOfLines={1}>{title}</Text>
              {price ? <Text className="text-gray-400 text-sm">₹{price}</Text> : null}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text className="text-gray-400">No products found.</Text>}
      />
      <BottomNav />
    </View>
  );
}