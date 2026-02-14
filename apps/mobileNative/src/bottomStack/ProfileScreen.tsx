import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Colors } from '../constants/theme';
import useColorTheme from '../hooks/useColorTheme';
import { MMKV } from '../other/MMKVstorage';
import { API_BASE_URL } from '../constants/constant';

const ProfileScreen = ({ navigation }: any) => {
  const theme = useColorTheme();
  const currentColors = Colors[theme];
  const isFocused = useIsFocused();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (isFocused) {
      const userData = MMKV.getString('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    }
  }, [isFocused]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await fetch(`${API_BASE_URL}/users/logout`, {
              method: 'GET',
            });
          } catch (error) {
            console.error('Logout API error:', error);
          } finally {
            MMKV.removeItem('accessToken');
            MMKV.removeItem('refreshToken');
            MMKV.removeItem('user');
            setUser(null);
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: currentColors.background },
        ]}
      >
        <Text style={[styles.title, { color: currentColors.text }]}>
          Profile
        </Text>
        <Text style={{ color: currentColors.text, marginBottom: 20 }}>
          Please login to view your profile
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentColors.text }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text
              style={[styles.buttonText, { color: currentColors.background }]}
            >
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineButton, { borderColor: currentColors.tint }]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text
              style={[styles.outlineButtonText, { color: currentColors.tint }]}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <Text style={[styles.title, { color: currentColors.text }]}>Profile</Text>

      <View style={styles.profileInfo}>
        {user.coverImage && (
          <Image
            source={{ uri: user.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={[styles.avatar, { borderColor: currentColors.background }]}
            />
          ) : (
            <View
              style={[
                styles.avatarplaceholder,
                {
                  backgroundColor: currentColors.icon,
                  borderColor: currentColors.background,
                },
              ]}
            />
          )}
        </View>
        <Text style={[styles.username, { color: currentColors.text }]}>
          {user.fullName}
        </Text>
        <Text style={{ color: currentColors.icon }}>@{user.userName}</Text>
        <Text style={{ color: currentColors.icon }}>{user.email}</Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: 'red' }]}
        onPress={handleLogout}
      >
        <Text style={{ color: 'red', fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  outlineButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
  },
  outlineButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  coverImage: {
    width: '100%',
    height: 150,
    marginBottom: -50,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  avatarplaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    marginTop: 'auto',
    marginBottom: 20,
  },
});
