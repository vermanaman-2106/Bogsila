import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import { BASE_URL } from '../config/api';

export default function AllProductsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const navigation = useNavigation();


  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/api/products?limit=50`);
      const json = await res.json();
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const title = item.name || item.title || item.productName || 'Product';
    const price = item.price || item.amount || item.mrp;
    const rawImage = (item as any)?.image;
    const img = Array.isArray(rawImage)
      ? rawImage[0]
      : (rawImage || (item as any)?.imageUrl || (item as any)?.thumbnail || (item as any)?.img);
    
    return (
      <TouchableOpacity 
        className="w-[48%]" 
        activeOpacity={0.85} 
        onPress={() => (navigation as any).navigate('ProductDetail', { item })}
      >
        <View className="rounded-3xl overflow-hidden bg-white">
          {img ? (
            <Image 
              source={{ uri: img }} 
              style={{ width: '100%', height: 200 }} 
              resizeMode="cover"
              loadingIndicatorSource={require('../assest/header.png')}
              fadeDuration={200}
            />
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
  }, [navigation]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" />
        <Text className="text-white mt-3">Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="text-red-400 mb-3">{error}</Text>
        <TouchableOpacity onPress={loadProducts} className="rounded-xl bg-white px-4 py-2">
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black px-5 pt-5">
      <Text className="text-white text-2xl font-semibold mb-4">All Products</Text>
      <FlatList
        data={items}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 24 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        keyExtractor={(item, idx) => String(item?._id || idx)}
        renderItem={renderItem}
        ListEmptyComponent={<Text className="text-gray-400">No products found.</Text>}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        getItemLayout={(data, index) => ({
          length: 250,
          offset: 250 * Math.floor(index / 2),
          index,
        })}
      />
      <BottomNav />
    </View>
  );
}
