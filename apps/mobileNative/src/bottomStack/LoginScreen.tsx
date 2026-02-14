import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import useColorTheme from '../hooks/useColorTheme';
import { API_BASE_URL } from '../constants/constant';
import { MMKV } from '../other/MMKVstorage';

const LoginScreen = ({ navigation }: any) => {
  const theme = useColorTheme();
  const currentColors = Colors[theme];
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        MMKV.setString('accessToken', data.data.accessToken);
        MMKV.setString('refreshToken', data.data.refreshToken);
        MMKV.setString('user', JSON.stringify(data.data.user));
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        Alert.alert('Login Failed', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentColors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: currentColors.text }]}>
          Welcome Back
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Email
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: currentColors.text, borderColor: currentColors.icon },
            ]}
            placeholder="Enter your email"
            placeholderTextColor={currentColors.icon}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Password
          </Text>
          <View
            style={[
              styles.passwordContainer,
              { borderColor: currentColors.icon },
            ]}
          >
            <TextInput
              style={[styles.passwordInput, { color: currentColors.text }]}
              placeholder="Enter your password"
              placeholderTextColor={currentColors.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={{ color: currentColors.tint }}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentColors.tint }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[styles.buttonText, { color: currentColors.background }]}
            >
              Login
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{ color: currentColors.text }}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.link, { color: currentColors.tint }]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    fontWeight: 'bold',
  },
});

export default LoginScreen;
