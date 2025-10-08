import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, FlatList } from 'react-native';
import BottomNav from '../components/BottomNav';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);

  function handleSearch() {
    // Placeholder search: echoes the query into a mock list
    const items = ['Shirt', 'Tees', 'Bottoms', 'Co-ord', 'Exclusives'];
    const filtered = items.filter((i) => i.toLowerCase().includes(query.trim().toLowerCase()));
    setResults(filtered);
  }

  return (
    <View className="flex-1 bg-black px-6 pt-4">
      <View className="flex-row items-center rounded-2xl bg-white px-3 py-2">
        <Ionicons name="search-outline" size={22} color="#666" />
        <TextInput
          placeholder="Search products..."
          placeholderTextColor="#8a8a8a"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          className="flex-1 text-black ml-2"
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch}>
          <Text className="text-black font-medium">Search</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        className="mt-4"
        data={results}
        keyExtractor={(item) => item}
        ListEmptyComponent={() => (
          <Text className="text-gray-300 mt-6">Try searching for "Shirt", "Tees"...</Text>
        )}
        renderItem={({ item }) => (
          <View className="py-3 border-b border-gray-800">
            <Text className="text-white text-base">{item}</Text>
          </View>
        )}
      />
      <BottomNav />
    </View>
  );
}


