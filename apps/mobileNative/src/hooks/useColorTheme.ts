import { useColorScheme } from 'react-native';

const useColorTheme = () => {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
};

export default useColorTheme;
