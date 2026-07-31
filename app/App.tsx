import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AdminScreen from './src/screens/AdminScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import LecturerScreen from './src/screens/LecturerScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import ItemDetail from './src/screens/ItemDetail';
import SellerDashboard from './src/screens/SellerDashboard';
import CreateItem from './src/screens/CreateItem';
import { loadToken, saveToken, clearToken } from './src/storage';
import { me, requestSeller } from './src/api';

type AuthState = null | { token: string; user: any };

export default function App() {
  const [screen, setScreen] = useState<'login' | 'register' | 'home' | 'admin' | 'browse' | 'item' | 'seller' | 'create' | 'notifications' | 'lecturer'>('login');
  const [auth, setAuth] = useState<AuthState>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  function handleLogin(data: any) {
    if (!data || data.error) return Alert.alert('Login error', data?.error || 'Unknown');
    setAuth({ token: data.token, user: data.user });
    saveToken(data.token);
    setScreen('home');
  }

  function handleRegister(data: any) {
    if (!data || data.error) return Alert.alert('Register error', data?.error || 'Unknown');
    setAuth({ token: data.token, user: data.user });
    saveToken(data.token);
    setScreen('home');
  }

  function handleLogout() {
    setAuth(null);
    setScreen('login');
    clearToken();
  }

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (!token) { setLoading(false); return; }
      const res: any = await me(token);
      if (res && res.user) {
        setAuth({ token, user: res.user });
        setScreen('home');
      }
      setLoading(false);
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {loading && <ActivityIndicator style={{marginTop:40}} />}
      {screen === 'login' && (
        <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen('register')} />
      )}
      {screen === 'register' && (
        <RegisterScreen onRegister={handleRegister} onBack={() => setScreen('login')} />
      )}
      {screen === 'home' && auth && (
        <HomeScreen
          user={auth.user}
          onLogout={handleLogout}
          onAdmin={() => setScreen('admin')}
          onNotifications={() => setScreen('notifications')}
          onRequestSeller={async () => {
            const res: any = await requestSeller(auth.token);
            if (res && res.ok) Alert.alert('Requested', 'Seller request submitted');
            else Alert.alert('Error', res?.error || 'Failed');
          }}
          onBrowse={() => setScreen('browse')}
          onSellerDashboard={() => setScreen('seller')}
        />
      )}
      {screen === 'notifications' && <NotificationsScreen />}
      {screen === 'lecturer' && auth && <LecturerScreen token={auth.token} onDone={() => setScreen('home')} />}
      {screen === 'browse' && (
        <BrowseScreen onBack={() => setScreen('home')} onOpenItem={(item: any) => { setSelectedItem(item); setScreen('item'); }} />
      )}
      {screen === 'item' && selectedItem && auth && (
        <ItemDetail item={selectedItem} token={auth.token} onBack={() => setScreen('browse')} />
      )}
      {screen === 'seller' && auth && (
        <SellerDashboard token={auth.token} user={auth.user} onBack={() => setScreen('home')} onCreate={() => setScreen('create')} />
      )}
      {screen === 'create' && auth && (
        <CreateItem token={auth.token} onDone={() => setScreen('seller')} />
      )}
      {screen === 'admin' && auth && auth.user?.role && auth.user.role === 'admin' && (
        <AdminScreen token={auth.token} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
