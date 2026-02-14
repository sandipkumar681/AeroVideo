import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { IVideo } from '@aerovideo/types';
import { Colors } from '../constants/theme';
import useColorTheme from '../hooks/useColorTheme';
import VideoCard from '../components/VideoCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../constants/constant';

const HomeScreen = ({ navigation }: any) => {
  const theme = useColorTheme();
  const currentColors = Colors[theme];
  const insets = useSafeAreaInsets();

  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/videos/published`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data.videos)) {
        setVideos(data.data.videos);
      } else {
        setVideos([]);
        console.error('Unexpected API response structure:', data);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVideos();
  };

  const renderItem = ({ item }: { item: IVideo }) => (
    <VideoCard
      video={item}
      onPress={() => navigation.navigate('Video', { videoId: item._id })}
    />
  );

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: currentColors.background },
        ]}
      >
        <ActivityIndicator size="large" color={currentColors.tint} />
      </View>
    );
  }

  if (error && !refreshing && videos.length === 0) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: currentColors.background },
        ]}
      >
        <Text style={{ color: currentColors.text }}>{error}</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={item => item._id.toString()}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={currentColors.tint}
          />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={{ color: currentColors.text }}>No videos found</Text>
          </View>
        }
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});
