import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getNotifications } from '../api_notifications';

export default function NotificationsScreen() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { (async () => { const r: any = await getNotifications(); setItems(r.notifications || []); })(); }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Announcements</Text>
      <FlatList data={items} keyExtractor={i => String(i.id)} renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text>{item.body}</Text>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 20 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 12 }, row: { marginBottom: 12 }, notifTitle: { fontWeight: '700' } });
