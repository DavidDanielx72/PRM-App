import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { login } from '../api';

export default function LoginScreen({ onLogin, onGoRegister }: any) {
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<'student' | 'seller' | 'lecturer'>('student');
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      const data: any = await login(email, password);
      if (data.error) return Alert.alert('Login failed', data.error);
      onLogin(data);
    } catch (err: any) {
      Alert.alert('Network error', String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {['student', 'seller', 'lecturer'].map(r => (
          <TouchableOpacity key={r} onPress={() => setRole(r as any)} style={[styles.roleBtn, role === r && styles.roleSelected]}>
            <Text style={{ color: role === r ? 'white' : 'black' }}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} keyboardType="email-address" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" style={styles.input} secureTextEntry />
      <Button title={loading ? 'Signing...' : 'Sign In'} onPress={handle} />
      <View style={{ height: 12 }} />
      <Button title="Create account" onPress={onGoRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 12, borderRadius: 8 }
  ,roleBtn: { padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginRight: 8 }
  ,roleSelected: { backgroundColor: '#007aff', borderColor: '#007aff' }
});
