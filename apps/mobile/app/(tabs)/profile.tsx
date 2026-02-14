import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getCurrentUser, logout } from "@/lib/api/auth";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
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

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.notLoggedIn}>
          <IconSymbol name="person.circle" size={64} color="#ccc" />
          <Text style={styles.notLoggedInText}>Not logged in</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.profileHeader}>
          {user.coverImage && (
            <Image
              source={{ uri: user.coverImage }}
              style={styles.coverImage}
            />
          )}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          </View>
          <Text style={styles.fullName}>{user.fullName}</Text>
          <Text style={styles.userName}>@{user.userName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.menuContainer}>
          <Link
            href={{
              pathname: "/channel/[userName]",
              params: { userName: user.userName },
            }}
            asChild
          >
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol name="person.crop.circle" size={24} color="#000" />
              <Text style={styles.menuText}>My Channel</Text>
              <IconSymbol name="chevron.right" size={20} color="#999" />
            </TouchableOpacity>
          </Link>

          <Link href="/studio" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <IconSymbol name="chart.bar.fill" size={24} color="#000" />
              <Text style={styles.menuText}>Studio</Text>
              <IconSymbol name="chevron.right" size={20} color="#999" />
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <IconSymbol
              name="rectangle.portrait.and.arrow.right"
              size={24}
              color="#ff0000"
            />
            <Text style={[styles.menuText, { color: "#ff0000" }]}>Logout</Text>
          </TouchableOpacity>
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
  notLoggedIn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  profileHeader: {
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  coverImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#e0e0e0",
  },
  avatarContainer: {
    marginTop: -40,
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  fullName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#999",
  },
  menuContainer: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
});
