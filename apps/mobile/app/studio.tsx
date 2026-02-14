import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getDashboardStats, getChannelVideos } from "@/lib/api/user";

export default function StudioScreen() {
  const [stats, setStats] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, videosRes] = await Promise.all([
        getDashboardStats(),
        getChannelVideos(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (videosRes.success) setVideos(videosRes.data || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Studio</Text>
        <Link href="/upload-video" asChild>
          <TouchableOpacity>
            <IconSymbol name="plus.circle.fill" size={28} color="#ff0000" />
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView>
        {/* Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalViews || 0}</Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalVideos || 0}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.totalSubscribers || 0}
              </Text>
              <Text style={styles.statLabel}>Subscribers</Text>
            </View>
          </View>
        )}

        {/* Videos List */}
        <View style={styles.videosSection}>
          <Text style={styles.sectionTitle}>Your Videos</Text>
          {videos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No videos yet</Text>
              <Link href="/upload-video" asChild>
                <TouchableOpacity style={styles.uploadButton}>
                  <Text style={styles.uploadButtonText}>Upload Video</Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            videos.map((video) => (
              <View key={video._id} style={styles.videoItem}>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <Text style={styles.videoStats}>
                    {video.views} views •{" "}
                    {video.isPublished ? "Published" : "Draft"}
                  </Text>
                </View>
                <Link href={`/video/edit/${video._id}`} asChild>
                  <TouchableOpacity>
                    <IconSymbol name="pencil" size={24} color="#666" />
                  </TouchableOpacity>
                </Link>
              </View>
            ))
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
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
  videoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
  },
  videoStats: {
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#ff0000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
