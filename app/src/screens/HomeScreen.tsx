import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen({ user, onLogout, onAdmin, onNotifications, onRequestSeller, onBrowse, onSellerDashboard }: any) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name || user?.email}</Text>
      <Text style={{ marginBottom: 12 }}>Role: {user?.role}</Text>
      {user?.role === 'admin' || user?.role === 'lecturer' ? (
        <>
          <Button title="Admin: Pending Sellers" onPress={onAdmin} />
        </>
      ) : null}

      {user?.role === 'seller' || user?.role === 'student' ? (
        <>
          <View style={{ height: 8 }} />
          <Button title="Browse Items" onPress={() => onBrowse && onBrowse()} />
          <View style={{ height: 8 }} />
          {user?.role === 'seller' && <Button title="Seller Dashboard" onPress={() => onSellerDashboard && onSellerDashboard()} />}
        </>
      ) : null}

      <View style={{ height: 8 }} />
      <Button title="Announcements" onPress={() => { if (onNotifications) onNotifications(); }} />
      <View style={{ height: 8 }} />
      {user?.role === 'student' && (
        <Button title="Request to become a seller" onPress={() => { if (onRequestSeller) onRequestSeller(); }} />
      )}

      <View style={{ height: 20 }} />
      <Button title="Logout" onPress={onLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 }
});
