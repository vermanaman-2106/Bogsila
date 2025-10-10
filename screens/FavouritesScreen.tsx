import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { getTokens, getUser, clearAuth, storeUser } from '../utils/authStorage';
import { BASE_URL } from '../config/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string[];
  category: string;
  description: string;
}

export default function FavouritesScreen({ navigation }: any) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);

  useEffect(() => {
    // Load stored auth and fetch favorites
    loadStoredAuthAndFetchFavorites();
  }, []);

  useEffect(() => {
    // Listen for navigation focus to refresh favorites
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('=== SCREEN FOCUSED ===');
      console.log('Tokens available:', !!tokens?.access);
      console.log('User available:', !!user);
      if (tokens?.access && user) {
        console.log('Screen focused, refreshing favorites');
        // Force refresh user data and then favorites
        forceRefreshFromServer();
      } else {
        console.log('Cannot refresh favorites - missing tokens or user');
      }
    });

    return unsubscribe;
  }, [navigation, user, tokens]);

  // Add a more aggressive refresh mechanism
  useEffect(() => {
    const interval = setInterval(() => {
      if (tokens?.access && user) {
        console.log('Auto-refreshing favorites...');
        forceRefreshFromServer();
      }
    }, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, [tokens, user]);

  async function onRefresh() {
    console.log('=== PULL TO REFRESH TRIGGERED ===');
    console.log('Current tokens:', tokens);
    console.log('Current user:', user);
    setRefreshing(true);
    
    // Use the force refresh function
    await forceRefreshFromServer();
    
    setRefreshing(false);
    console.log('Pull to refresh completed');
  }

  async function loadStoredAuthAndFetchFavorites() {
    try {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 5000); // 5 second timeout

      const storedTokens = await getTokens();
      const storedUser = await getUser();
      
      console.log('Stored tokens:', storedTokens);
      console.log('Stored user:', storedUser);
      
      clearTimeout(timeoutId);
      
      if (storedTokens && storedUser) {
        setTokens(storedTokens);
        setUser(storedUser);
        console.log('=== STORED USER DATA ===');
        console.log('Stored user:', storedUser);
        console.log('Stored user favorites:', storedUser.favorites);
        console.log('Stored user ID:', storedUser._id);
        console.log('Stored user email:', storedUser.email);
        console.log('About to call forceRefreshFromServer...');
        await forceRefreshFromServer();
        console.log('forceRefreshFromServer completed');
      } else {
        console.log('No stored auth found, showing sample products');
        // Show some sample products when not authenticated
        await loadSampleProducts();
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await loadSampleProducts();
      setLoading(false);
    }
  }

  async function loadSampleProducts() {
    try {
      const response = await fetch(`${BASE_URL}/api/products?limit=6`);
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.items || []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Failed to load sample products:', error);
      setFavorites([]);
    }
  }

  // Add a function to force refresh from server
  async function forceRefreshFromServer() {
    if (!tokens?.access) return;
    
    try {
      console.log('=== FORCE REFRESH FROM SERVER ===');
      
      // First get fresh user data
      const userResponse = await fetch(`${BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('Fresh user data from server:', userData.user);
        setUser(userData.user);
        await storeUser(userData.user);
      }
      
      // Then get fresh favorites
      await fetchFavorites();
      
    } catch (error) {
      console.error('Force refresh failed:', error);
    }
  }

  // Add a function to force refresh from server immediately
  async function forceRefreshFromServerImmediate() {
    if (!tokens?.access) return;
    
    try {
      console.log('=== FORCE REFRESH FROM SERVER IMMEDIATE ===');
      
      // First get fresh user data
      const userResponse = await fetch(`${BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('Fresh user data from server:', userData.user);
        setUser(userData.user);
        await storeUser(userData.user);
      }
      
      // Then get fresh favorites
      await fetchFavorites();
      
    } catch (error) {
      console.error('Force refresh failed:', error);
    }
  }

  async function fetchFavorites() {
    if (!tokens?.access) {
      setLoading(false);
      return;
    }
    
    console.log('=== FETCH FAVORITES CALLED ===');
    console.log('fetchFavorites called - using dedicated favorites API');
    console.log('Current user from state:', user);
    console.log('Current tokens from state:', tokens);
    
    // Check if token is expired
    try {
      const tokenPayload = JSON.parse(atob(tokens.access.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenPayload.exp < currentTime) {
        console.log('Token is expired, clearing auth');
        setUser(null);
        setTokens(null);
        await clearAuth();
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log('Invalid token format, clearing auth');
      setUser(null);
      setTokens(null);
      await clearAuth();
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Making API call to /api/favorites with token:', tokens.access?.substring(0, 20) + '...');
      console.log('Full API URL:', `${BASE_URL}/api/favorites`);
      console.log('Authorization header:', `Bearer ${tokens.access?.substring(0, 20)}...`);
      console.log('Full token length:', tokens.access?.length);
      console.log('Token starts with:', tokens.access?.substring(0, 10));
      
      const response = await fetch(`${BASE_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      
      console.log('Favorites API response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        const favoriteProducts = data.items || [];
        
        console.log('=== FAVORITES API SUCCESS ===');
        console.log('Favorites API response:', data);
        console.log('Number of favorite products:', favoriteProducts.length);
        console.log('Favorite products:', favoriteProducts.map((p: any) => ({ id: p._id, name: p.name })));
        console.log('Setting favorites state with:', favoriteProducts.length, 'products');
        
        setFavorites(favoriteProducts);
        setLoading(false);
        
        console.log('Favorites state updated successfully');
      } else {
        const errorText = await response.text();
        console.log('=== FAVORITES API FAILED ===');
        console.log('Favorites API call failed with status:', response.status);
        console.log('Favorites API error response:', errorText);
        console.log('Response status text:', response.statusText);
        setFavorites([]);
        setLoading(false);
      }
    } catch (error) {
      console.log('=== FAVORITES API ERROR ===');
      console.error('Error fetching favorites:', error);
      console.log('Error type:', typeof error);
      console.log('Error message:', (error as Error).message);
      setFavorites([]);
      setLoading(false);
    }
  }

  async function removeFromFavorites(productId: string) {
    if (!tokens?.access) return;

    try {
      console.log('Removing product from favorites:', productId);
      
      const response = await fetch(`${BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify({ productId, action: 'remove' }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Remove from favorites response:', data);
        
        // Update local favorites list
        setFavorites(prev => prev.filter(fav => fav._id !== productId));
        
        // Update user data
        if (user) {
          const updatedUser = { ...user, favorites: data.favorites };
          setUser(updatedUser);
          await storeUser(updatedUser);
        }
        
        Alert.alert('Success', 'Product removed from favorites');
      } else {
        const errorText = await response.text();
        console.error('Failed to remove from favorites:', errorText);
        Alert.alert('Error', 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  }

  function navigateToProduct(product: Product) {
    navigation.navigate('ProductDetail', { item: product });
  }

  function renderProduct({ item }: { item: Product }) {
    const imageUrl = Array.isArray(item.image) ? item.image[0] : item.image;
    
    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mb-4 flex-row"
        onPress={() => navigateToProduct(item)}
        activeOpacity={0.9}
      >
        <View className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 mr-4">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gray-200 items-center justify-center">
              <Ionicons name="image-outline" size={24} color="#9CA3AF" />
            </View>
          )}
        </View>
        
        <View className="flex-1">
          <Text className="text-black font-semibold text-lg mb-1" numberOfLines={2}>
            {item.name}
          </Text>
          <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
            {item.description}
          </Text>
          <Text className="text-black font-bold text-lg">
            ₹{item.price}
          </Text>
        </View>
        
        <TouchableOpacity
          className="p-2"
          onPress={() => removeFromFavorites(item._id)}
        >
          <Ionicons name="heart" size={24} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Loading favorites...</Text>
      </View>
    );
  }

  console.log('=== FAVORITES SCREEN RENDER ===');
  console.log('Current favorites state:', favorites);
  console.log('Favorites length:', favorites.length);
  console.log('Loading state:', loading);
  console.log('User state:', user ? 'logged in' : 'not logged in');

  return (
    <View className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-6">
        <Text className="text-white text-3xl font-bold mb-2">Favourites</Text>
        <Text className="text-gray-400">
          {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
        </Text>
      </View>

      {!user && (
        <View className="px-6 py-4">
          <View className="bg-gray-800 rounded-2xl p-4">
            <Text className="text-white text-center mb-3">
              Login to save your favorite products
            </Text>
            <TouchableOpacity
              className="bg-white rounded-lg px-4 py-2 mt-3 self-start"
              onPress={() => (navigation as any).navigate('ProfileStack')}
            >
              <Text className="text-black font-semibold">Login to save favorites</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-6">
            <Ionicons name="heart-outline" size={40} color="#9CA3AF" />
          </View>
          <Text className="text-white text-xl font-semibold mb-2">No products available</Text>
          <Text className="text-gray-400 text-center mb-8">Check back later for new products</Text>
          <TouchableOpacity
            className="bg-white rounded-2xl px-6 py-3"
            onPress={() => navigation.navigate('Home')}
          >
            <Text className="text-black font-semibold">Browse Products</Text>
          </TouchableOpacity>
          
                  {/* Debug button - remove this after testing */}
                  <TouchableOpacity
                    className="bg-red-500 rounded-2xl px-6 py-3 mt-3"
                    onPress={async () => {
                      console.log('=== DEBUG BUTTON PRESSED ===');
                      console.log('Current user:', user);
                      console.log('Current tokens:', tokens);
                      console.log('Current favorites state:', favorites);
                      console.log('About to call forceRefreshFromServer from debug button...');
                      await forceRefreshFromServer();
                      console.log('Debug button forceRefreshFromServer completed');
                    }}
                  >
                    <Text className="text-white font-semibold">DEBUG: Force Refresh</Text>
                  </TouchableOpacity>
        </View>
      ) : (
        (() => {
          console.log('=== RENDERING FAVORITES LIST ===');
          console.log('FlatList data:', favorites);
          console.log('FlatList data length:', favorites.length);
          return (
            <FlatList
              data={favorites}
              renderItem={renderProduct}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          );
        })()
      )}

      <BottomNav />
    </View>
  );
}
