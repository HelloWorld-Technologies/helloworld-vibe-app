import { StyleSheet } from 'react-native';
import { Pagination } from 'react-native-reanimated-carousel';
import type { SharedValue } from 'react-native-reanimated';

import palette from '@/constants/palette';

const DOT_SIZE = 6;
const ACTIVE_DOT_WIDTH = 24;
const DOT_GAP = 6;

type CarouselPaginationProps<T extends object> = {
  progress: SharedValue<number>;
  data: T[];
  onPress: (index: number) => void;
  dotColor?: string;
  activeDotColor?: string;
};

export function CarouselPagination<T extends object>({
  progress,
  data,
  onPress,
  dotColor = palette.gray[300],
  activeDotColor = palette.gray[800],
}: CarouselPaginationProps<T>) {
  // Pagination.Custom reads width/height/borderRadius/backgroundColor from these
  // objects directly — style arrays are not supported and break the active pill + radius.
  return (
    <Pagination.Custom
      progress={progress}
      data={data}
      horizontal
      size={DOT_SIZE}
      containerStyle={styles.container}
      dotStyle={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: dotColor,
      }}
      activeDotStyle={{
        width: ACTIVE_DOT_WIDTH,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: activeDotColor,
      }}
      onPress={onPress}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    gap: DOT_GAP,
    marginTop: 4,
    marginBottom: 0,
  },
});
