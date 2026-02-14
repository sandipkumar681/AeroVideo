import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../constants/theme';
import useColorTheme from '../hooks/useColorTheme';
import { API_BASE_URL } from '../constants/constant';
import { MMKV } from '../other/MMKVstorage';
import { useIsFocused } from '@react-navigation/native';

const UploadScreen = ({ navigation }: any) => {
  const theme = useColorTheme();
  const currentColors = Colors[theme];
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [video, setVideo] = useState<any>(null);
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isFocused) {
      const token = MMKV.getString('accessToken');
      setIsAuthenticated(!!token);
    }
  }, [isFocused]);

  const pickVideo = async () => {
    const result = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 1,
    });

    if (result.assets && result.assets.length > 0) {
      setVideo(result.assets[0]);
    }
  };

  const pickThumbnail = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.assets && result.assets.length > 0) {
      setThumbnail(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!title || !description || !video || !thumbnail) {
      Alert.alert(
        'Error',
        'Please fill all required fields and select video/thumbnail',
      );
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('isPublished', String(isPublished));
      formData.append('tag', tags);

      formData.append('videoFile', {
        uri: video.uri,
        type: video.type,
        name: video.fileName || 'video.mp4',
      });

      formData.append('thumbnail', {
        uri: thumbnail.uri,
        type: thumbnail.type,
        name: thumbnail.fileName || 'thumbnail.jpg',
      });

      const token = MMKV.getString('accessToken');

      const response = await fetch(`${API_BASE_URL}/videos/upload-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success || response.ok) {
        Alert.alert('Success', 'Video uploaded successfully', [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setDescription('');
              setTags('');
              setVideo(null);
              setThumbnail(null);
              setIsPublished(true);
              navigation.navigate('MainTabs', { screen: 'Home' });
            },
          },
        ]);
      } else {
        Alert.alert('Upload Failed', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated && isFocused) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: currentColors.background },
        ]}
      >
        <Text style={[styles.message, { color: currentColors.text }]}>
          Please login to upload videos
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentColors.tint }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text
            style={[styles.buttonText, { color: currentColors.background }]}
          >
            Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          Upload Video
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Video File
          </Text>
          <TouchableOpacity
            onPress={pickVideo}
            style={[styles.picker, { borderColor: currentColors.icon }]}
          >
            {video ? (
              <Text style={{ color: currentColors.text }}>
                {video.fileName || 'Video Selected'}
              </Text>
            ) : (
              <Text style={{ color: currentColors.icon }}>Select Video</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Thumbnail
          </Text>
          <TouchableOpacity
            onPress={pickThumbnail}
            style={[styles.imagePicker, { borderColor: currentColors.icon }]}
          >
            {thumbnail ? (
              <Image
                source={{ uri: thumbnail.uri }}
                style={styles.previewImage}
              />
            ) : (
              <Text style={{ color: currentColors.icon }}>
                Select Thumbnail
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Title
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: currentColors.text, borderColor: currentColors.icon },
            ]}
            placeholder="Enter title"
            placeholderTextColor={currentColors.icon}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: currentColors.text,
                borderColor: currentColors.icon,
                height: 100,
              },
            ]}
            placeholder="Enter description"
            placeholderTextColor={currentColors.icon}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Tags (comma separated)
          </Text>
          <TextInput
            style={[
              styles.input,
              { color: currentColors.text, borderColor: currentColors.icon },
            ]}
            placeholder="music, gaming, tutorial"
            placeholderTextColor={currentColors.icon}
            value={tags}
            onChangeText={setTags}
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: currentColors.text }]}>
            Publish immediately
          </Text>
          <Switch
            trackColor={{ false: '#767577', true: currentColors.tint }}
            thumbColor={isPublished ? '#f4f3f4' : '#f4f3f4'}
            onValueChange={setIsPublished}
            value={isPublished}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentColors.tint }]}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Upload Video</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default UploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
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
  picker: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  imagePicker: {
    height: 150,
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
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});
