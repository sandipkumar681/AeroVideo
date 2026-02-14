import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { ChannelHeader } from "@/components/ChannelHeader";
import { VideoCard } from "@/components/VideoCard";
import { getUserChannel } from "@/lib/api/user";
import { toggleSubscription } from "@/lib/api/user";

export default function ChannelScreen() {
  const { userName } = useLocalSearchParams();
  const [channel, setChannel] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannel();
  }, [userName]);

  const loadChannel = async () => {
    try {
      const response = await getUserChannel(userName as string);
      if (response.success) {
        setChannel(response.data);
        setVideos(response.data.videos || []);
      }
    } catch (error) {
      console.error("Error loading channel:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      await toggleSubscription(channel._id);
      setChannel((prev: any) => ({
        ...prev,
        isSubscribed: !prev.isSubscribed,
        subscribersCount: prev.isSubscribed
          ? prev.subscribersCount - 1
          : prev.subscribersCount + 1,
      }));
    } catch (error) {
      console.error("Error toggling subscription:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!channel) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text>Channel not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <ChannelHeader channel={channel} onSubscribe={handleSubscribe} />

        <View style={styles.videosSection}>
          <Text style={styles.sectionTitle}>Videos</Text>
          {videos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No videos yet</Text>
            </View>
          ) : (
            videos.map((video) => <VideoCard key={video._id} video={video} />)
          )}
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
  videosSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
