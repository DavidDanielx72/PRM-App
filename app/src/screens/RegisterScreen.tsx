import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { register } from '../api';

export default function RegisterScreen({ onRegister, onBack }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try {
      const data: any = await register(email, password, role, name);
      if (data.error) return Alert.alert('Register failed', data.error);
      onRegister(data);
    } catch (err: any) {
      Alert.alert('Network error', String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} />
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" style={styles.input} keyboardType="email-address" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" style={styles.input} secureTextEntry />
      <View style={{ marginBottom: 12 }}>
        <Text style={{ marginBottom: 6 }}>Role</Text>
        <View style={{ flexDirection: 'row' }}>
          {['student', 'seller', 'lecturer'].map(r => (
            <TouchableOpacity key={r} onPress={() => setRole(r)} style={[styles.roleBtn, role === r && styles.roleSelected]}>
              <Text style={{ color: role === r ? 'white' : 'black' }}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Button title={loading ? 'Creating...' : 'Create account'} onPress={handle} />
      <View style={{ height: 12 }} />
      <Button title="Back" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 12, borderRadius: 8 }
  ,roleBtn: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginRight: 8 }
  ,roleSelected: { backgroundColor: '#007aff', borderColor: '#007aff' }
});
