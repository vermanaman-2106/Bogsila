import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, FlatList, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { getTokens, getUser, clearAuth } from '../utils/authStorage';

type Product = {
  _id?: string;
  name?: string;
  title?: string;
  productName?: string;
  price?: number | string;
  amount?: number | string;
  mrp?: number | string;
  description?: string;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  img?: string;
};

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const item: Product = route.params?.item || {};

  const title = item.name || item.title || item.productName || 'Product';
  const price = item.price || item.amount || item.mrp;
  const primaryImage = Array.isArray((item as any)?.image)
    ? (item as any).image[0]
    : ((item as any).image || (item as any).imageUrl || (item as any).thumbnail || (item as any).img);
  const desc = item.description || '';

  const sizeOptions = (item as any)?.sizes || ['S', 'M', 'L', 'XL'];
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);

  // Build gallery from common fields
  const rawGallery = Array.isArray((item as any)?.image)
    ? (item as any).image
    : ((item as any)?.images || (item as any)?.photos || (item as any)?.gallery);
  let gallery: string[] = Array.isArray(rawGallery) ? rawGallery.filter(Boolean) : [];
  if (!gallery.length && typeof primaryImage === 'string') {
    gallery = [primaryImage];
  }
  const screenWidth = Dimensions.get('window').width;

  // Similar and Also Bought
  const [similar, setSimilar] = useState<any[]>([]);
  const [alsoBought, setAlsoBought] = useState<any[]>([]);
  const BASE_URL = 'http://localhost:3001';
  const categoryKey = String((item as any)?.category || '').toLowerCase();

  // Load user data and check if product is in favorites
  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const storedTokens = await getTokens();
      const storedUser = await getUser();
      
      if (storedTokens && storedUser) {
        setTokens(storedTokens);
        setUser(storedUser);
        
        // Check if this product is in favorites
        const response = await fetch(`${BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${storedTokens.access}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          const favoriteIds = data.user.favorites || [];
          setIsFavorite(favoriteIds.includes(item._id));
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  async function toggleFavorite() {
    if (!user || !tokens?.access) {
      Alert.alert('Login Required', 'Please log in to add products to favorites');
      return;
    }

    // Check if token is expired
    try {
      const tokenPayload = JSON.parse(atob(tokens.access.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenPayload.exp < currentTime) {
        console.log('Token is expired, clearing auth');
        setUser(null);
        setTokens(null);
        await clearAuth();
        Alert.alert('Session Expired', 'Please log in again');
        return;
      }
    } catch (error) {
      console.log('Invalid token format, clearing auth');
      setUser(null);
      setTokens(null);
      await clearAuth();
      Alert.alert('Session Expired', 'Please log in again');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        const currentFavorites = data.user.favorites || [];
        
        let newFavorites;
        if (isFavorite) {
          // Remove from favorites
          newFavorites = currentFavorites.filter((id: string) => id !== item._id);
        } else {
          // Add to favorites
          newFavorites = [...currentFavorites, item._id];
        }

        // Update favorites
        const updateResponse = await fetch(`${BASE_URL}/api/me`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.access}`,
          },
          body: JSON.stringify({ favorites: newFavorites }),
        });

        if (updateResponse.ok) {
          setIsFavorite(!isFavorite);
          console.log('Favorite updated successfully:', newFavorites);
          Alert.alert(
            isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
            isFavorite 
              ? 'Product removed from your favorites' 
              : 'Product added to your favorites'
          );
        } else {
          console.error('Failed to update favorites:', updateResponse.status);
          Alert.alert('Error', 'Failed to update favorites');
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  }

  useEffect(() => {
    async function load() {
      try {
        // fetch similar by category if key available
        if (categoryKey) {
          const res = await fetch(`${BASE_URL}/api/collection/${categoryKey}?limit=10`);
          const json = await res.json();
          const list = Array.isArray(json.items) ? json.items : [];
          setSimilar(list.filter((p: any) => String(p._id) !== String((item as any)?._id)));
        }
      } catch (_) {}
      try {
        const res2 = await fetch(`${BASE_URL}/api/products?limit=10`);
        const json2 = await res2.json();
        setAlsoBought(Array.isArray(json2.items) ? json2.items : []);
      } catch (_) {}
    }
    load();
  }, [categoryKey, (item as any)?._id]);

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 140 }}>
      <View className="rounded-3xl overflow-hidden bg-white">
        {gallery.length ? (
          <FlatList
            data={gallery}
            keyExtractor={(uri, idx) => `${uri}-${idx}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: uri }) => (
              <Image
                source={{ uri }}
                style={{ width: screenWidth - 40, height: 360 }}
                resizeMode="cover"
              />
            )}
          />
        ) : (
          <View style={{ width: '100%', height: 360 }} className="items-center justify-center bg-gray-200">
            <Text>No Image</Text>
          </View>
        )}
      </View>

      <Text className="text-white text-2xl font-semibold mt-4" numberOfLines={2}>{title}</Text>
      {price ? <Text className="text-gray-300 text-lg mt-1">₹{price}</Text> : null}
      {desc ? <Text className="text-gray-400 mt-4 leading-6">{desc}</Text> : null}
      {!desc ? (
        <Text className="text-gray-500 mt-4">No description available.</Text>
      ) : null}

      {/* Size selector */}
      <View className="mt-6">
        <Text className="text-white font-semibold mb-2">Size</Text>
        <View className="flex-row flex-wrap">
          {sizeOptions.map((s: string) => {
            const active = selectedSize === s;
            return (
              <TouchableOpacity
                key={s}
                className={`mr-2 mb-2 rounded-2xl px-4 py-2 ${active ? 'bg-white' : 'bg-[#1a1a1a] border border-gray-700'}`}
                onPress={() => setSelectedSize(s)}
                activeOpacity={0.9}
              >
                <Text className={`${active ? 'text-black' : 'text-gray-200'}`}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Color selector removed by request */}

      {/* Action buttons */}
      <View className="flex-row items-center justify-between mt-6 mb-6">
        <TouchableOpacity
          className="flex-1 mr-3 items-center justify-center rounded-2xl bg-white py-3"
          onPress={toggleFavorite}
          activeOpacity={0.9}
        >
          <View className="flex-row items-center">
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? "#EF4444" : "#000"} 
            />
            <Text className="text-black font-semibold ml-2">
              {isFavorite ? 'Favorited' : 'Favourite'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 ml-3 items-center justify-center rounded-2xl bg-[#111111] py-3 border border-gray-700"
          onPress={() => {
            if (!selectedSize) {
              Alert.alert('Select size', 'Please pick a size first.');
              return;
            }
            Alert.alert('Added to Cart', `${title} - ${selectedSize}`);
          }}
          activeOpacity={0.9}
        >
          <Text className="text-white font-semibold">Add to Cart</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="items-center justify-center rounded-2xl bg-white py-3 mb-6"
        onPress={() => {
          if (!selectedSize) {
            Alert.alert('Select size', 'Please pick a size first.');
            return;
          }
          Alert.alert('Buy Now', `${title} - ${selectedSize}`);
        }}
        activeOpacity={0.9}
      >
        <Text className="text-black font-semibold">Buy Now</Text>
      </TouchableOpacity>

      {/* Similar items */}
      {similar.length ? (
        <View className="mt-2">
          <Text className="text-white text-xl font-semibold mb-3">Similar items</Text>
          <FlatList
            data={similar}
            keyExtractor={(p, idx) => String(p?._id || idx)}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item: prod }) => {
              const raw = (prod as any)?.image;
              const thumb = Array.isArray(raw) ? raw[0] : (raw || (prod as any)?.imageUrl || (prod as any)?.thumbnail || (prod as any)?.img);
              const name = (prod as any)?.name || (prod as any)?.title || 'Product';
              const priceX = (prod as any)?.price || (prod as any)?.amount || (prod as any)?.mrp;
              return (
                <TouchableOpacity
                  className="w-44"
                  activeOpacity={0.85}
                  onPress={() => (navigation as any).navigate('ProductDetail', { item: prod })}
                >
                  <View className="rounded-2xl overflow-hidden bg-white">
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={{ width: 176, height: 176 }} />
                    ) : (
                      <View className="items-center justify-center bg-gray-200" style={{ width: 176, height: 176 }}>
                        <Text>No Image</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-white mt-2" numberOfLines={1}>{name}</Text>
                  {priceX ? <Text className="text-gray-400">₹{priceX}</Text> : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}

      {/* Others also bought */}
      {alsoBought.length ? (
        <View className="mt-6 mb-10">
          <Text className="text-white text-xl font-semibold mb-3">Others also bought</Text>
          <FlatList
            data={alsoBought}
            keyExtractor={(p, idx) => String(p?._id || idx)}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item: prod }) => {
              const raw = (prod as any)?.image;
              const thumb = Array.isArray(raw) ? raw[0] : (raw || (prod as any)?.imageUrl || (prod as any)?.thumbnail || (prod as any)?.img);
              const name = (prod as any)?.name || (prod as any)?.title || 'Product';
              const priceX = (prod as any)?.price || (prod as any)?.amount || (prod as any)?.mrp;
              return (
                <TouchableOpacity
                  className="w-44"
                  activeOpacity={0.85}
                  onPress={() => (navigation as any).navigate('ProductDetail', { item: prod })}
                >
                  <View className="rounded-2xl overflow-hidden bg-white">
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={{ width: 176, height: 176 }} />
                    ) : (
                      <View className="items-center justify-center bg-gray-200" style={{ width: 176, height: 176 }}>
                        <Text>No Image</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-white mt-2" numberOfLines={1}>{name}</Text>
                  {priceX ? <Text className="text-gray-400">₹{priceX}</Text> : null}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}
      </ScrollView>
      <BottomNav />
    </View>
  );
}


