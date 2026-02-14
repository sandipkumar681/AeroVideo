import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function LibraryScreen() {
  const menuItems = [
    { icon: "clock.fill", title: "History", href: "/history" },
    { icon: "heart.fill", title: "Liked Videos", href: "/liked-videos" },
    {
      icon: "square.and.arrow.up.fill",
      title: "Upload Video",
      href: "/upload-video",
    },
    { icon: "chart.bar.fill", title: "Studio", href: "/studio" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
      </View>

      <ScrollView>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href as any} asChild>
              <TouchableOpacity style={styles.menuItem}>
                <IconSymbol name={item.icon as any} size={24} color="#000" />
                <Text style={styles.menuText}>{item.title}</Text>
                <IconSymbol name="chevron.right" size={20} color="#999" />
              </TouchableOpacity>
            </Link>
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
  header: {
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
