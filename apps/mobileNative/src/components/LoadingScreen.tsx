import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import useColorTheme from '../hooks/useColorTheme';

import { Colors } from '../constants/theme';

const LoadingScreen = () => {
  const theme = useColorTheme();
  const currentColors = Colors[theme];

  return (
    <View
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <View style={styles.contentContainer}>
        {/* Placeholder for Icon/Logo - Using styled text as no image assets available */}
        <Text style={[styles.logoText, { color: currentColors.text }]}>
          AeroVideo
        </Text>

        <ActivityIndicator
          size="large"
          color={currentColors.tint}
          style={styles.spinner}
        />

        <Text style={[styles.loadingText, { color: currentColors.icon }]}>
          Loading...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 30,
    letterSpacing: 2,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default LoadingScreen;
