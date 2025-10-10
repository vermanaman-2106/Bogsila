import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { getTokens, getUser, clearAuth, storeUser } from '../utils/authStorage';
import { BASE_URL } from '../config/api';

interface Product {
  _id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  addedAt?: string | Date;
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
        setFavorites(prev => prev.filter(fav => fav.productId !== productId));
        
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
    // Convert favorite item back to product format for ProductDetailScreen
    const { _id, name, price, image, ...restProduct } = product;
    const productItem = {
      _id: product.productId,
      name: product.name,
      title: product.name,
      productName: product.name,
      price: product.price,
      amount: product.price,
      mrp: product.price,
      image: product.image,
      imageUrl: product.image,
      thumbnail: product.image,
      img: product.image,
      description: product.description || '',
      category: product.category || '',
      ...restProduct
    };
    navigation.navigate('ProductDetail', { item: productItem });
  }

  function renderProduct({ item }: { item: Product }) {
    return (
      <TouchableOpacity
        className="bg-white rounded-3xl p-5 mb-4 flex-row shadow-lg"
        onPress={() => navigateToProduct(item)}
        activeOpacity={0.95}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Product Image */}
        <View className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 mr-4">
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 items-center justify-center">
              <Ionicons name="image-outline" size={28} color="#9CA3AF" />
            </View>
          )}
        </View>
        
        {/* Product Details */}
        <View className="flex-1 justify-between">
          <View>
            <Text className="text-black font-bold text-lg mb-1" numberOfLines={2}>
              {item.name}
            </Text>
            {item.description && (
              <Text className="text-gray-600 text-sm mb-2 leading-5" numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View className="flex-row items-center mt-2">
              <Text className="text-black font-bold text-xl">
                ₹{item.price}
              </Text>
              {item.addedAt && (
                <Text className="text-gray-500 text-xs ml-3">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View className="items-center justify-center ml-3">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mb-2"
            onPress={() => removeFromFavorites(item.productId)}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={20} color="#EF4444" />
          </TouchableOpacity>
          
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => navigateToProduct(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center mb-6">
            <ActivityIndicator size="large" color="#EF4444" />
          </View>
          <Text className="text-white text-lg font-semibold mb-2">Loading Favorites</Text>
          <Text className="text-gray-400 text-center">Please wait while we fetch your saved items...</Text>
        </View>
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
      {/* Header Section */}
      <View className="px-6 pt-16 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white text-4xl font-bold mb-2">Favourites</Text>
            <Text className="text-gray-400 text-lg">
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
            </Text>
          </View>
          <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
            <Ionicons name="heart" size={24} color="#EF4444" />
          </View>
        </View>
        
        {/* Stats Cards */}
        {favorites.length > 0 && (
          <View className="flex-row mb-6">
            <View className="flex-1 bg-white/5 rounded-2xl p-4 mr-3">
              <Text className="text-white font-semibold text-lg">{favorites.length}</Text>
              <Text className="text-gray-400 text-sm">Total Items</Text>
            </View>
            <View className="flex-1 bg-white/5 rounded-2xl p-4">
              <Text className="text-white font-semibold text-lg">
                ₹{favorites.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
              </Text>
              <Text className="text-gray-400 text-sm">Total Value</Text>
            </View>
          </View>
        )}
      </View>

      {!user && (
        <View className="px-6 py-4">
          <View className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-3xl p-6 border border-gray-600">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center mb-3">
                <Ionicons name="heart-outline" size={32} color="#EF4444" />
              </View>
              <Text className="text-white text-lg font-semibold text-center mb-2">
                Save Your Favorites
              </Text>
              <Text className="text-gray-300 text-center text-sm leading-5">
                Login to save your favorite products and access them anytime
              </Text>
            </View>
            <TouchableOpacity
              className="bg-white rounded-2xl px-6 py-4 items-center"
              onPress={() => (navigation as any).navigate('ProfileStack')}
              activeOpacity={0.9}
            >
              <Text className="text-black font-bold text-lg">Login to Save Favorites</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center">
            <View className="w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full items-center justify-center mb-8 border border-gray-600">
              <Ionicons name="heart-outline" size={48} color="#EF4444" />
            </View>
            <Text className="text-white text-2xl font-bold mb-3 text-center">No Favorites Yet</Text>
            <Text className="text-gray-400 text-center mb-8 leading-6 max-w-sm">
              Start exploring our collection and save items you love to your favorites
            </Text>
            
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="bg-white rounded-2xl px-8 py-4 flex-1 items-center"
                onPress={() => navigation.navigate('Home')}
                activeOpacity={0.9}
              >
                <Text className="text-black font-bold text-lg">Browse Products</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-white/10 rounded-2xl px-8 py-4 flex-1 items-center border border-gray-600"
                onPress={() => (navigation as any).navigate('SearchStack')}
                activeOpacity={0.9}
              >
                <Text className="text-white font-bold text-lg">Search Items</Text>
              </TouchableOpacity>
            </View>
          </View>
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
              keyExtractor={(item) => item.productId}
              contentContainerStyle={{ 
                paddingHorizontal: 24, 
                paddingBottom: 120,
                paddingTop: 10
              }}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={onRefresh}
              ListHeaderComponent={() => (
                <View className="mb-4">
                  <Text className="text-white text-xl font-semibold mb-2">Your Saved Items</Text>
                  <Text className="text-gray-400 text-sm">
                    Tap on any item to view details or remove from favorites
                  </Text>
                </View>
              )}
            />
          );
        })()
      )}

      <BottomNav />
    </View>
  );
}
