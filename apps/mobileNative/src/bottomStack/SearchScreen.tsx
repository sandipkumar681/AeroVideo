import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';
import useColorTheme from '../hooks/useColorTheme';
import { API_BASE_URL } from '../constants/constant';
import VideoCard from '../components/VideoCard';
import { IVideo } from '@aerovideo/types';
import FontAwesome from '@react-native-vector-icons/fontawesome';

const SearchScreen = ({ navigation }: any) => {
  const theme = useColorTheme();
  const currentColors = Colors[theme];
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<IVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setVideos([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setHasSearched(true);
      const response = await fetch(
        `${API_BASE_URL}/videos/search?query=${encodeURIComponent(
          query,
        )}&page=1&limit=10`,
      );
      const data = await response.json();

      if (data.success) {
        setVideos(data.data || []);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Optional: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setVideos([]);
    setHasSearched(false);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentColors.background, paddingTop: insets.top },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: currentColors.icon }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0' },
          ]}
        >
          <FontAwesome name="search" size={20} color={currentColors.icon} />
          <TextInput
            style={[styles.input, { color: currentColors.text }]}
            placeholder="Search videos..."
            placeholderTextColor={currentColors.icon}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <FontAwesome name="times" size={20} color={currentColors.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={currentColors.tint} />
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              onPress={() =>
                navigation.navigate('Video', { videoId: item._id })
              }
            />
          )}
          keyExtractor={item => item._id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            hasSearched && query.trim() ? (
              <View style={styles.centerContainer}>
                <Text style={{ color: currentColors.text }}>
                  No videos found for "{query}"
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 25,
    height: 40,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: 0, // Fix alignment on Android
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  listContent: {
    padding: 10,
  },
});
