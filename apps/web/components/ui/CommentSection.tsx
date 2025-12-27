"use client";

import React, { useState } from "react";
import { MessageSquare, Edit2, Trash2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { addComment, updateComment, deleteComment } from "@/lib/api/commentApi";
import { useAppSelector } from "@/redux-toolkit/hooks";

interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    userName: string;
    fullName?: string;
    avatar?: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CommentSectionProps {
  videoId: string;
  initialComments: Comment[];
}

export function CommentSection({
  videoId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, userDetails } = useAppSelector(
    (state) => state.logInReducer
  );

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const seconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await addComment(videoId, newComment.trim());

      // Add new comment to the list with current user details for immediate display
      const newCommentWithUser = {
        ...response.data,
        user: {
          _id: userDetails?._id || "",
          userName: userDetails?.userName || "Unknown",
          fullName: userDetails?.fullName,
          avatar: userDetails?.avatar,
        },
      };
      setComments([newCommentWithUser, ...comments]);
      setNewComment("");
    } catch (err: any) {
      setError(err.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || !isLoggedIn) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await updateComment(commentId, editContent.trim());

      // Update comment in the list
      setComments(
        comments.map((c) =>
          c._id === commentId ? { ...c, content: editContent.trim() } : c
        )
      );
      setEditingCommentId(null);
      setEditContent("");
    } catch (err: any) {
      setError(err.message || "Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!isLoggedIn) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setError(null);

    try {
      await deleteComment(commentId);

      // Remove comment from the list
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err: any) {
      setError(err.message || "Failed to delete comment");
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const hasAlreadyCommented = comments.some(
    (comment) => comment.user?._id === userDetails?._id
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-xl font-semibold">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </h2>
      </div>

      {/* Add Comment Form (Authenticated Users Only) */}
      {isLoggedIn ? (
        !hasAlreadyCommented ? (
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full min-h-[100px] p-3 bg-muted rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className={cn(
                  "ml-auto flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-all",
                  !newComment.trim() || isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary/90"
                )}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Posting..." : "Comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-muted/30 rounded-xl text-center text-muted-foreground border border-dashed border-border">
            You have already commented on this video. You can edit or delete
            your existing comment below.
          </div>
        )
      ) : (
        <div className="p-4 bg-muted rounded-xl text-center text-muted-foreground">
          Please log in to add a comment
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div
            key="no-comments"
            className="text-center py-8 text-muted-foreground"
          >
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="p-4 bg-muted/50 rounded-xl space-y-3"
            >
              {/* Comment Header */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative h-8 w-8 rounded-full bg-muted overflow-hidden shrink-0">
                  {comment.user?.avatar ? (
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.userName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">
                      {comment.user?.userName?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                {/* User Info and Actions */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {comment.user?.fullName ||
                          comment.user?.userName ||
                          "Unknown User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.createdAt)}
                      </p>
                    </div>

                    {/* Action Buttons (Own Comments Only) */}
                    {userDetails?._id === comment.user?._id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(comment)}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                          aria-label="Edit comment"
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  {editingCommentId === comment._id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full min-h-[80px] p-2 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                        disabled={isSubmitting}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditComment(comment._id)}
                          disabled={!editContent.trim() || isSubmitting}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-muted text-foreground rounded text-sm font-medium hover:bg-muted/80"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
