import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../constants/theme';
import useColorTheme from '../hooks/useColorTheme';
import { API_BASE_URL } from '../constants/constant';

const RegisterScreen = ({ navigation }: any) => {
  const theme = useColorTheme();
  const currentColors = Colors[theme];
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [avatar, setAvatar] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter email to send OTP');
      return;
    }

    try {
      setOtpLoading(true);
      const response = await fetch(`${API_BASE_URL}/send-email`, {
        // Assuming send-email endpoint based on userApi.ts
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ToCreateProfile: true }),
      });
      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent to your email');
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP error:', error);
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const pickImage = async (setImage: any) => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    if (!fullName || !userName || !email || !password || !otp) {
      Alert.alert('Validation Error', 'All fields are required');
      return;
    }

    if (!avatar) {
      Alert.alert('Error', 'Avatar is required');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('userName', userName);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('otp', otp);

      formData.append('avatar', {
        uri: avatar.uri,
        type: avatar.type,
        name: avatar.fileName || 'avatar.jpg',
      });

      if (coverImage) {
        formData.append('coverImage', {
          uri: coverImage.uri,
          type: coverImage.type,
          name: coverImage.fileName || 'cover.jpg',
        });
      }

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Account created successfully', [
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert(
          'Registration Failed',
          data.message || 'Something went wrong',
        );
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: 40 },
        ]}
      >
        <Text style={[styles.title, { color: currentColors.text }]}>
          Create Account
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Full Name
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: currentColors.text, borderColor: currentColors.icon },
            ]}
            placeholder="Full Name"
            placeholderTextColor={currentColors.icon}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Username
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: currentColors.text, borderColor: currentColors.icon },
            ]}
            placeholder="Username"
            placeholderTextColor={currentColors.icon}
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Email
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: currentColors.text, borderColor: currentColors.icon },
            ]}
            placeholder="Email"
            placeholderTextColor={currentColors.icon}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.smallButton, { borderColor: currentColors.tint }]}
            onPress={handleSendOtp}
            disabled={otpLoading || otpSent}
          >
            {otpLoading ? (
              <ActivityIndicator size="small" color={currentColors.tint} />
            ) : (
              <Text style={{ color: currentColors.tint }}>
                {otpSent ? 'OTP Sent' : 'Send OTP'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Password
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: currentColors.text, borderColor: currentColors.icon },
            ]}
            placeholder="Password"
            placeholderTextColor={currentColors.icon}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>OTP</Text>
          <TextInput
            style={[
              styles.input,
              { color: currentColors.text, borderColor: currentColors.icon },
            ]}
            placeholder="Enter OTP"
            placeholderTextColor={currentColors.icon}
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Avatar
          </Text>
          <TouchableOpacity
            onPress={() => pickImage(setAvatar)}
            style={[styles.imagePicker, { borderColor: currentColors.icon }]}
          >
            {avatar ? (
              <Image source={{ uri: avatar.uri }} style={styles.previewImage} />
            ) : (
              <Text style={{ color: currentColors.icon }}>
                Tap to select avatar
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Cover Image (Optional)
          </Text>
          <TouchableOpacity
            onPress={() => pickImage(setCoverImage)}
            style={[styles.imagePicker, { borderColor: currentColors.icon }]}
          >
            {coverImage ? (
              <Image
                source={{ uri: coverImage.uri }}
                style={styles.previewImage}
              />
            ) : (
              <Text style={{ color: currentColors.icon }}>
                Tap to select cover image
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentColors.tint }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={{ color: currentColors.text }}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.link, { color: currentColors.tint }]}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
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
  smallButton: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
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
  imagePicker: {
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default RegisterScreen;
