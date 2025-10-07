import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';

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
  const route = useRoute<any>();
  const item: Product = route.params?.item || {};

  const title = item.name || item.title || item.productName || 'Product';
  const price = item.price || item.amount || item.mrp;
  const img = item.image || item.imageUrl || item.thumbnail || item.img;
  const desc = item.description || '';

  const sizeOptions = (item as any)?.sizes || ['S', 'M', 'L', 'XL'];
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 140 }}>
      <View className="rounded-3xl overflow-hidden bg-white">
        {img ? (
          <Image source={{ uri: img }} style={{ width: '100%', height: 360 }} resizeMode="cover" />
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
          onPress={() => Alert.alert('Added to Favourites', title)}
          activeOpacity={0.9}
        >
          <Text className="text-black font-semibold">Favourite</Text>
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
        className="items-center justify-center rounded-2xl bg-white py-3 mb-10"
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
      </ScrollView>
      <BottomNav />
    </View>
  );
}


