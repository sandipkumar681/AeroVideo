import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text } from 'react-native';
import LoadingScreen from './components/LoadingScreen';
import { MMKV } from './other/MMKVstorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import useColorTheme from './hooks/useColorTheme';
import { Colors } from './constants/theme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './bottomStack/HomeScreen';
import SearchScreen from './bottomStack/SearchScreen';
import UploadScreen from './bottomStack/UploadScreen';
import ProfileScreen from './bottomStack/ProfileScreen';
import VideoScreen from './bottomStack/VideoScreen';
import LoginScreen from './bottomStack/LoginScreen';
import RegisterScreen from './bottomStack/RegisterScreen';
import {
  FontAwesome,
  FontAwesomeIconName,
} from '@react-native-vector-icons/fontawesome';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const theme = useColorTheme();
  const currentColors = Colors[theme];
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: FontAwesomeIconName = 'circle';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === 'Upload') {
            iconName = 'cloud-upload';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: currentColors.tint,
        tabBarInactiveTintColor: currentColors.icon,
        tabBarStyle: {
          height: 70,
          paddingHorizontal: 10,
          backgroundColor: currentColors.background,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          textAlign: 'center',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Video" component={VideoScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

const App = () => {
  const [loading, setLoading] = useState(true);
  const theme = useColorTheme();
  const currentColors = Colors[theme];

  useEffect(() => {
    const accessToken = MMKV.getString('accessToken');
    console.log(accessToken);
    // const refreshToken = MMKV.getString('refreshToken');
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentColors.background }]}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    height: '100%',
    width: '100%',
  },
});
