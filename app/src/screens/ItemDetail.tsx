import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { createOrder } from '../api';

export default function ItemDetail({ item, onBack, token }: any) {
  if (!item) return null;

  const buy = async () => {
    if (!token) return Alert.alert('Not signed in');
    const res: any = await createOrder(token, item.id, 1);
    if (res && res.id) Alert.alert('Order placed', `Order #${res.id}`);
    else Alert.alert('Error', res?.error || 'Failed');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={{ marginVertical: 8 }}>{item.description}</Text>
      <Text style={{ fontWeight: '700' }}>${item.price}</Text>
      <View style={{ height: 20 }} />
      <Button title="Buy" onPress={buy} />
      <View style={{ height: 8 }} />
      <Button title="Back" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 16, flex: 1 }, title: { fontSize: 20, fontWeight: '700' } });
