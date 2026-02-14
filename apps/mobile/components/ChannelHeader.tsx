import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

interface ChannelHeaderProps {
  channel: {
    userName: string;
    fullName: string;
    avatar: string;
    coverImage?: string;
    subscribersCount: number;
    isSubscribed: boolean;
  };
  onSubscribe: () => void;
}

export function ChannelHeader({ channel, onSubscribe }: ChannelHeaderProps) {
  return (
    <View style={styles.container}>
      {channel.coverImage && (
        <Image
          source={{ uri: channel.coverImage }}
          style={styles.cover}
          resizeMode="cover"
        />
      )}
      <View style={styles.infoContainer}>
        <Image source={{ uri: channel.avatar }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={styles.fullName}>{channel.fullName}</Text>
          <Text style={styles.userName}>@{channel.userName}</Text>
          <Text style={styles.subscribers}>
            {channel.subscribersCount}{" "}
            {channel.subscribersCount === 1 ? "subscriber" : "subscribers"}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            channel.isSubscribed && styles.subscribedButton,
          ]}
          onPress={onSubscribe}
        >
          <Text
            style={[
              styles.subscribeText,
              channel.isSubscribed && styles.subscribedText,
            ]}
          >
            {channel.isSubscribed ? "Subscribed" : "Subscribe"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  cover: {
    width: "100%",
    height: 120,
    backgroundColor: "#e0e0e0",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 3,
    borderColor: "#fff",
    marginTop: -40,
  },
  textContainer: {
    flex: 1,
  },
  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  subscribers: {
    fontSize: 13,
    color: "#999",
  },
  subscribeButton: {
    backgroundColor: "#ff0000",
    paddingHorizontal: 20,
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
});
