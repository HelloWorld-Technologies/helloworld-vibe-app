import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sat', 'Su'] as const;
const DAY_MARKER_SIZE = 36;

type CalendarPickerModalProps = {
  visible: boolean;
  value: Date;
  minDate?: Date;
  maxDate?: Date;
  onClose: () => void;
  onApply: (date: Date) => void;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let index = 0; index < startOffset; index += 1) {
    const day = daysInPrevMonth - startOffset + index + 1;
    cells.push({ date: new Date(year, month - 1, day), inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - startOffset - daysInMonth + 1;
    cells.push({ date: new Date(year, month + 1, nextDay), inMonth: false });
  }

  return cells;
}

function isBeforeDay(a: Date, b: Date) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

function isAfterDay(a: Date, b: Date) {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

function isDateSelectable(date: Date, minDate?: Date, maxDate?: Date) {
  if (minDate && isBeforeDay(date, minDate)) return false;
  if (maxDate && isAfterDay(date, maxDate)) return false;
  return true;
}

export function CalendarPickerModal({
  visible,
  value,
  minDate,
  maxDate,
  onClose,
  onApply,
}: CalendarPickerModalProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(value));
  const [draftDate, setDraftDate] = useState(value);

  useEffect(() => {
    if (!visible) return;
    setVisibleMonth(new Date(value));
    setDraftDate(value);
  }, [value, visible]);

  const cells = useMemo(
    () => buildMonthGrid(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth],
  );

  const weeks = useMemo(() => {
    const rows: (typeof cells)[] = [];
    for (let index = 0; index < cells.length; index += 7) {
      rows.push(cells.slice(index, index + 7));
    }
    return rows;
  }, [cells]);

  const monthLabel = visibleMonth.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  function shiftMonth(delta: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <Pressable onPress={() => shiftMonth(-1)} style={styles.navButton} accessibilityLabel="Previous month">
              <HwSymbol name="chevron.left" size={14} weight="semibold" tintColor={palette.gray[700]} />
            </Pressable>
            <Typography variant="text" size="md" weight="bold">
              {monthLabel}
            </Typography>
            <Pressable onPress={() => shiftMonth(1)} style={styles.navButton} accessibilityLabel="Next month">
              <HwSymbol name="chevron.right" size={14} weight="semibold" tintColor={palette.gray[700]} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <Typography key={day} variant="text" size="xs" weight="medium" color={palette.gray[500]} style={styles.weekday}>
                {day}
              </Typography>
            ))}
          </View>

          <View style={styles.grid}>
            {weeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} style={styles.weekRow}>
                {week.map(({ date, inMonth }) => {
                  const selected = isSameDay(date, draftDate);
                  const today = isSameDay(date, new Date());
                  const selectable = isDateSelectable(date, minDate, maxDate);

                  return (
                    <Pressable
                      key={date.toISOString()}
                      onPress={() => {
                        if (!selectable) return;
                        setDraftDate(startOfDay(date));
                      }}
                      disabled={!selectable}
                      style={[styles.dayCell, !selectable && styles.dayCellDisabled]}
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled: !selectable }}>
                      {selected ? <View style={styles.dayCellSelected} /> : null}
                      <Typography
                        variant="text"
                        size="sm"
                        weight={selected ? 'bold' : 'medium'}
                        color={
                          selected
                            ? palette.white
                            : !selectable
                              ? palette.gray[300]
                              : inMonth
                                ? palette.gray[800]
                                : palette.gray[400]
                        }>
                        {date.getDate()}
                      </Typography>
                      {today && !selected && selectable ? <View style={styles.todayDot} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button label="Cancel" variant="outline" onPress={onClose} style={styles.actionButton} />
            <Button
              label="Apply"
              onPress={() => {
                onApply(draftDate);
                onClose();
              }}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gray[50],
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    gap: 2,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    position: 'absolute',
    width: DAY_MARKER_SIZE,
    height: DAY_MARKER_SIZE,
    borderRadius: DAY_MARKER_SIZE / 2,
    backgroundColor: palette.gray[800],
  },
  dayCellDisabled: {
    opacity: 0.45,
  },
  todayDot: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: palette.helloLime,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
