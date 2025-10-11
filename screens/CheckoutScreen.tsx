import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  FlatList,
  Image,
  TextInput
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { getTokens, getUser } from '../utils/authStorage';
import { getCart, clearCart } from '../utils/cartStorage';
import { BASE_URL } from '../config/api';

// Razorpay integration - temporarily disabled for Expo Go
// const RazorpayCheckout = require('react-native-razorpay');

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  size?: string | null;
  quantity: number;
}

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

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [tokens, setTokens] = useState<{ access: string; refresh: string } | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      // Load cart items
      const cart = await getCart();
      setCartItems(cart);
      
      // Load user data
      const storedTokens = await getTokens();
      const storedUser = await getUser();
      
      if (storedTokens && storedUser) {
        setTokens(storedTokens);
        setUser(storedUser);
        
        // Fetch user addresses
        const response = await fetch(`${BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${storedTokens.access}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          setAddresses(data.user.addresses || []);
          // Set default address
          const defaultAddr = data.user.addresses?.find((addr: Address) => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddress(defaultAddr);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load checkout data:', error);
      Alert.alert('Error', 'Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  async function handlePayment() {
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address');
      return;
    }

    if (!user || !tokens?.access) {
      Alert.alert('Login Required', 'Please log in to place an order');
      return;
    }

    if (paymentMethod === 'cod') {
      await processCODOrder();
      return;
    }

    try {
      setLoading(true);

      // Create Razorpay order
      const orderResponse = await fetch(`${BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.access}`,
        },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            userId: user._id,
            address: selectedAddress,
            items: cartItems.length,
          },
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const { order, key } = await orderResponse.json();

      // Configure Razorpay options
      const options = {
        description: `Bogsila Order - ${cartItems.length} items`,
        image: 'https://bogsila-backend.onrender.com/logo.png', // Update with your actual logo URL
        currency: 'INR',
        key: key,
        amount: order.amount,
        order_id: order.id,
        name: 'Bogsila',
        prefill: {
          email: user.email,
          contact: selectedAddress.phone,
          name: selectedAddress.name,
        },
        theme: { color: '#000000' },
      };

      // Open Razorpay checkout - temporarily disabled for Expo Go
      // RazorpayCheckout.open(options)
      
      // Temporary mock payment for Expo Go
      Alert.alert(
        'Payment Mock',
        'This is a mock payment for Expo Go. In production, Razorpay will be enabled.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setLoading(false);
            },
          },
          {
            text: 'Pay Now',
            onPress: async () => {
              try {
                // Mock successful payment
                Alert.alert('Success', 'Payment completed! (Mock)');
                await processSuccessfulPayment({}, order.id);
                // Clear cart and navigate
                clearCart();
                navigation.goBack();
              } catch (error) {
                console.log('Mock Payment Error:', error);
                Alert.alert('Payment Failed', 'Mock payment failed');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment');
      setLoading(false);
    }
  }

  async function processSuccessfulPayment(paymentData: any, orderId: string) {
    try {
      // Save order to database
      const orderResponse = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          amount: total,
          currency: 'INR',
          items: cartItems,
          status: 'paid',
          notes: {
            address: selectedAddress,
            paymentMethod: 'razorpay',
          },
        }),
      });

      if (orderResponse.ok) {
        // Clear cart
        await clearCart();
        
        Alert.alert(
          'Order Placed Successfully!',
          `Your order has been confirmed. Order ID: ${orderId}`,
          [
            {
              text: 'View Orders',
              onPress: () => navigation.navigate('Orders' as never),
            },
            {
              text: 'Continue Shopping',
              onPress: () => navigation.navigate('Home' as never),
            },
          ]
        );
      } else {
        throw new Error('Failed to save order');
      }
    } catch (error) {
      console.error('Order processing error:', error);
      Alert.alert('Error', 'Payment successful but failed to save order. Please contact support.');
    }
  }

  async function processCODOrder() {
    try {
      setLoading(true);

      // Save COD order to database
      const orderResponse = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          items: cartItems,
          status: 'pending',
          notes: {
            address: selectedAddress,
            paymentMethod: 'cod',
          },
        }),
      });

      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        
        // Clear cart
        await clearCart();
        
        Alert.alert(
          'Order Placed Successfully!',
          `Your COD order has been confirmed. Order ID: ${orderData._id}`,
          [
            {
              text: 'View Orders',
              onPress: () => navigation.navigate('Orders' as never),
            },
            {
              text: 'Continue Shopping',
              onPress: () => navigation.navigate('Home' as never),
            },
          ]
        );
      } else {
        throw new Error('Failed to save order');
      }
    } catch (error) {
      console.error('COD order error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function renderCartItem({ item }: { item: CartItem }) {
    return (
      <View className="bg-gray-900 rounded-2xl p-4 mb-3 flex-row">
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            style={{ width: 60, height: 60, borderRadius: 8 }} 
          />
        ) : (
          <View style={{ width: 60, height: 60 }} className="bg-gray-800 rounded-lg" />
        )}
        
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold" numberOfLines={2}>
            {item.name}
          </Text>
          {item.size && (
            <Text className="text-gray-400 text-sm">Size: {item.size}</Text>
          )}
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-white font-bold">₹{item.price}</Text>
            <Text className="text-gray-400">Qty: {item.quantity}</Text>
          </View>
        </View>
      </View>
    );
  }

  function renderAddress({ item }: { item: Address }) {
    const isSelected = selectedAddress?.id === item.id;
    
    return (
      <TouchableOpacity
        className={`p-4 rounded-2xl mb-3 border ${
          isSelected ? 'border-white bg-white/10' : 'border-gray-700 bg-gray-900'
        }`}
        onPress={() => setSelectedAddress(item)}
        activeOpacity={0.8}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className="text-white font-semibold">{item.name}</Text>
              {item.isDefault && (
                <View className="bg-white rounded-full px-2 py-1 ml-2">
                  <Text className="text-black text-xs font-semibold">Default</Text>
                </View>
              )}
            </View>
            <Text className="text-gray-300 text-sm mb-1">{item.phone}</Text>
            <Text className="text-gray-300 text-sm mb-1">{item.address}</Text>
            <Text className="text-gray-300 text-sm">
              {item.city}, {item.state} - {item.pincode}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading && cartItems.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="text-white mt-4">Loading checkout...</Text>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <View className="w-24 h-24 bg-gray-800 rounded-full items-center justify-center mb-6">
          <Ionicons name="bag-outline" size={40} color="#9CA3AF" />
        </View>
        <Text className="text-white text-xl font-semibold mb-2">Your cart is empty</Text>
        <Text className="text-gray-400 text-center mb-8">
          Add some items to your cart to proceed with checkout
        </Text>
        <TouchableOpacity
          className="bg-white rounded-2xl px-8 py-4"
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text className="text-black font-semibold text-lg">Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View className="mb-6">
          <Text className="text-white text-xl font-semibold mb-4">Order Summary</Text>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => `${item.productId}-${index}`}
            scrollEnabled={false}
          />
        </View>

        {/* Delivery Address */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-xl font-semibold">Delivery Address</Text>
            <TouchableOpacity
              className="bg-white rounded-lg px-4 py-2"
              onPress={() => navigation.navigate('ProfileStack' as never)}
            >
              <Text className="text-black font-semibold">Manage</Text>
            </TouchableOpacity>
          </View>

          {addresses.length === 0 ? (
            <View className="bg-gray-900 rounded-2xl p-6 items-center">
              <Ionicons name="location-outline" size={40} color="#9CA3AF" />
              <Text className="text-gray-400 mt-2 text-center">No addresses found</Text>
              <Text className="text-gray-500 text-sm mt-1 text-center">
                Add an address to continue
              </Text>
            </View>
          ) : (
            <FlatList
              data={addresses}
              renderItem={renderAddress}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Payment Method */}
        <View className="mb-6">
          <Text className="text-white text-xl font-semibold mb-4">Payment Method</Text>
          
          <TouchableOpacity
            className={`p-4 rounded-2xl mb-3 border ${
              paymentMethod === 'razorpay' ? 'border-white bg-white/10' : 'border-gray-700 bg-gray-900'
            }`}
            onPress={() => setPaymentMethod('razorpay')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="card" size={24} color="#10B981" />
                <Text className="text-white font-semibold ml-3">Online Payment</Text>
              </View>
              {paymentMethod === 'razorpay' && (
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              )}
            </View>
            <Text className="text-gray-400 text-sm mt-1 ml-11">
              Credit/Debit Card, UPI, Net Banking
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`p-4 rounded-2xl border ${
              paymentMethod === 'cod' ? 'border-white bg-white/10' : 'border-gray-700 bg-gray-900'
            }`}
            onPress={() => setPaymentMethod('cod')}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="cash" size={24} color="#F59E0B" />
                <Text className="text-white font-semibold ml-3">Cash on Delivery</Text>
              </View>
              {paymentMethod === 'cod' && (
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              )}
            </View>
            <Text className="text-gray-400 text-sm mt-1 ml-11">
              Pay when your order arrives
            </Text>
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View className="bg-gray-900 rounded-2xl p-4 mb-6">
          <Text className="text-white text-lg font-semibold mb-4">Order Summary</Text>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Subtotal</Text>
            <Text className="text-white">₹{subtotal.toFixed(2)}</Text>
          </View>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Shipping</Text>
            <Text className="text-white">₹{shipping.toFixed(2)}</Text>
          </View>
          
          <View className="border-t border-gray-700 pt-2 mt-2">
            <View className="flex-row justify-between">
              <Text className="text-white font-bold text-lg">Total</Text>
              <Text className="text-white font-bold text-lg">₹{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="px-6 pb-24 pt-4 bg-black border-t border-gray-800">
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center ${
            !selectedAddress || loading
              ? 'bg-gray-600'
              : 'bg-white'
          }`}
          onPress={handlePayment}
          disabled={!selectedAddress || loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#000" />
              <Text className="text-black font-bold text-lg ml-2">
                {paymentMethod === 'cod' ? 'Placing Order...' : 'Processing Payment...'}
              </Text>
            </View>
          ) : (
            <Text className="text-black font-bold text-lg">
              {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay ₹' + total.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <BottomNav />
    </View>
  );
}
