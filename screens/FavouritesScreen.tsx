import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { getTokens, getUser, clearAuth } from '../utils/authStorage';

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
  const [user, setUser] = useState<any>(null);
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);

  useEffect(() => {
    // Load stored auth and fetch favorites
    loadStoredAuthAndFetchFavorites();
  }, []);

  // Refresh favorites when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user && tokens) {
        fetchFavorites();
      }
    });

    return unsubscribe;
  }, [navigation, user, tokens]);

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
        await fetchFavorites();
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
      const response = await fetch('http://localhost:3001/api/products?limit=6');
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.items || []);
      } else {
        // If API fails, set empty array to show empty state
        setFavorites([]);
      }
    } catch (error) {
      console.error('Failed to load sample products:', error);
      // If API fails, set empty array to show empty state
      setFavorites([]);
    }
  }

  async function fetchFavorites() {
    if (!tokens?.access) {
      setLoading(false);
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
      console.log('Making API call to /api/me with token:', tokens.access?.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:3001/api/me', {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const favoriteIds = data.user.favorites || [];
        console.log('User profile data:', data.user);
        console.log('Favorite IDs from server:', favoriteIds);
        
        if (favoriteIds.length === 0) {
          console.log('No favorites found, showing empty state');
          // Show empty state when no favorites
          setFavorites([]);
          setLoading(false);
          return;
        }

        // Fetch all products and filter by favorite IDs
        console.log('Fetching favorites for user:', favoriteIds);
        try {
          const allProductsResponse = await fetch('http://localhost:3001/api/products');
          if (allProductsResponse.ok) {
            const allProductsData = await allProductsResponse.json();
            const allProducts = allProductsData.items || [];
            
            // Filter products that are in favorites
            const favoriteProducts = allProducts.filter((product: any) => 
              favoriteIds.includes(product._id)
            );
            
            console.log('Found favorite products:', favoriteProducts.length);
            setFavorites(favoriteProducts);
            
            // If no valid products found, show empty state
            if (favoriteProducts.length === 0) {
              console.log('No valid products found, showing empty state');
              setFavorites([]);
            }
          } else {
            console.error('Failed to fetch all products');
            setFavorites([]);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          setFavorites([]);
        }
        setLoading(false);
      } else {
        // If API call fails, show empty state
        const errorText = await response.text();
        console.log('API call failed with status:', response.status);
        console.log('API error response:', errorText);
        setFavorites([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        console.log('Authentication failed, clearing stored auth');
        // Clear stored auth and show login prompt
        setUser(null);
        setTokens(null);
        await clearAuth();
      }
      
      // Show empty state on error
      setFavorites([]);
      setLoading(false);
    }
  }

  async function removeFromFavorites(productId: string) {
    if (!tokens?.access) return;

    try {
      const currentFavorites = favorites.map(fav => fav._id);
      const updatedFavorites = currentFavorites.filter(id => id !== productId);

      const response = await fetch('http://localhost:3001/api/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify({ favorites: updatedFavorites }),
      });

      if (response.ok) {
        setFavorites(favorites.filter(fav => fav._id !== productId));
        Alert.alert('Success', 'Removed from favorites');
      } else {
        Alert.alert('Error', 'Failed to remove from favorites');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove from favorites');
    }
  }

  function navigateToProduct(product: Product) {
    navigation.navigate('ProductDetail', { product });
  }

  function renderProduct({ item }: { item: Product }) {
    const imageUrl = Array.isArray(item.image) ? item.image[0] : item.image;
    
    return (
      <TouchableOpacity
        className="bg-gray-900 rounded-2xl p-4 mb-3"
        onPress={() => navigateToProduct(item)}
      >
        <View className="flex-row">
          <Image
            source={{ uri: imageUrl }}
            className="w-20 h-20 rounded-lg"
            resizeMode="cover"
          />
          <View className="flex-1 ml-4">
            <Text className="text-white font-semibold text-lg mb-1" numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="text-gray-400 text-sm mb-2" numberOfLines={2}>
              {item.description}
            </Text>
            <Text className="text-white font-bold text-lg">₹{item.price}</Text>
          </View>
          {user ? (
            <TouchableOpacity
              className="ml-2"
              onPress={() => removeFromFavorites(item._id)}
            >
              <Ionicons name="heart" size={24} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="ml-2"
              onPress={() => {
                Alert.alert('Login Required', 'Please log in to add products to favorites');
              }}
            >
              <Ionicons name="heart-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Loading favorites...</Text>
        <BottomNav />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="px-6 pt-4 pb-4">
        <Text className="text-white text-2xl font-bold">
          {user ? 'My Favorites' : 'Featured Products'}
        </Text>
        <Text className="text-gray-400 mt-1">
          {user 
            ? (favorites.length > 0 
                ? `${favorites.length} ${favorites.length === 1 ? 'item' : 'items'}`
                : 'Discover our best products'
              )
            : 'Discover our best products'
          }
        </Text>
        {!user && (
          <TouchableOpacity
            className="bg-white rounded-lg px-4 py-2 mt-3 self-start"
            onPress={() => navigation.navigate('Profile')}
          >
            <Text className="text-black font-semibold">Login to save favorites</Text>
          </TouchableOpacity>
        )}
        {user && (
          <TouchableOpacity
            className="bg-gray-600 rounded-lg px-4 py-2 mt-3 self-start"
            onPress={fetchFavorites}
          >
            <Text className="text-white font-semibold">Refresh Favorites</Text>
          </TouchableOpacity>
        )}
      </View>

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
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNav />
    </View>
  );
}



