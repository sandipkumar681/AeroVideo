import { useWindowDimensions } from 'react-native';

const useHeightAndWidth = () => {
  const { height, width } = useWindowDimensions();

  return { height, width };
};

export default useHeightAndWidth;
