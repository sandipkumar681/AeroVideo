import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { formatDuration, formatViews, formatTimeAgo } from "@/utils/formatters";

interface VideoCardProps {
  video: {
    _id: string;
    title: string;
    thumbnail: string;
    duration: number;
    views: number;
    createdAt: string;
    owner: {
      userName: string;
      avatar: string;
      fullName: string;
    };
  };
}

export function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/video/${video._id}`} asChild>
      <TouchableOpacity style={styles.container}>
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(video.duration)}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Image source={{ uri: video.owner.avatar }} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={styles.channelName}>{video.owner.fullName}</Text>
            <Text style={styles.metadata}>
              {formatViews(video.views)} views •{" "}
              {formatTimeAgo(video.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  thumbnailContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoContainer: {
    flexDirection: "row",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  channelName: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  metadata: {
    fontSize: 12,
    color: "#999",
  },
});
