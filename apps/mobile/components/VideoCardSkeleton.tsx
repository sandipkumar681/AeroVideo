import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export function VideoCardSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.thumbnailSkeleton} />
      <View style={styles.infoContainer}>
        <View style={styles.avatarSkeleton} />
        <View style={styles.textContainer}>
          <View style={styles.titleSkeleton} />
          <View style={styles.metadataSkeleton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  thumbnailSkeleton: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
  },
  infoContainer: {
    flexDirection: "row",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  avatarSkeleton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e0e0e0",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleSkeleton: {
    height: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 8,
    width: "90%",
  },
  metadataSkeleton: {
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    width: "60%",
  },
});
