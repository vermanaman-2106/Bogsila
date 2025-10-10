import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import AuthModal from '../components/AuthModal';
import { getTokens, getUser, clearAuth, storeUser } from '../utils/authStorage';
import { BASE_URL } from '../config/api';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [authVisible, setAuthVisible] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [editingName, setEditingName] = useState('');
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Load user data and tokens from AsyncStorage on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Fetch user profile when tokens are available
  useEffect(() => {
    if (tokens?.access) {
      fetchUserProfile();
    }
  }, [tokens]);

  async function loadStoredAuth() {
    try {
      const storedTokens = await getTokens();
      const storedUser = await getUser();
      
      console.log('Loading stored auth - Tokens:', storedTokens);
      console.log('Loading stored auth - User:', storedUser);
      console.log('User name:', storedUser?.name, 'User phone:', storedUser?.phone);
      
      if (storedTokens && storedUser) {
        setTokens(storedTokens);
        setUser(storedUser);
        console.log('Stored auth loaded successfully');
      } else {
        console.log('No stored auth found');
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    }
  }

  async function fetchUserProfile() {
    if (!tokens?.access) return;
    
    // Check if token is expired
    try {
      const tokenPayload = JSON.parse(atob(tokens.access.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenPayload.exp < currentTime) {
        console.log('Token is expired, clearing auth');
        setUser(null);
        setTokens(null);
        await clearAuth();
        return;
      }
    } catch (error) {
      console.log('Invalid token format, clearing auth');
      setUser(null);
      setTokens(null);
      await clearAuth();
      return;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/api/me`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched user from server:', data.user);
        console.log('Server user name:', data.user?.name, 'Server user phone:', data.user?.phone);
        setUser(data.user);
        setAddresses(data.user.addresses || []);
        // Save updated user data to AsyncStorage
        await storeUser(data.user);
      } else if (response.status === 401) {
        console.log('Unauthorized, clearing auth');
        setUser(null);
        setTokens(null);
        await clearAuth();
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }

  async function handleLogout() {
    try {
      if (!tokens?.access) {
        setUser(null);
        setTokens(null);
        setAddresses([]);
        await clearAuth();
        return;
      }
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      setUser(null);
      setTokens(null);
      setAddresses([]);
      await clearAuth();
    } catch (e: any) {
      Alert.alert('Logout', 'You have been signed out.');
      setUser(null);
      setTokens(null);
      setAddresses([]);
      await clearAuth();
    }
  }

  async function updateProfile(field: string, value: string) {
    if (!value.trim()) {
      Alert.alert('Error', `Please enter a valid ${field}`);
      return;
    }

    try {
      const profileData = { [field]: value.trim() };
      console.log(`Sending ${field} update to API:`, profileData);
      
      const response = await fetch(`${BASE_URL}/api/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify(profileData),
      });
      
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('API response data:', responseData);
        
        console.log('Current user before update:', user);
        const updatedUser = { ...user, [field]: value.trim() };
        console.log('Updated user after change:', updatedUser);
        setUser(updatedUser);
        await storeUser(updatedUser); // Save to AsyncStorage
        console.log(`${field} updated and saved to AsyncStorage:`, updatedUser);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        const errorData = await response.text();
        console.log('API error response:', errorData);
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  }

  function openAddressModal(address?: Address) {
    if (address) {
      setEditingAddress(address);
      setAddressForm({
        name: address.name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      });
    } else {
      setEditingAddress(null);
      setAddressForm({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
      });
    }
    setShowAddressModal(true);
  }

  async function saveAddress() {
    try {
      const newAddresses = editingAddress
        ? addresses.map(addr => addr.id === editingAddress.id ? { ...addressForm, id: editingAddress.id, isDefault: editingAddress.isDefault } : addr)
        : [...addresses, { ...addressForm, id: Date.now().toString(), isDefault: addresses.length === 0 }];

      const addressData = { addresses: newAddresses };
      console.log('Sending address update to API:', addressData);

      const response = await fetch(`${BASE_URL}/api/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify(addressData),
      });

      console.log('API response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('API response data:', responseData);
        
        setAddresses(newAddresses);
        // Update user data with new addresses and save to AsyncStorage
        console.log('Current user before address update:', user);
        const updatedUser = { ...user, addresses: newAddresses };
        console.log('Updated user after address change:', updatedUser);
        setUser(updatedUser);
        await storeUser(updatedUser);
        setShowAddressModal(false);
        setAddressForm({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
        Alert.alert('Success', 'Address saved successfully');
      } else {
        const errorData = await response.text();
        console.log('API error response:', errorData);
        Alert.alert('Error', 'Failed to save address');
      }
    } catch (error) {
      console.error('Address save error:', error);
      Alert.alert('Error', 'Failed to save address');
    }
  }

  async function updatePhoneNumber() {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      const phoneData = { phone: phoneNumber.trim() };
      console.log('Sending phone update to API:', phoneData);
      
      const response = await fetch(`${BASE_URL}/api/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify(phoneData),
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('API response data:', responseData);
        
        console.log('Current user before phone update:', user);
        const updatedUser = { ...user, phone: phoneNumber.trim() };
        console.log('Updated user after phone change:', updatedUser);
        setUser(updatedUser);
        await storeUser(updatedUser); // Save to AsyncStorage
        console.log('Phone number updated and saved to AsyncStorage:', updatedUser);
        setShowPhoneModal(false);
        setPhoneNumber('');
        Alert.alert('Success', 'Phone number updated successfully');
      } else {
        const errorData = await response.text();
        console.log('API error response:', errorData);
        Alert.alert('Error', 'Failed to update phone number');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update phone number');
    }
  }

  async function deleteAddress(addressId: string) {
    try {
      const newAddresses = addresses.filter(addr => addr.id !== addressId);
      const addressData = { addresses: newAddresses };
      console.log('Sending address delete to API:', addressData);

      const response = await fetch(`${BASE_URL}/api/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify(addressData),
      });

      console.log('API response status:', response.status);

      if (response.ok) {
        const responseData = await response.json();
        console.log('API response data:', responseData);
        
        setAddresses(newAddresses);
        // Update user data with new addresses and save to AsyncStorage
        console.log('Current user before address delete:', user);
        const updatedUser = { ...user, addresses: newAddresses };
        console.log('Updated user after address delete:', updatedUser);
        setUser(updatedUser);
        await storeUser(updatedUser);
        Alert.alert('Success', 'Address deleted successfully');
      } else {
        const errorData = await response.text();
        console.log('API error response:', errorData);
        Alert.alert('Error', 'Failed to delete address');
      }
    } catch (error) {
      console.error('Address delete error:', error);
      Alert.alert('Error', 'Failed to delete address');
    }
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {user ? (
          <View className="pb-20">
            {/* Profile Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-gray-700 rounded-full items-center justify-center mb-4">
                <Ionicons name="person" size={40} color="white" />
              </View>
              <Text className="text-white text-2xl font-bold">{user?.name || 'User'}</Text>
              <Text className="text-gray-400">{user?.email}</Text>
            </View>

            {/* Profile Actions */}
            <View className="mb-8">
              <Text className="text-white text-lg font-semibold mb-4">Profile</Text>
              
              <View className="bg-gray-900 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-300">Name</Text>
                  <TouchableOpacity onPress={() => {
                    if (!editMode) {
                      setEditingName(user.name || '');
                    }
                    setEditMode(!editMode);
                  }}>
                    <Ionicons name="pencil" size={20} color="white" />
                  </TouchableOpacity>
                </View>
                {editMode ? (
                  <View className="flex-row items-center">
                    <TextInput
                      className="flex-1 text-white bg-gray-800 rounded-lg px-3 py-2 mr-2"
                      value={editingName}
                      onChangeText={setEditingName}
                      placeholder="Enter name"
                      placeholderTextColor="#9CA3AF"
                    />
                    <TouchableOpacity
                      className="bg-white rounded-lg px-3 py-2"
                      onPress={() => {
                        updateProfile('name', editingName);
                        setEditMode(false);
                      }}
                    >
                      <Text className="text-black font-semibold">Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text className="text-white">{user.name || 'Not set'}</Text>
                )}
              </View>

              <TouchableOpacity 
                className="bg-gray-900 rounded-2xl p-4 mb-4"
                onPress={() => {
                  setPhoneNumber(user.phone || '');
                  setShowPhoneModal(true);
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-300 mb-2">Phone</Text>
                    <Text className="text-white">{user.phone || 'Not set'}</Text>
                  </View>
                  <Ionicons name="pencil-outline" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <View className="bg-gray-900 rounded-2xl p-4">
                <Text className="text-gray-300 mb-2">Email</Text>
                <Text className="text-white">{user.email}</Text>
              </View>
            </View>

            {/* Addresses Section */}
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-semibold">Addresses</Text>
                <TouchableOpacity
                  className="bg-white rounded-lg px-4 py-2"
                  onPress={() => openAddressModal()}
                >
                  <Text className="text-black font-semibold">Add Address</Text>
                </TouchableOpacity>
              </View>

              {addresses.length === 0 ? (
                <View className="bg-gray-900 rounded-2xl p-6 items-center">
                  <Ionicons name="location-outline" size={40} color="#9CA3AF" />
                  <Text className="text-gray-400 mt-2">No addresses added</Text>
                  <Text className="text-gray-500 text-sm mt-1">Add your first address</Text>
                </View>
              ) : (
                addresses.map((address) => (
                  <View key={address.id} className="bg-gray-900 rounded-2xl p-4 mb-3">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <Text className="text-white font-semibold">{address.name}</Text>
                          {address.isDefault && (
                            <View className="bg-white rounded-full px-2 py-1 ml-2">
                              <Text className="text-black text-xs font-semibold">Default</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-gray-300 text-sm mb-1">{address.phone}</Text>
                        <Text className="text-gray-300 text-sm mb-1">{address.address}</Text>
                        <Text className="text-gray-300 text-sm">
                          {address.city}, {address.state} - {address.pincode}
                        </Text>
                      </View>
                      <View className="flex-row">
                        <TouchableOpacity
                          className="mr-2"
                          onPress={() => openAddressModal(address)}
                        >
                          <Ionicons name="pencil" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteAddress(address.id)}>
                          <Ionicons name="trash" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Account Actions */}
            <View className="mb-8">
              <Text className="text-white text-lg font-semibold mb-4">Account</Text>
              
              <TouchableOpacity className="bg-gray-900 rounded-2xl p-4 mb-3" onPress={() => (navigation as any).navigate('FavouritesStack')}>
                <View className="flex-row items-center">
                  <Ionicons name="heart-outline" size={24} color="white" />
                  <Text className="text-white ml-3">Favorites</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" className="ml-auto" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-gray-900 rounded-2xl p-4 mb-3" onPress={() => (navigation as any).navigate('Orders')}>
                <View className="flex-row items-center">
                  <Ionicons name="bag-outline" size={24} color="white" />
                  <Text className="text-white ml-3">Orders</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" className="ml-auto" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-gray-900 rounded-2xl p-4">
                <View className="flex-row items-center">
                  <Ionicons name="settings-outline" size={24} color="white" />
                  <Text className="text-white ml-3">Settings</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" className="ml-auto" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Sign Out */}
            <TouchableOpacity
              className="bg-red-600 rounded-2xl p-4 mb-8"
              onPress={handleLogout}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="log-out-outline" size={24} color="white" />
                <Text className="text-white font-semibold ml-3">Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white text-xl font-semibold mb-2">Welcome</Text>
            <Text className="text-gray-400 mb-4">Sign up or log in to manage your account</Text>
            <TouchableOpacity className="rounded-2xl bg-white px-6 py-3" onPress={() => setAuthVisible(true)}>
              <Text className="text-black font-semibold">Login / Sign up</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Address Modal */}
      <Modal visible={showAddressModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-black">
          <View className="flex-row items-center justify-between p-6 border-b border-gray-800">
            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
              <Text className="text-white text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold">
              {editingAddress ? 'Edit Address' : 'Add Address'}
            </Text>
            <TouchableOpacity onPress={saveAddress}>
              <Text className="text-white text-lg font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-6">
            <View className="mb-4">
              <Text className="text-white mb-2">Full Name</Text>
              <TextInput
                className="bg-gray-900 rounded-lg px-4 py-3 text-white"
                value={addressForm.name}
                onChangeText={(text) => setAddressForm({...addressForm, name: text})}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <Text className="text-white mb-2">Phone Number</Text>
              <TextInput
                className="bg-gray-900 rounded-lg px-4 py-3 text-white"
                value={addressForm.phone}
                onChangeText={(text) => setAddressForm({...addressForm, phone: text})}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            <View className="mb-4">
              <Text className="text-white mb-2">Address</Text>
              <TextInput
                className="bg-gray-900 rounded-lg px-4 py-3 text-white"
                value={addressForm.address}
                onChangeText={(text) => setAddressForm({...addressForm, address: text})}
                placeholder="Enter street address"
                placeholderTextColor="#9CA3AF"
                multiline
              />
            </View>

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-white mb-2">City</Text>
                <TextInput
                  className="bg-gray-900 rounded-lg px-4 py-3 text-white"
                  value={addressForm.city}
                  onChangeText={(text) => setAddressForm({...addressForm, city: text})}
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-white mb-2">State</Text>
                <TextInput
                  className="bg-gray-900 rounded-lg px-4 py-3 text-white"
                  value={addressForm.state}
                  onChangeText={(text) => setAddressForm({...addressForm, state: text})}
                  placeholder="State"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-white mb-2">Pincode</Text>
              <TextInput
                className="bg-gray-900 rounded-lg px-4 py-3 text-white"
                value={addressForm.pincode}
                onChangeText={(text) => setAddressForm({...addressForm, pincode: text})}
                placeholder="Enter pincode"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Phone Number Edit Modal */}
      <Modal visible={showPhoneModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-black">
          <View className="flex-row items-center justify-between p-6 border-b border-gray-800">
            <TouchableOpacity onPress={() => setShowPhoneModal(false)}>
              <Text className="text-white text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold">Edit Phone Number</Text>
            <TouchableOpacity onPress={updatePhoneNumber}>
              <Text className="text-white text-lg font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="mb-4">
              <Text className="text-white mb-2">Phone Number</Text>
              <TextInput
                className="bg-gray-900 rounded-lg px-4 py-3 text-white"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                autoFocus
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <AuthModal
        visible={authVisible}
        onClose={() => setAuthVisible(false)}
        onSuccess={async (payload) => {
          setUser(payload.user);
          setTokens(payload.tokens);
          // Save user data to AsyncStorage
          await storeUser(payload.user);
        }}
      />

      <BottomNav />
    </View>
  );
}

