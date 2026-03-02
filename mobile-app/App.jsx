/**
 * FinTrack Mobile — React Native / Expo App
 *
 * Setup:
 *   cd mobile-app && npm install
 *
 * Run locally:
 *   npm run android     (requires Android Studio / emulator)
 *
 * Build for Play Store:
 *   npm install -g eas-cli
 *   eas login
 *   npm run build:prod           → generates .aab for Play Store upload
 *   npm run submit:android       → auto-submits to Play Store (needs google-service-account.json)
 *
 * Environment:
 *   Copy .env.example → .env and fill in SUPABASE values.
 */

import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, StatusBar
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// ── Supabase client ───────────────────────────────────────────────────────────

const SUPABASE_URL  = 'https://eocagbloalvidegyxvpv.supabase.co';
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const ExpoSecureStoreAdapter = {
  getItem:    (key) => SecureStore.getItemAsync(key),
  setItem:    (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── Theme ─────────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#0C0A07', card: '#111008', border: '#1F1A10',
  gold: '#D97706', goldLight: '#FBBF24', text: '#FFFBF0',
  muted: '#A8977A', dim: '#6B5E4B',
};

// ── Screens ───────────────────────────────────────────────────────────────────

function OverviewScreen({ user }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Good morning 👋</Text>
        <Text style={styles.sub}>{user?.email ?? 'Welcome back'}</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>$0.00</Text>
          <Text style={styles.balanceSub}>Connect your account to sync data</Text>
        </View>

        <View style={styles.row}>
          {[{ label: 'Income', color: '#10B981' }, { label: 'Expenses', color: '#EF4444' }].map(item => (
            <View key={item.label} style={[styles.statCard, { borderColor: item.color + '30' }]}>
              <Text style={[styles.statLabel, { color: item.color }]}>{item.label}</Text>
              <Text style={styles.statAmount}>$0.00</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TransactionsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Transactions</Text>
        <Text style={styles.emptyText}>No transactions yet. Add your first one!</Text>
      </View>
    </SafeAreaView>
  );
}

function BudgetsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Budgets</Text>
        <Text style={styles.emptyText}>No budgets set for this month.</Text>
      </View>
    </SafeAreaView>
  );
}

function ProfileScreen({ onSignOut }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Profile</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Auth screen ───────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    // In production: use proper email/password or OAuth
    // For demo, attempt anon sign-in
    const { data, error: authError } = await supabase.auth.signInAnonymously();
    if (authError) {
      setError(authError.message);
    } else {
      onAuth(data.user);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.content, styles.authContent]}>
        <Text style={styles.logo}>FinTrack</Text>
        <Text style={styles.tagline}>Your money tells a story.{'\n'}We help you write a better one.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleDemoLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#FFFBF0" />
            : <Text style={styles.primaryBtnText}>Get Started Free</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Navigation ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcons({ route, focused }) {
  const icons = { Overview: '📊', Transactions: '💳', Budgets: '📋', Profile: '👤' };
  return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
}

function MainTabs({ user, onSignOut }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: (props) => <TabIcons route={route} {...props} />,
        tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.goldLight,
        tabBarInactiveTintColor: COLORS.dim,
        headerStyle: { backgroundColor: COLORS.bg },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="Overview">{() => <OverviewScreen user={user} />}</Tab.Screen>
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="Profile">{() => <ProfileScreen onSignOut={onSignOut} />}</Tab.Screen>
    </Tab.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setInitializing(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <NavigationContainer>
        {user
          ? <MainTabs user={user} onSignOut={() => supabase.auth.signOut()} />
          : <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Auth">
                {() => <AuthScreen onAuth={setUser} />}
              </Stack.Screen>
            </Stack.Navigator>
        }
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: COLORS.bg },
  center:        { justifyContent: 'center', alignItems: 'center' },
  content:       { padding: 20 },
  authContent:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  logo:          { fontSize: 42, fontWeight: '900', color: COLORS.goldLight, letterSpacing: -1 },
  tagline:       { fontSize: 16, color: COLORS.muted, textAlign: 'center', lineHeight: 24 },
  greeting:      { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  sub:           { fontSize: 14, color: COLORS.muted, marginBottom: 24 },
  pageTitle:     { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  emptyText:     { color: COLORS.muted, fontSize: 14 },
  balanceCard:   { backgroundColor: COLORS.card, borderRadius: 20, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  balanceLabel:  { color: COLORS.muted, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  balanceAmount: { color: COLORS.text, fontSize: 40, fontWeight: '900', marginVertical: 4 },
  balanceSub:    { color: COLORS.dim, fontSize: 12 },
  row:           { flexDirection: 'row', gap: 12 },
  statCard:      { flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1 },
  statLabel:     { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  statAmount:    { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  primaryBtn:    { backgroundColor: COLORS.gold, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 16, minWidth: 220, alignItems: 'center' },
  primaryBtnText:{ color: COLORS.text, fontWeight: '800', fontSize: 16 },
  signOutBtn:    { marginTop: 24, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#EF4444' + '40', alignItems: 'center' },
  signOutText:   { color: '#EF4444', fontWeight: '700' },
  errorText:     { color: '#EF4444', fontSize: 13, textAlign: 'center' },
});
