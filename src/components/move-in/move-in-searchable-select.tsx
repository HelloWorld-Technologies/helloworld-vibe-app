import { HwSymbol } from '@/components/ui/hw-symbol';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type MoveInSearchableSelectProps = {
  label: string;
  placeholder: string;
  value: string;
  options: readonly string[];
  otherLabel?: string;
  selfEmployedLabel?: string;
  customValue?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
  onCustomChange?: (value: string) => void;
  onSelfEmployed?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export function MoveInSearchableSelect({
  label,
  placeholder,
  value,
  options,
  otherLabel,
  selfEmployedLabel,
  customValue = '',
  isOpen,
  onOpenChange,
  onSelect,
  onCustomChange,
  onSelfEmployed,
  containerStyle,
}: MoveInSearchableSelectProps) {
  const [query, setQuery] = useState('');

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.toLowerCase().includes(normalized));
  }, [options, query]);

  const showCustomInput = Boolean(otherLabel && value === otherLabel);

  function handleToggle() {
    onOpenChange(!isOpen);
    if (!isOpen) {
      setQuery('');
    }
  }

  function handleSelect(option: string) {
    onSelect(option);
    onOpenChange(false);
    setQuery('');
  }

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Typography variant="text" size="sm" weight="medium" color={palette.textLabel} style={styles.label}>
        {label}
      </Typography>

      <Pressable
        onPress={handleToggle}
        style={[styles.field, isOpen && styles.fieldOpen]}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}>
        <Typography
          variant="text"
          size="md"
          color={value ? palette.gray[800] : palette.textPlaceholder}
          numberOfLines={1}
          style={styles.fieldText}>
          {value || placeholder}
        </Typography>
        <HwSymbol
          name="chevron.down"
          size={12}
          tintColor={palette.gray[500]}
          style={isOpen ? styles.chevronOpen : undefined}
        />
      </Pressable>

      {showCustomInput ? (
        <TextInput
          value={customValue}
          onChangeText={onCustomChange}
          placeholder={otherLabel}
          placeholderTextColor={palette.textPlaceholder}
          style={styles.customInput}
          autoCapitalize="words"
        />
      ) : null}

      {isOpen ? (
        <View style={styles.dropdown}>
          <View style={styles.searchRow}>
            <HwSymbol name="magnifyingglass" size={14} tintColor={palette.gray[400]} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              placeholderTextColor={palette.textPlaceholder}
              style={styles.searchInput}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={styles.optionsScroll}
            showsVerticalScrollIndicator>
            {filteredOptions.map((option, index) => (
              <Pressable
                key={option}
                onPress={() => handleSelect(option)}
                style={[styles.optionRow, index < filteredOptions.length - 1 && styles.optionBorder]}>
                <Typography variant="text" size="sm" color={palette.gray[800]}>
                  {option}
                </Typography>
              </Pressable>
            ))}

            {otherLabel ? (
              <Pressable onPress={() => handleSelect(otherLabel)} style={styles.specialOption}>
                <Typography variant="text" size="sm" weight="medium" color={palette.helloLime}>
                  + {otherLabel}
                </Typography>
              </Pressable>
            ) : null}

            {selfEmployedLabel && onSelfEmployed ? (
              <Pressable
                onPress={() => {
                  onSelfEmployed();
                  onOpenChange(false);
                  setQuery('');
                }}
                style={styles.specialOption}>
                <Typography variant="text" size="sm" weight="medium" color={palette.helloLime}>
                  + {selfEmployedLabel}
                </Typography>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    zIndex: 1,
  },
  label: {
    marginBottom: 2,
  },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: palette.borderDefault,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.white,
    gap: 8,
  },
  fieldOpen: {
    borderColor: palette.gray[400],
  },
  fieldText: {
    flex: 1,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  customInput: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: palette.borderDefault,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    fontSize: 16,
    color: palette.gray[800],
    backgroundColor: palette.white,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: Radius.sm,
    backgroundColor: palette.white,
    overflow: 'hidden',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: palette.gray[800],
    padding: 0,
  },
  optionsScroll: {
    maxHeight: 220,
  },
  optionRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  specialOption: {
    marginHorizontal: 10,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    backgroundColor: palette.gray[100],
  },
});
