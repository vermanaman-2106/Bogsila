import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  size?: string | null;
  quantity: number;
};

const CART_KEY = 'cart_items_v1';

export async function getCart(): Promise<CartItem[]> {
  try {
    const raw = await AsyncStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

export async function setCart(items: CartItem[]): Promise<void> {
  await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
}

export async function addToCart(item: CartItem): Promise<void> {
  const cart = await getCart();
  const idx = cart.findIndex(
    (x) => x.productId === item.productId && (x.size || null) === (item.size || null)
  );
  if (idx >= 0) {
    cart[idx] = { ...cart[idx], quantity: cart[idx].quantity + item.quantity };
  } else {
    cart.push(item);
  }
  await setCart(cart);
}

export async function removeFromCart(productId: string, size?: string | null): Promise<void> {
  const cart = await getCart();
  const filtered = cart.filter((x) => !(x.productId === productId && (x.size || null) === (size || null)));
  await setCart(filtered);
}

export async function updateQuantity(productId: string, size: string | null, quantity: number): Promise<void> {
  const cart = await getCart();
  const idx = cart.findIndex((x) => x.productId === productId && (x.size || null) === (size || null));
  if (idx >= 0) {
    cart[idx] = { ...cart[idx], quantity: Math.max(1, quantity) };
    await setCart(cart);
  }
}

export async function clearCart(): Promise<void> {
  await setCart([]);
}


