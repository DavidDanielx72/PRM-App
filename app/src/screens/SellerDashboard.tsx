import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getItem } from '../api';

export default function SellerDashboard({ token, user, onBack, onCreate }: any) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      // simple fetch of items and filter by seller client-side (db supports getItemsBySeller server-side but no public endpoint)
      const resp: any = await fetch('http://10.0.2.2:4000/api/items');
      const data = await resp.json();
      const mine = (data.items || []).filter((i: any) => i.sellerId === user.id);
      setItems(mine);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>Seller Dashboard</Text>
        <TouchableOpacity onPress={onBack}><Text style={{ color: '#007aff' }}>Close</Text></TouchableOpacity>
      </View>
      <Button title="Create Item" onPress={onCreate} />
      <FlatList data={items} keyExtractor={i => String(i.id)} renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={{ fontWeight: '700' }}>{item.title}</Text>
          <Text>${item.price}</Text>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 16, flex: 1 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 12 }, item: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10 } });
