import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { VisitDateOption, VisitTimeSlot } from '@/types/visit';

const ITEM_ENTER_MS = 220;
const ITEM_STAGGER_MS = 40;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type VisitDateTimeVariant = 'default' | 'compact';

function useSelectionBounce(selected: boolean) {
  const scale = useSharedValue(1);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (!selected) {
      return;
    }

    // Keep the bounce subtle so borders aren't clipped by the horizontal ScrollView.
    scale.value = withSequence(
      withSpring(1.03, { damping: 14, stiffness: 320, mass: 0.65 }),
      withSpring(1, { damping: 16, stiffness: 260, mass: 0.7 }),
    );
  }, [scale, selected]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
}

type VisitDateCardsRowProps = {
  dates: VisitDateOption[];
  selectedId: string;
  onSelect: (date: VisitDateOption) => void;
  variant?: VisitDateTimeVariant;
  contentContainerStyle?: StyleProp<ViewStyle>;
  animateOnMount?: boolean;
};

export function VisitDateCardsRow({
  dates,
  selectedId,
  onSelect,
  variant = 'default',
  contentContainerStyle,
  animateOnMount = true,
}: VisitDateCardsRowProps) {
  const dateCardStyle = variant === 'compact' ? styles.dateCardCompact : styles.dateCard;

  return (
    <View style={styles.dateRowShell}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={[styles.dateRow, contentContainerStyle]}>
        {dates.map((date, index) => (
          <VisitDateCard
            key={date.id}
            date={date}
            index={index}
            selected={date.id === selectedId}
            onSelect={onSelect}
            style={dateCardStyle}
            animateOnMount={animateOnMount}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function VisitDateCard({
  date,
  index,
  selected,
  onSelect,
  style,
  animateOnMount,
}: {
  date: VisitDateOption;
  index: number;
  selected: boolean;
  onSelect: (date: VisitDateOption) => void;
  style: StyleProp<ViewStyle>;
  animateOnMount: boolean;
}) {
  const animatedStyle = useSelectionBounce(selected);

  return (
    <Animated.View
      entering={
        animateOnMount ? FadeInDown.duration(ITEM_ENTER_MS).delay(index * ITEM_STAGGER_MS) : undefined
      }
      style={[styles.dateCardShell, animatedStyle]}>
      <Pressable
        onPress={() => onSelect(date)}
        style={[style, selected && styles.dateCardSelected]}
        accessibilityRole="button"
        accessibilityState={{ selected }}>
        <Typography
          variant="text"
          size="xs"
          weight="medium"
          color={selected ? palette.blue[600] : palette.gray[500]}>
          {date.dayLabel}
        </Typography>
        <Typography
          variant="text"
          size="lg"
          weight="bold"
          color={selected ? palette.blue[600] : palette.gray[800]}>
          {date.dateLabel}
        </Typography>
      </Pressable>
    </Animated.View>
  );
}

type VisitTimeSlotsRowProps = {
  slots: VisitTimeSlot[];
  selectedId: string;
  onSelect: (slot: VisitTimeSlot) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  animateOnMount?: boolean;
  animationKey?: string;
};

export function VisitTimeSlotsRow({
  slots,
  selectedId,
  onSelect,
  contentContainerStyle,
  animateOnMount = true,
  animationKey,
}: VisitTimeSlotsRowProps) {
  return (
    <Animated.View
      key={animationKey}
      entering={animationKey ? FadeIn.duration(200) : undefined}
      style={styles.timeRowShell}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={[styles.timeRow, contentContainerStyle]}>
        {slots.map((slot, index) => (
          <VisitTimeSlotPill
            key={slot.id}
            slot={slot}
            index={index}
            selected={slot.id === selectedId}
            onSelect={onSelect}
            animateOnMount={animateOnMount}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

function VisitTimeSlotPill({
  slot,
  index,
  selected,
  onSelect,
  animateOnMount,
}: {
  slot: VisitTimeSlot;
  index: number;
  selected: boolean;
  onSelect: (slot: VisitTimeSlot) => void;
  animateOnMount: boolean;
}) {
  const animatedStyle = useSelectionBounce(selected);

  return (
    <AnimatedPressable
      entering={
        animateOnMount ? FadeInDown.duration(ITEM_ENTER_MS).delay(index * ITEM_STAGGER_MS) : undefined
      }
      onPress={() => onSelect(slot)}
      style={[styles.timePill, selected && styles.timePillSelected, animatedStyle]}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <Typography
        variant="text"
        size="sm"
        weight="medium"
        color={selected ? palette.blue[600] : palette.gray[800]}>
        {slot.label}
      </Typography>
    </AnimatedPressable>
  );
}

type VisitDateTimePickerProps = {
  dates: VisitDateOption[];
  selectedDateId: string;
  onSelectDate: (date: VisitDateOption) => void;
  timeSlots: VisitTimeSlot[];
  selectedTimeId: string;
  onSelectTime: (slot: VisitTimeSlot) => void;
};

export function VisitDateTimePicker({
  dates,
  selectedDateId,
  onSelectDate,
  timeSlots,
  selectedTimeId,
  onSelectTime,
}: VisitDateTimePickerProps) {
  return (
    <View style={styles.wrap}>
      <Typography variant="text" size="md" weight="medium" style={styles.title}>
        Pick your visit date & time
      </Typography>

      <VisitDateCardsRow dates={dates} selectedId={selectedDateId} onSelect={onSelectDate} />

      <VisitTimeSlotsRow
        slots={timeSlots}
        selectedId={selectedTimeId}
        onSelect={onSelectTime}
        animationKey={selectedDateId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  horizontalScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  dateRowShell: {
    flexGrow: 0,
  },
  timeRowShell: {
    flexGrow: 0,
    maxHeight: 64,
  },
  dateRow: {
    flexGrow: 0,
    gap: 8,
    // Extra room so the selection bounce + border aren't clipped by ScrollView.
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dateCardShell: {
    // Keep transform origin clear of neighbors during scale bounce.
    marginHorizontal: 1,
  },
  dateCard: {
    width: 68,
    minHeight: 110,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: palette.gray[200],
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  dateCardCompact: {
    width: 64,
    minHeight: 72,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: palette.gray[200],
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
  },
  dateCardSelected: {
    borderWidth: 1.5,
    borderColor: palette.blue[300],
    backgroundColor: palette.blue[50],
  },
  timeRow: {
    flexGrow: 0,
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  timePill: {
    borderRadius: Radius.full,
    backgroundColor: palette.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timePillSelected: {
    backgroundColor: palette.blue[50],
  },
});
