import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { postNotification } from '../api_notifications';

export default function LecturerScreen({ token, onDone }: any) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  async function handlePost() {
    const res: any = await postNotification(title, body, 'Lecturer', token);
    if (res && res.ok) {
      Alert.alert('Posted');
      setTitle(''); setBody('');
      if (onDone) onDone();
    } else {
      Alert.alert('Error', res?.error || 'Failed');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Post Announcement</Text>
      <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Body" value={body} onChangeText={setBody} style={[styles.input, { height: 120 }]} multiline />
      <Button title="Post" onPress={handlePost} />
      <View style={{height:12}} />
      <Button title="Back" onPress={() => onDone && onDone()} />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 20 }, title: { fontSize: 20, fontWeight: '700', marginBottom: 12 }, input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 12 } });
