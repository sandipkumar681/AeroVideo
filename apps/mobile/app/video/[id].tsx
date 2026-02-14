import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, Link } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { VideoCard } from "@/components/VideoCard";
import { CommentItem } from "@/components/CommentItem";
import { formatViews, formatTimeAgo } from "@/utils/formatters";
import {
  getVideoById,
  getRelatedVideos,
  toggleVideoLike,
  getVideoComments,
  addComment,
} from "@/lib/api/video";
import { toggleSubscription } from "@/lib/api/user";

const { width } = Dimensions.get("window");

export default function VideoDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [video, setVideo] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    loadVideoData();
  }, [id]);

  const loadVideoData = async () => {
    try {
      setLoading(true);
      const [videoRes, relatedRes, commentsRes] = await Promise.all([
        getVideoById(id as string),
        getRelatedVideos(id as string),
        getVideoComments(id as string),
      ]);

      if (videoRes.success) setVideo(videoRes.data);
      if (relatedRes.success) setRelatedVideos(relatedRes.data || []);
      if (commentsRes.success) setComments(commentsRes.data || []);
    } catch (error) {
      console.error("Error loading video:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await toggleVideoLike(id as string);
      setVideo((prev: any) => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleSubscribe = async () => {
    try {
      await toggleSubscription(video.owner._id);
      setVideo((prev: any) => ({
        ...prev,
        isSubscribed: !prev.isSubscribed,
        subscriberCount: prev.isSubscribed
          ? prev.subscriberCount - 1
          : prev.subscriberCount + 1,
      }));
    } catch (error) {
      console.error("Error toggling subscription:", error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await addComment(id as string, commentText);
      if (response.success) {
        setComments((prev) => [response.data, ...prev]);
        setCommentText("");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add comment");
    }
  };

  if (loading || !video) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        {/* Video Player Placeholder */}
        <View style={styles.videoPlayer}>
          <Text style={styles.videoPlayerText}>Video Player</Text>
          <Text style={styles.videoTitle}>{video.title}</Text>
        </View>

        {/* Video Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{video.title}</Text>
          <Text style={styles.metadata}>
            {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <IconSymbol
                name={video.isLiked ? "hand.thumbsup.fill" : "hand.thumbsup"}
                size={24}
                color={video.isLiked ? "#ff0000" : "#000"}
              />
              <Text style={styles.actionText}>{video.likes || 0}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Channel Info */}
        <View style={styles.channelSection}>
          <Link href={`/channel/${video.owner.userName}`} asChild>
            <TouchableOpacity style={styles.channelInfo}>
              <Text style={styles.channelName}>{video.owner.fullName}</Text>
              <Text style={styles.subscriberCount}>
                {video.subscriberCount || 0} subscribers
              </Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            style={[
              styles.subscribeButton,
              video.isSubscribed && styles.subscribedButton,
            ]}
            onPress={handleSubscribe}
          >
            <Text
              style={[
                styles.subscribeText,
                video.isSubscribed && styles.subscribedText,
              ]}
            >
              {video.isSubscribed ? "Subscribed" : "Subscribe"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <TouchableOpacity
          style={styles.descriptionSection}
          onPress={() => setShowDescription(!showDescription)}
        >
          <Text
            style={styles.description}
            numberOfLines={showDescription ? undefined : 3}
          >
            {video.description}
          </Text>
          <Text style={styles.showMore}>
            {showDescription ? "Show less" : "Show more"}
          </Text>
        </TouchableOpacity>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>

          <View style={styles.addComment}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity onPress={handleAddComment}>
              <IconSymbol name="paperplane.fill" size={24} color="#ff0000" />
            </TouchableOpacity>
          </View>

          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </View>

        {/* Related Videos */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Related Videos</Text>
          {relatedVideos.map((relatedVideo) => (
            <VideoCard key={relatedVideo._id} video={relatedVideo} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayer: {
    width: width,
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayerText: {
    color: "#fff",
    fontSize: 18,
  },
  videoTitle: {
    color: "#fff",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  metadata: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  channelSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  subscriberCount: {
    fontSize: 13,
    color: "#666",
  },
  subscribeButton: {
    backgroundColor: "#ff0000",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  subscribedButton: {
    backgroundColor: "#e0e0e0",
  },
  subscribeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  subscribedText: {
    color: "#606060",
  },
  descriptionSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  showMore: {
    fontSize: 14,
    color: "#0a7ea4",
    marginTop: 8,
    fontWeight: "600",
  },
  commentsSection: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  addComment: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  relatedSection: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
});
