import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import BottomNav from '../components/BottomNav';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../config/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const suggestions = ['Shirt', 'Tees', 'Bottoms', 'Co-ord', 'Bogsila'];
  const [popular, setPopular] = useState<any[]>([]);

  async function handleSearch() {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(q)}&limit=50`);
      const json = await res.json();
      setResults(Array.isArray(json.items) ? json.items : []);
    } catch (_) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // load some products to showcase
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/products?limit=12`);
        const json = await res.json();
        setPopular(Array.isArray(json.items) ? json.items : []);
      } catch (_) {}
    })();
  }, []);

  return (
    <View className="flex-1 bg-black px-6 pt-5">
      {/* Search bar */}
      <View className="flex-row items-center rounded-3xl bg-white/95 px-3 py-3 border border-gray-600">
        <Ionicons name="search-outline" size={22} color="#666" />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#8a8a8a"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          className="flex-1 ml-2"
          style={{ flex: 1, color: '#000', marginLeft: 8 }}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} className="ml-2 rounded-full bg-black px-3 py-1">
          <Text className="text-white font-medium">Search</Text>
        </TouchableOpacity>
      </View>

      {/* Browse Products Button */}
      <TouchableOpacity
        className="mt-4 bg-white rounded-2xl py-4 px-6 flex-row items-center justify-center"
        onPress={() => (navigation as any).navigate('ALL PRODUCTS')}
        activeOpacity={0.9}
      >
        <Ionicons name="grid-outline" size={20} color="#000" />
        <Text className="text-black font-semibold ml-2 text-lg">Browse All Products</Text>
      </TouchableOpacity>

      {/* Quick suggestions */}
      <View className="mt-4">
        <Text className="text-gray-300 mb-2">Quick suggestions</Text>
        <View className="flex-row flex-wrap">
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s}
              className="mr-2 mb-2 rounded-2xl border border-gray-600 px-3 py-1"
              onPress={() => { setQuery(s); setTimeout(handleSearch, 0); }}
              activeOpacity={0.9}
            >
              <Text className="text-gray-200">{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        className="mt-4"
        data={results}
        keyExtractor={(item, idx) => String(item?._id || idx)}
        ListEmptyComponent={() => (
          <View className="mt-10 items-center">
            <Text className="text-gray-400">{loading ? 'Searching…' : 'Try searching for products'}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const raw = (item as any)?.image;
          const thumb = Array.isArray(raw) ? raw[0] : (raw || (item as any)?.imageUrl || (item as any)?.thumbnail || (item as any)?.img);
          const title = (item as any)?.name || (item as any)?.title || 'Product';
          const price = (item as any)?.price || (item as any)?.amount || (item as any)?.mrp;
          return (
            <TouchableOpacity
              className="py-3 border-b border-gray-800 flex-row items-center"
              activeOpacity={0.85}
              onPress={() => (navigation as any).navigate('ProductDetail', { item })}
            >
              <View className="rounded-xl overflow-hidden bg-white mr-3">
                {thumb ? (
                  <Image source={{ uri: thumb }} style={{ width: 56, height: 56 }} />
                ) : (
                  <View className="items-center justify-center bg-gray-200" style={{ width: 56, height: 56 }}>
                    <Text>No Image</Text>
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white" numberOfLines={1}>{title}</Text>
                {price ? <Text className="text-gray-400 text-sm">₹{price}</Text> : null}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Popular products */}
      {popular.length ? (
        <View className="mt-8 mb-6">
          <Text className="text-white text-xl font-semibold mb-3">Popular</Text>
          <FlatList
            data={popular}
            keyExtractor={(item, idx) => String(item?._id || idx)}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => {
              const raw = (item as any)?.image;
              const thumb = Array.isArray(raw) ? raw[0] : (raw || (item as any)?.imageUrl || (item as any)?.thumbnail || (item as any)?.img);
              const title = (item as any)?.name || (item as any)?.title || 'Product';
              const price = (item as any)?.price || (item as any)?.amount || (item as any)?.mrp;
              return (
                <TouchableOpacity className="w-40" activeOpacity={0.85} onPress={() => (navigation as any).navigate('ProductDetail', { item })}>
                  <View className="rounded-2xl overflow-hidden bg-white">
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={{ width: 160, height: 160 }} />
                    ) : (
                      <View className="items-center justify-center bg-gray-200" style={{ width: 160, height: 160 }}>
                        <Text>No Image</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-white mt-2" numberOfLines={1}>{title}</Text>
                  {price ? <Text className="text-gray-400 text-sm">₹{price}</Text> : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}
      <BottomNav />
    </View>
  );
}


