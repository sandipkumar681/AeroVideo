import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { IVideo } from '@aerovideo/types';
import { Colors } from '../constants/theme';
import useColorTheme from '../hooks/useColorTheme';

interface VideoCardProps {
  video: IVideo;
  onPress?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPress }) => {
  const theme = useColorTheme();
  const currentColors = Colors[theme];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (!views && views !== 0) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const ownerName =
    typeof video.owner === 'object' && 'userName' in video.owner
      ? video.owner.userName
      : 'User';

  const ownerAvatar =
    typeof video.owner === 'object' && 'avatar' in video.owner
      ? video.owner.avatar
      : null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Thumbnail Section */}
      <View style={styles.thumbnailContainer}>
        {video.thumbnail ? (
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Text style={{ color: currentColors.text }}>No Thumbnail</Text>
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(video.duration)}
          </Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <View style={styles.avatarContainer}>
          {ownerAvatar ? (
            <Image source={{ uri: ownerAvatar }} style={styles.avatar} />
          ) : (
            <View
              style={[styles.avatar, { backgroundColor: currentColors.icon }]}
            />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { color: currentColors.text }]}
            numberOfLines={2}
          >
            {video.title}
          </Text>
          <Text style={[styles.subtitle, { color: currentColors.icon }]}>
            {ownerName} • {formatViews(video.views)} views •{' '}
            {formatDate(video.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginBottom: 10,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
});

export default VideoCard;
