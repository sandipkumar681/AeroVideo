import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { formatTimeAgo } from "@/utils/formatters";

interface CommentItemProps {
  comment: {
    _id: string;
    content: string;
    createdAt: string;
    owner: {
      userName: string;
      avatar: string;
      fullName: string;
    };
  };
  onDelete?: (commentId: string) => void;
  canDelete?: boolean;
}

export function CommentItem({
  comment,
  onDelete,
  canDelete,
}: CommentItemProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: comment.owner.avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.userName}>{comment.owner.fullName}</Text>
          <Text style={styles.time}>{formatTimeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
        {canDelete && onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(comment._id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: "#666",
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  deleteButton: {
    marginTop: 8,
  },
  deleteText: {
    fontSize: 12,
    color: "#ff0000",
    fontWeight: "600",
  },
});
