import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function UploadVideoScreen() {
  const handlePickVideo = () => {
    Alert.alert(
      "Info",
      "Video upload feature requires additional setup with Expo ImagePicker and permissions"
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Video</Text>
      </View>

      <View style={styles.content}>
        <IconSymbol name="arrow.up.circle.fill" size={64} color="#ccc" />
        <Text style={styles.title}>Upload Your Video</Text>
        <Text style={styles.subtitle}>
          Select a video from your device to upload
        </Text>

        <TouchableOpacity style={styles.button} onPress={handlePickVideo}>
          <IconSymbol name="folder.fill" size={24} color="#fff" />
          <Text style={styles.buttonText}>Select Video</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: This feature requires additional implementation with Expo
          ImagePicker and file upload handling.
        </Text>
      </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff0000",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 32,
  },
});
