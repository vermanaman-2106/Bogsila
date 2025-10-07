import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ShirtsScreen from '../screens/ShirtsScreen';
import TeesScreen from '../screens/TeesScreen';
import BottomsScreen from '../screens/BottomsScreen';
import CoordScreen from '../screens/CoordScreen';
import ExclusivesScreen from '../screens/ExclusivesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import SearchScreen from '../screens/SearchScreen';
import Allproductsscreen from '../screens/Allproductsscreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function MainDrawer() {
  return (
      <Drawer.Navigator
        initialRouteName="HOME"
        screenOptions={{
          headerTitle: () => (
            <Image
              source={require('../assest/header.png')}
              style={{ width: 200, height: 37 }}
              resizeMode="contain"
            />
          ),
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          drawerStyle: { width: 300, backgroundColor: '#000' },
          drawerActiveTintColor: '#ffffff',
          drawerInactiveTintColor: '#b0b0b0',
          drawerActiveBackgroundColor: '#111111',
          drawerItemStyle: { height: 50 },
          drawerLabelStyle: { fontSize: 16 },
        }}
      >
        <Drawer.Screen name="HOME" component={HomeScreen} />
        <Drawer.Screen name="ALL PRODUCTS" component={Allproductsscreen} />
        <Drawer.Screen name="PROFILE" component={ProfileScreen} />
        <Drawer.Screen name="CART" component={CartScreen} />
        <Drawer.Screen name="FAVOURITE" component={FavouritesScreen} />
      </Drawer.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={MainDrawer} />
        {/* Additional screens accessible via navigation but hidden from Drawer */}
        <Stack.Screen
          name="Shirts"
          component={ShirtsScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitle: 'Shirts',
          }}
        />
        <Stack.Screen
          name="Tees"
          component={TeesScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitle: 'Tees',
          }}
        />
        <Stack.Screen
          name="Bottoms"
          component={BottomsScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitle: 'Bottoms',
          }}
        />
        <Stack.Screen
          name="Co-ord"
          component={CoordScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitle: 'Co-ord',
          }}
        />
        <Stack.Screen
          name="Exclusives"
          component={ExclusivesScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitle: 'Exclusives',
          }}
        />
        <Stack.Screen
          name="Favourites"
          component={FavouritesScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitle: 'Favourites',
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitle: 'Search',
          }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitle: 'Product',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


