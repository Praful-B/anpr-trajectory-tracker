import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { authApi, setAuthToken } from '../services/api';
import { saveAuth, loadAuth, clearDeviceId } from '../services/auth';
import { getDeviceId } from '../services/auth';

export default function LoginScreen() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCop, setIsCop] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await loadAuth();
      if (user) {
        setIsAuthenticated(true);
        setIsCop(user.role === 'COP');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
    setIsLoading(false);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (isLoginMode) {
        result = await authApi.login({ email, password });
      } else {
        if (!fullName) {
          Alert.alert('Error', 'Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        result = await authApi.register({ fullName, email, password });
      }

      await saveAuth({
        email: result.email,
        role: result.role,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      // Register device for scanner users
      if (result.role === 'VOLUNTEER' || result.role === 'DEVICE') {
        const deviceId = await getDeviceId();
        console.log('Device registered:', deviceId);
      }

      setIsAuthenticated(true);
      setIsCop(result.role === 'COP');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Authentication failed');
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return null; // Navigation will handle routing
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>RAKSHAK</Text>
        <Text style={[styles.subtitle, { color: theme.colors.primary }]}>Mobile Scanner</Text>
      </View>

      <View style={[styles.form, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {isLoginMode ? 'Sign In' : 'Create Account'}
        </Text>

        {!isLoginMode && (
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
            placeholder="Full Name"
            placeholderTextColor={theme.colors.primary}
            value={fullName}
            onChangeText={setFullName}
          />
        )}

        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Email"
          placeholderTextColor={theme.colors.primary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
          placeholder="Password"
          placeholderTextColor={theme.colors.primary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleAuth}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isLoginMode ? 'Sign In' : 'Register'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setIsLoginMode(!isLoginMode)}
        >
          <Text style={[styles.linkText, { color: theme.colors.primary }]}>
            {isLoginMode ? "Don't have an account? Register" : 'Already have an account? Sign in'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.footer, { color: theme.colors.text }]}>
        {isLoginMode ? 'Scan stolen vehicles with the RAKSHAK network' : 'Join the fight against vehicle theft'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    width: '100%',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 16,
    padding: 8,
  },
  linkText: {
    textAlign: 'center',
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
  },
});
