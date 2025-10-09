import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import BottomNav from '../components/BottomNav';
import { getTokens } from '../utils/authStorage';
import { BASE_URL } from '../config/api';

type Order = {
  _id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  items?: Array<{ productId?: string; name?: string; size?: string; price?: number }>;
};

export default function OrderHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const tokens = await getTokens();
        if (!tokens?.access) {
          setOrders([]);
          setLoading(false);
          return;
        }
        const res = await fetch(`${BASE_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        if (!res.ok) {
          const text = await res.text();
          setError(text || 'Failed to load orders');
          setOrders([]);
          setLoading(false);
          return;
        }
        const json = await res.json();
        const items: Order[] = Array.isArray(json.items) ? json.items : [];
        setOrders(items);
      } catch (e: any) {
        setError(e?.message || 'Failed to load orders');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator color="#fff" />
        <Text className="text-white mt-3">Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-white text-center">{error}</Text>
        <BottomNav />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <View className="flex-1 px-6 pt-6 pb-36">
        <Text className="text-white text-2xl font-semibold mb-4">Your Orders</Text>
        {orders.length === 0 ? (
          <View className="items-center justify-center mt-16">
            <Text className="text-gray-400">You have no orders yet.</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(o, idx) => String(o?._id || idx)}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item }) => {
              const created = item.createdAt ? new Date(item.createdAt) : null;
              return (
                <View className="bg-gray-900 rounded-2xl p-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-white font-semibold">₹{item.amount}</Text>
                    <Text className="text-gray-400 text-xs">{item.status || 'paid'}</Text>
                  </View>
                  <Text className="text-gray-400 text-xs mb-2">{created ? created.toLocaleString() : ''}</Text>
                  {Array.isArray(item.items) && item.items.length ? (
                    <View>
                      {item.items.slice(0, 3).map((it, i) => (
                        <Text key={i} className="text-gray-300 text-sm" numberOfLines={1}>
                          {it.name || it.productId} {it.size ? `(Size: ${it.size})` : ''}
                        </Text>
                      ))}
                      {item.items.length > 3 ? (
                        <Text className="text-gray-500 text-xs mt-1">+{item.items.length - 3} more items</Text>
                      ) : null}
                    </View>
                  ) : null}
                  <TouchableOpacity className="mt-3">
                    <Text className="text-white">View details</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
      <BottomNav />
    </View>
  );
}


