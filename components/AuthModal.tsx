import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { storeTokens, storeUser } from '../utils/authStorage';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: (payload: { user: any; tokens: { access: string; refresh: string } }) => void;
};

const BASE_URL = 'http://localhost:3001';

export default function AuthModal({ visible, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    try {
      setLoading(true);
      setError(null);
      const url = `${BASE_URL}/api/auth/${mode === 'login' ? 'login' : 'register'}`;
      const body: any = { email, password };
      if (mode === 'register') body.name = name;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Something went wrong');
        return;
      }
      
      // Store tokens and user data in AsyncStorage
      await storeTokens(json.tokens);
      await storeUser(json.user);
      
      onSuccess(json);
      onClose();
      setEmail('');
      setPassword('');
      setName('');
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="w-full rounded-2xl bg-[#111111] p-5 border border-gray-700">
          <Text className="text-white text-xl font-semibold mb-3">{mode === 'login' ? 'Log in' : 'Sign up'}</Text>

          {mode === 'register' ? (
            <TextInput
              placeholder="Name"
              placeholderTextColor="#8a8a8a"
              value={name}
              onChangeText={setName}
              className="rounded-xl bg-white px-3 py-2 mb-3"
              style={{ color: '#000' }}
            />
          ) : null}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#8a8a8a"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="rounded-xl bg-white px-3 py-2 mb-3"
            style={{ color: '#000' }}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#8a8a8a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="rounded-xl bg-white px-3 py-2"
            style={{ color: '#000' }}
          />

          {error ? <Text className="text-red-400 mt-3">{error}</Text> : null}

          <View className="flex-row mt-4">
            <TouchableOpacity className="flex-1 mr-2 rounded-xl bg-white py-3 items-center" onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text className="text-black font-semibold">{mode === 'login' ? 'Log in' : 'Sign up'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 ml-2 rounded-xl border border-gray-600 py-3 items-center" onPress={onClose}>
              <Text className="text-white font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-4">
            <Text className="text-gray-400 mr-1">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</Text>
            <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
              <Text className="text-white underline">{mode === 'login' ? 'Sign up' : 'Log in'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


