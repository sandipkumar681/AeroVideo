import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { VideoCard } from "@/components/VideoCard";
import { searchVideos } from "@/lib/api/video";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await searchVideos(searchQuery);
      if (response.success) {
        setResults(response.data || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSearchSubmit = () => {
    handleSearch(query);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search videos..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setResults([]);
              setHasSearched(false);
            }}
          >
            <IconSymbol name="xmark.circle.fill" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {!hasSearched ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="magnifyingglass" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Search for videos</Text>
        </View>
      ) : loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={({ item }) => <VideoCard video={item} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol
                name="exclamationmark.triangle"
                size={64}
                color="#ccc"
              />
              <Text style={styles.emptyText}>
                No results found for "{query}"
              </Text>
            </View>
          }
        />
      )}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#000",
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
});
