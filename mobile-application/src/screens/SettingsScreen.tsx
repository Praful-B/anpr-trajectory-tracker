import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { clearAuth } from '../services/auth';
import { loadAuth } from '../services/auth';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userInfo, setUserInfo] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const user = await loadAuth();
    setUserInfo(user ? { email: user.email, role: user.role } : null);
    setIsDarkMode(theme.dark);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
        {userInfo && (
          <View style={styles.userInfo}>
            <View style={styles.userRow}>
              <Text style={[styles.userLabel, { color: theme.colors.text, opacity: 0.7 }]}>Email</Text>
              <Text style={[styles.userValue, { color: theme.colors.text }]}>{userInfo.email}</Text>
            </View>
            <View style={styles.userRow}>
              <Text style={[styles.userLabel, { color: theme.colors.text, opacity: 0.7 }]}>Role</Text>
              <View style={[
                styles.roleBadge,
                { backgroundColor: userInfo.role === 'COP' ? '#3b82f6' : '#10b981' }
              ]}>
                <Text style={styles.roleText}>{userInfo.role}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
        <View style={styles.settingRow}>
          <View>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
            <Text style={[styles.settingDescription, { color: theme.colors.text, opacity: 0.6 }]}>
              Use dark theme for the app
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: theme.colors.text, opacity: 0.7 }]}>Version</Text>
          <Text style={[styles.aboutValue, { color: theme.colors.text }]}>1.0.0</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: theme.colors.text, opacity: 0.7 }]}>Build</Text>
          <Text style={[styles.aboutValue, { color: theme.colors.text }]}>Release</Text>
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.footerText, { color: theme.colors.text }]}>
          RAKSHAK - Smart India Hackathon 2026
        </Text>
        <Text style={[styles.footerSubtext, { color: theme.colors.text, opacity: 0.6 }]}>
          Privacy-First Mobile ANPR System
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: '#ef4444' }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  userInfo: {
    gap: 12,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  userLabel: {
    fontSize: 14,
  },
  userValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
