import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Video from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IVideo } from '@aerovideo/types';
import { Colors } from '../constants/theme';
import useColorTheme from '../hooks/useColorTheme';
import { API_BASE_URL } from '../constants/constant';
import VideoCard from '../components/VideoCard';

const VideoScreen = ({ route, navigation }: any) => {
  const { videoId } = route.params;
  const theme = useColorTheme();
  const currentColors = Colors[theme];
  const insets = useSafeAreaInsets();

  const [video, setVideo] = useState<IVideo | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<IVideo[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const videoRes = await fetch(`${API_BASE_URL}/videos/${videoId}`);
        const videoData = await videoRes.json();

        if (videoData.success) {
          setVideo(videoData.data);
        }

        const relatedRes = await fetch(
          `${API_BASE_URL}/videos/${videoId}/related`,
        );
        const relatedData = await relatedRes.json();
        if (relatedData.success) {
          setRelatedVideos(relatedData.data);
        }

        const commentsRes = await fetch(
          `${API_BASE_URL}/comments/all/${videoId}`,
        );
        const commentsData = await commentsRes.json();
        if (commentsData.success) {
          setComments(commentsData.data);
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  if (loading) {
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

  if (!video) {
    return (
      <View
        style={[
          styles.centerContainer,
          { backgroundColor: currentColors.background },
        ]}
      >
        <Text style={{ color: currentColors.text }}>Video not found</Text>
      </View>
    );
  }

  const ownerName =
    typeof video.owner === 'object' && 'userName' in video.owner
      ? video.owner.userName
      : 'User';

  const ownerAvatar =
    typeof video.owner === 'object' && 'avatar' in video.owner
      ? video.owner.avatar
      : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: video.videoFile }}
          style={styles.video}
          controls={true}
          resizeMode="contain"
          paused={false}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: currentColors.text }]}>
          {video.title}
        </Text>
        <Text style={[styles.stats, { color: currentColors.icon }]}>
          {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
        </Text>

        <View style={styles.ownerContainer}>
          {ownerAvatar ? (
            <Image source={{ uri: ownerAvatar }} style={styles.avatar} />
          ) : (
            <View
              style={[styles.avatar, { backgroundColor: currentColors.icon }]}
            />
          )}
          <Text style={[styles.ownerName, { color: currentColors.text }]}>
            {ownerName}
          </Text>
        </View>

        <Text
          style={[styles.description, { color: currentColors.text }]}
          numberOfLines={isExpanded ? undefined : 3}
        >
          {video.description}
        </Text>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={[styles.readMore, { color: currentColors.text }]}>
            {isExpanded ? 'Read less' : 'Read more'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Related Videos */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
          Related Videos
        </Text>
        <FlatList
          horizontal
          data={relatedVideos}
          renderItem={({ item }) => (
            <View style={{ width: 300, marginRight: 15 }}>
              <VideoCard
                video={item}
                onPress={() => navigation.push('Video', { videoId: item._id })}
              />
            </View>
          )}
          keyExtractor={item => item._id.toString()}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Comments */}
      <View style={[styles.sectionContainer, { paddingBottom: 50 }]}>
        <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
          Comments {comments.length > 0 ? `(${comments.length})` : ''}
        </Text>
        {comments.map((comment, index) => (
          <View key={comment._id || index} style={styles.commentItem}>
            <Text style={[styles.commentUser, { color: currentColors.text }]}>
              {comment.owner?.userName || 'User'}
            </Text>
            <Text style={{ color: currentColors.text }}>{comment.content}</Text>
          </View>
        ))}
        {comments.length === 0 && (
          <Text style={{ color: currentColors.icon }}>No comments yet.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stats: {
    fontSize: 12,
    marginBottom: 10,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  ownerName: {
    fontWeight: '600',
  },
  description: {
    marginTop: 5,
    fontSize: 14,
  },
  readMore: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 5,
  },
  sectionContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentItem: {
    marginBottom: 15,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
});

export default VideoScreen;
