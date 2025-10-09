import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import BottomNav from '../components/BottomNav';
import { CartItem, getCart, removeFromCart, updateQuantity, clearCart } from '../utils/cartStorage';
import { useNavigation } from '@react-navigation/native';

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    load();
    return unsubscribe;
  }, [navigation]);

  async function load() {
    setLoading(true);
    const cart = await getCart();
    setItems(cart);
    setLoading(false);
  }

  const total = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 1), 0);

  return (
    <View className="flex-1 bg-black">
      <View className="flex-1 px-6 pt-6 pb-36">
        <Text className="text-white text-2xl font-semibold mb-4">Cart</Text>
        {loading ? (
          <Text className="text-gray-400">Loading...</Text>
        ) : items.length === 0 ? (
          <View className="items-center justify-center mt-16">
            <Text className="text-gray-400">Your cart is empty</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it, idx) => `${it.productId}-${it.size || 'nosize'}-${idx}`}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item }) => (
              <View className="bg-gray-900 rounded-2xl p-4 flex-row">
                {item.image ? (
                  <Image source={{ uri: item.image }} style={{ width: 72, height: 72, borderRadius: 12 }} />
                ) : (
                  <View style={{ width: 72, height: 72 }} className="bg-gray-800 rounded-xl" />
                )}
                <View className="flex-1 ml-3">
                  <Text className="text-white" numberOfLines={1}>{item.name}</Text>
                  {item.size ? <Text className="text-gray-400 text-xs">Size: {item.size}</Text> : null}
                  <Text className="text-white mt-1">₹{item.price}</Text>
                  <View className="flex-row items-center mt-2">
                    <TouchableOpacity
                      className="bg-white rounded-lg px-2"
                      onPress={async () => { await updateQuantity(item.productId, item.size || null, item.quantity - 1); load(); }}
                    >
                      <Text className="text-black">-</Text>
                    </TouchableOpacity>
                    <Text className="text-white mx-3">{item.quantity}</Text>
                    <TouchableOpacity
                      className="bg-white rounded-lg px-2"
                      onPress={async () => { await updateQuantity(item.productId, item.size || null, item.quantity + 1); load(); }}
                    >
                      <Text className="text-black">+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="ml-auto"
                      onPress={async () => { await removeFromCart(item.productId, item.size || null); load(); }}
                    >
                      <Text className="text-red-400">Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        {/* Summary */}
        <View className="mt-6 bg-gray-900 rounded-2xl p-4">
          <View className="flex-row justify-between">
            <Text className="text-gray-400">Subtotal</Text>
            <Text className="text-white">₹{total.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-400">Shipping</Text>
            <Text className="text-white">₹0.00</Text>
          </View>
          <View className="flex-row justify-between mt-3">
            <Text className="text-white font-semibold">Total</Text>
            <Text className="text-white font-semibold">₹{total.toFixed(2)}</Text>
          </View>
          <View className="flex-row mt-4">
            <TouchableOpacity
              className="flex-1 bg-[#111111] border border-gray-700 rounded-2xl py-3 mr-3 items-center"
              onPress={async () => {
                await clearCart();
                load();
              }}
            >
              <Text className="text-white">Clear Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl py-3 items-center"
              onPress={() => {
                if (!items.length) {
                  Alert.alert('Cart is empty');
                  return;
                }
                navigation.navigate('Home' as never); // or navigate to a checkout screen if added
              }}
            >
              <Text className="text-black font-semibold">Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <BottomNav />
    </View>
  );
}



