import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { listItems } from '../api';

export default function BrowseScreen({ onBack, onOpenItem }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res: any = await listItems();
      if (res && res.items) setItems(res.items);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>Marketplace</Text>
        <TouchableOpacity onPress={onBack}><Text style={{ color: '#007aff' }}>Close</Text></TouchableOpacity>
      </View>
      <FlatList data={items} keyExtractor={i => String(i.id)} renderItem={({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => onOpenItem && onOpenItem(item)}>
          <Text style={{ fontWeight: '700' }}>{item.title}</Text>
          <Text>{item.description}</Text>
          <Text style={{ marginTop: 6 }}>${item.price}</Text>
        </TouchableOpacity>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  item: { padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8, marginBottom: 10 }
});
