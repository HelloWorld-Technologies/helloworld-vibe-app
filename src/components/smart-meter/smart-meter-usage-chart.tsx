import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { UsageBucket } from '@/utils/smart-meter-usage';

const CHART_HEIGHT = 168;
const Y_AXIS_WIDTH = 36;
const BAR_GAP = 8;
const MIN_BAR_WIDTH = 18;
const MAX_BAR_WIDTH = 28;

/** Brand chart colors from app theme (matches primary button lime). */
const BAR_COLOR = palette.lime[300];
const BAR_ACTIVE_COLOR = palette.lime[600];
const AVG_COLOR = palette.lime[200];

type SmartMeterUsageChartProps = {
  title: string;
  buckets: UsageBucket[];
  /** Show average pill next to total units. */
  showAverage?: boolean;
  onBarPress?: (bucket: UsageBucket) => void;
};

export function SmartMeterUsageChart({
  title,
  buckets,
  showAverage = true,
  onBarPress,
}: SmartMeterUsageChartProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const totals = useMemo(
    () =>
      buckets.reduce(
        (acc, item) => ({
          units: acc.units + item.units,
          amount: acc.amount + item.amount,
        }),
        { units: 0, amount: 0 },
      ),
    [buckets],
  );

  const average =
    buckets.length > 0
      ? totals.units / Math.max(buckets.filter((item) => item.units > 0).length, 1)
      : 0;

  const chartWidth = Math.max(windowWidth - 72, 280);
  const plotWidth = chartWidth - Y_AXIS_WIDTH;
  const barWidth = Math.min(
    MAX_BAR_WIDTH,
    Math.max(
      MIN_BAR_WIDTH,
      (plotWidth - BAR_GAP * Math.max(buckets.length - 1, 0)) / Math.max(buckets.length, 1),
    ),
  );
  const contentWidth = Math.max(
    plotWidth,
    buckets.length * barWidth + Math.max(buckets.length - 1, 0) * BAR_GAP,
  );
  const maxUnits = Math.max(...buckets.map((item) => item.units), average, 0.1);
  const plotHeight = CHART_HEIGHT - 28;
  const averageY = plotHeight - (average / maxUnits) * (plotHeight - 8);

  const selected = buckets.find((item) => item.key === selectedKey) ?? null;

  if (buckets.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Typography variant="text" size="lg" weight="bold" color={palette.textPrimary}>
            {totals.units.toFixed(2)} Units
          </Typography>
          <Typography variant="label" size="xs" color={palette.textPlaceholder}>
            {title}
          </Typography>
        </View>
        {showAverage ? (
          <View style={styles.avgBadge}>
            <Typography variant="label" size="xs" weight="medium" color={palette.lime[800]}>
              Avg {average.toFixed(2)}
            </Typography>
          </View>
        ) : null}
      </View>

      {selected ? (
        <View style={styles.selectedRow}>
          <Typography variant="text" size="sm" weight="medium" color={palette.textPrimary}>
            {selected.label}
          </Typography>
          <Typography variant="text" size="sm" color={palette.textSecondary}>
            {selected.units.toFixed(2)} units · {`₹${selected.amount.toFixed(2)}`}
          </Typography>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartScroll}>
        <View style={{ width: Y_AXIS_WIDTH + contentWidth, height: CHART_HEIGHT }}>
          <Svg width={Y_AXIS_WIDTH + contentWidth} height={CHART_HEIGHT}>
            <SvgText x={0} y={14} fill={palette.gray[400]} fontSize={10} fontWeight="500">
              {maxUnits.toFixed(1)}
            </SvgText>
            <SvgText
              x={0}
              y={plotHeight / 2 + 4}
              fill={palette.gray[400]}
              fontSize={10}
              fontWeight="500">
              {(maxUnits / 2).toFixed(1)}
            </SvgText>
            <SvgText x={0} y={plotHeight} fill={palette.gray[400]} fontSize={10} fontWeight="500">
              0
            </SvgText>

            <Line
              x1={Y_AXIS_WIDTH}
              y1={averageY}
              x2={Y_AXIS_WIDTH + contentWidth}
              y2={averageY}
              stroke={AVG_COLOR}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />

            {buckets.map((bucket, index) => {
              const height = Math.max(
                (bucket.units / maxUnits) * (plotHeight - 8),
                bucket.units > 0 ? 4 : 0,
              );
              const x = Y_AXIS_WIDTH + index * (barWidth + BAR_GAP);
              const y = plotHeight - height;
              const active = selectedKey === bucket.key;

              return (
                <Rect
                  key={bucket.key}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height}
                  rx={6}
                  ry={6}
                  fill={active ? BAR_ACTIVE_COLOR : BAR_COLOR}
                  opacity={bucket.units > 0 ? 1 : 0.25}
                />
              );
            })}

            {buckets.map((bucket, index) => {
              const showLabel =
                buckets.length <= 8 ||
                index % Math.ceil(buckets.length / 8) === 0 ||
                index === buckets.length - 1;
              if (!showLabel) return null;
              const x = Y_AXIS_WIDTH + index * (barWidth + BAR_GAP) + barWidth / 2;
              return (
                <SvgText
                  key={`label-${bucket.key}`}
                  x={x}
                  y={CHART_HEIGHT - 4}
                  fill={palette.textPlaceholder}
                  fontSize={9}
                  fontWeight="500"
                  textAnchor="middle">
                  {bucket.label}
                </SvgText>
              );
            })}
          </Svg>

          {onBarPress
            ? buckets.map((bucket, index) => {
                const x = Y_AXIS_WIDTH + index * (barWidth + BAR_GAP);
                return (
                  <Pressable
                    key={`press-${bucket.key}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Usage for ${bucket.label}`}
                    onPress={() => {
                      setSelectedKey(bucket.key);
                      onBarPress(bucket);
                    }}
                    style={[
                      styles.barHit,
                      {
                        left: x,
                        width: Math.max(barWidth, 28),
                        height: plotHeight,
                      },
                    ]}
                  />
                );
              })
            : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  avgBadge: {
    borderRadius: Radius.full,
    backgroundColor: palette.lime[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: palette.lime[25],
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chartScroll: {
    paddingRight: 4,
  },
  barHit: {
    position: 'absolute',
    top: 0,
  },
});
