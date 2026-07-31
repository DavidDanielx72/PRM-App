import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createItem } from '../api';

export default function CreateItem({ token, onDone }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const submit = async () => {
    if (!title || !price) return Alert.alert('Missing');
    const res: any = await createItem(token, title, description, parseFloat(price));
    if (res && res.id) {
      Alert.alert('Created', `Item ${res.id}`);
      onDone && onDone();
    } else Alert.alert('Error', res?.error || 'Failed');
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
      <TextInput placeholder="Price" value={price} onChangeText={setPrice} style={styles.input} keyboardType="numeric" />
      <Button title="Create" onPress={submit} />
      <View style={{ height: 8 }} />
      <Button title="Cancel" onPress={() => onDone && onDone()} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 16, flex: 1 }, input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 12, borderRadius: 8 } });
