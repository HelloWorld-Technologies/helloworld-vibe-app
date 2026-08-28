import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { HomepageIcons } from '@/constants/assets';
import { Fonts, fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

const SearchIcon = HomepageIcons.search;

const SHADOW_OFFSET = { x: 1 , y: 5 };

type SearchInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  shadowColor?: string;
  showShadow?: boolean;
};

export function SearchInput({
  containerStyle,
  style,
  onPress,
  editable,
  shadowColor = palette.lime[400],
  showShadow = true,
  ...props
}: SearchInputProps) {
  const isPressable = Boolean(onPress);
  const field = (
    <View style={styles.field}>
      <TextInput
        placeholder="Search for Locality, Office or College"
        placeholderTextColor={palette.textPlaceholder}
        style={[styles.input, style]}
        editable={isPressable ? false : editable}
        pointerEvents={isPressable ? 'none' : 'auto'}
        {...props}
      />
      <SearchIcon width={16} height={16} color={palette.black} />
    </View>
  );

  return (
    <View style={[styles.wrapper, !showShadow && styles.wrapperFlat, containerStyle]}>
      {showShadow ? <View style={[styles.shadow, { backgroundColor: shadowColor }]} /> : null}
      {isPressable ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Search for locality, office or college">
          {field}
        </Pressable>
      ) : (
        field
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginRight: SHADOW_OFFSET.x,
    marginBottom: SHADOW_OFFSET.y,
  },
  wrapperFlat: {
    marginRight: 0,
    marginBottom: 0,
  },
  shadow: {
    position: 'absolute',
    top: SHADOW_OFFSET.y,
    left: SHADOW_OFFSET.x,
    right: -SHADOW_OFFSET.x,
    bottom: -SHADOW_OFFSET.y,
    borderRadius: Radius.full,
  },
  field: {
    position: 'relative',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 52,
    paddingHorizontal: 20,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: palette.grey,
    backgroundColor: palette.white,
  },
  pressed: {
    opacity: 0.96,
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    fontSize: 14,
    letterSpacing: 0,
    // Satoshi Variable stretches placeholders on real iOS devices.
    fontFamily: Platform.OS === 'ios' ? Fonts.regular : undefined,
    ...(Platform.OS === 'ios'
      ? { fontWeight: '400' as const }
      : fontStyleForWeight('regular')),
    color: palette.textPrimary,
    padding: 0,
    margin: 0,
    // lineHeight on iOS TextInput top-aligns and clips custom fonts.
    ...Platform.select({
      ios: {
        height: '100%' as const,
      },
      android: {
        textAlignVertical: 'center' as const,
        includeFontPadding: false,
      },
      default: {},
    }),
  },
});
