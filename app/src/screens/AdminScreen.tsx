import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { getPendingSellers, approveSeller } from '../api';

export default function AdminScreen({ token }: any) {
  const [pending, setPending] = useState<any[]>([]);

  async function load() {
    const res: any = await getPendingSellers(token);
    if (res.pending) setPending(res.pending);
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id: number) {
    const r: any = await approveSeller(token, id, true);
    if (r.ok) {
      Alert.alert('Approved');
      setPending(p => p.filter(x => x.id !== id));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Sellers</Text>
      <FlatList data={pending} keyExtractor={i => String(i.id)} renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={{ flex: 1 }}>{item.email}</Text>
          <Button title="Approve" onPress={() => handleApprove(item.id)} />
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 20 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 12 }, row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 } });
