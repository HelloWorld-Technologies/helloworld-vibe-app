import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import type { BookRoomOption, OccupancyType } from '@/types/booking';
import { formatBookingPrice, getOccupancyLabel } from '@/utils/booking-rooms';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

const ITEM_ENTER_MS = 220;
const ITEM_STAGGER_MS = 40;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type HdpBookRoomSelectionProps = {
  occupancyOptions: OccupancyType[];
  selectedOccupancy: OccupancyType;
  onOccupancyChange: (occupancy: OccupancyType) => void;
  rooms: BookRoomOption[];
  selectedRoomId: string;
  onRoomSelect: (roomId: string) => void;
  minStayMonths: number;
  onBookNow: () => void;
};

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

    scale.value = withSequence(
      withSpring(1.06, { damping: 11, stiffness: 380, mass: 0.6 }),
      withSpring(1, { damping: 14, stiffness: 280, mass: 0.7 }),
    );
  }, [scale, selected]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
}

function OccupancyChip({
  option,
  index,
  active,
  onChange,
}: {
  option: OccupancyType;
  index: number;
  active: boolean;
  onChange: (value: OccupancyType) => void;
}) {
  const animatedStyle = useSelectionBounce(active);

  return (
    <Animated.View
      entering={FadeInDown.duration(ITEM_ENTER_MS).delay(index * ITEM_STAGGER_MS)}
      style={animatedStyle}>
      <Pressable
        onPress={() => onChange(option)}
        style={[styles.chip, active && styles.chipActive]}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}>
        <Typography
          variant="text"
          size="sm"
          weight="medium"
          color={active ? palette.white : palette.gray[700]}>
          {getOccupancyLabel(option)}
        </Typography>
      </Pressable>
    </Animated.View>
  );
}

function OccupancyChips({
  options,
  selected,
  onChange,
}: {
  options: OccupancyType[];
  selected: OccupancyType;
  onChange: (value: OccupancyType) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      {options.map((option, index) => (
        <OccupancyChip
          key={option}
          option={option}
          index={index}
          active={option === selected}
          onChange={onChange}
        />
      ))}
    </ScrollView>
  );
}

function RoomTypeRow({
  room,
  selected,
  onSelect,
  index,
}: {
  room: BookRoomOption;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const animatedStyle = useSelectionBounce(selected);

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(ITEM_ENTER_MS).delay(index * ITEM_STAGGER_MS)}
      onPress={onSelect}
      style={[styles.roomRow, selected && styles.roomRowSelected, animatedStyle]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}>
      <View style={styles.roomHeader}>
        <View style={styles.roomTitleRow}>
          <View style={[styles.radio, selected && styles.radioSelected]}>
            {selected ? (
              <Animated.View entering={ZoomIn.duration(180).springify()}>
                <View style={styles.radioDot} />
              </Animated.View>
            ) : null}
          </View>
          <Typography variant="text" size="md" weight="bold">
            {room.name}
          </Typography>
        </View>
        <Typography variant="text" size="md" weight="bold">
          {formatBookingPrice(room.price)}
        </Typography>
      </View>

      <View style={styles.featureRow}>
        {room.features.map((feature, featureIndex) => (
          <View key={feature} style={styles.featureItem}>
            {featureIndex > 0 ? (
              <Typography variant="text" size="xs" color={palette.gray[400]}>
                ·
              </Typography>
            ) : null}
            <HwSymbol name="house.fill" size={12} tintColor={palette.gray[500]} />
            <Typography variant="text" size="xs" color={palette.gray[600]}>
              {feature}
            </Typography>
          </View>
        ))}
      </View>
    </AnimatedPressable>
  );
}

export function HdpBookRoomSelection({
  occupancyOptions,
  selectedOccupancy,
  onOccupancyChange,
  rooms,
  selectedRoomId,
  onRoomSelect,
  minStayMonths,
  onBookNow,
}: HdpBookRoomSelectionProps) {
  return (
    <View style={styles.wrap}>
      <Typography variant="text" size="md" weight="bold">
        Select your Occupancy
      </Typography>

      <OccupancyChips
        options={occupancyOptions}
        selected={selectedOccupancy}
        onChange={onOccupancyChange}
      />

      <Animated.View key={selectedOccupancy} entering={FadeIn.duration(200)} style={styles.roomList}>
        {rooms.length > 0 ? (
          rooms.map((room, index) => (
            <RoomTypeRow
              key={room.id}
              room={room}
              index={index}
              selected={room.id === selectedRoomId}
              onSelect={() => onRoomSelect(room.id)}
            />
          ))
        ) : (
          <Typography variant="text" size="sm" color={palette.gray[500]} style={styles.emptyRooms}>
            No room types available for this occupancy.
          </Typography>
        )}
      </Animated.View>

      <Button label="Book Now" onPress={onBookNow} disabled={rooms.length === 0} style={styles.cta} />

      <Typography variant="text" size="xs" color={palette.gray[500]} style={styles.disclaimer}>
        Full Refund of Security Deposit requires a minimum {minStayMonths}-month stay.
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    borderRadius: Radius.full,
    backgroundColor: palette.gray[100],
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: palette.gray[800],
  },
  roomList: {
    gap: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
  },
  emptyRooms: {
    paddingVertical: 16,
  },
  roomRow: {
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  roomRowSelected: {
    backgroundColor: palette.gray[25],
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: palette.gray[800],
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.gray[800],
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cta: {
    marginTop: 4,
  },
  disclaimer: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
