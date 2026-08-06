import { HwSymbol } from '@/components/ui/hw-symbol';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { CalendarPickerModal } from '@/components/ui/calendar-picker-modal';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { OccupantDetails } from '@/types/booking';
import { getDefaultMoveInDate, getLatestMoveInDate } from '@/utils/booking-payment';

const GENDER_OPTIONS = ['Male', 'Female', 'Others'] as const;

export type OccupantFormErrors = Partial<Record<keyof OccupantDetails, string>>;

type HdpBookOccupantFormProps = {
  value: OccupantDetails;
  errors?: OccupantFormErrors;
  formError?: string;
  phoneEditable?: boolean;
  onChange: (value: OccupantDetails) => void;
  onBack: () => void;
  onVerifyPhone: () => void;
};

function formatMoveInDate(date: Date) {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function HdpBookOccupantForm({
  value,
  errors,
  formError,
  phoneEditable = true,
  onChange,
  onBack,
  onVerifyPhone,
}: HdpBookOccupantFormProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);

  function updateField<K extends keyof OccupantDetails>(key: K, fieldValue: OccupantDetails[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} style={styles.backRow} accessibilityRole="button" accessibilityLabel="Go back">
        <HwSymbol name="chevron.left" size={14} weight="semibold" tintColor={palette.helloLime} />
        <Typography variant="text" size="md" weight="bold">
          Occupant&apos;s Details
        </Typography>
      </Pressable>

      <View style={styles.row}>
        <TextField
          label="First Name"
          value={value.firstName}
          onChangeText={(text) => updateField('firstName', text)}
          containerStyle={styles.halfField}
          autoCapitalize="words"
          placeholder="Enter first name"
          error={errors?.firstName}
        />
        <TextField
          label="Last Name"
          value={value.lastName}
          onChangeText={(text) => updateField('lastName', text)}
          containerStyle={styles.halfField}
          autoCapitalize="words"
          placeholder="Enter last name"
          error={errors?.lastName}
        />
      </View>

      <TextField
        label="Email"
        value={value.email}
        onChangeText={(text) => updateField('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder="Please enter valid email id"
        error={errors?.email}
      />

      <TextField
        label="Phone Number"
        value={value.phone}
        onChangeText={(text) => updateField('phone', text.replace(/\D/g, '').slice(0, 10))}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="Enter 10-digit mobile number"
        error={errors?.phone}
        editable={phoneEditable}
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Typography variant="text" size="sm" weight="medium" style={styles.fieldLabel}>
            Gender
          </Typography>
          <Pressable
            onPress={() => setGenderOpen((open) => !open)}
            style={[styles.selectField, errors?.gender && styles.selectFieldError]}
            accessibilityRole="button">
            <Typography
              variant="text"
              size="md"
              color={value.gender ? palette.gray[800] : palette.textPlaceholder}>
              {value.gender || 'Select gender'}
            </Typography>
            <HwSymbol name="chevron.down" size={12} tintColor={palette.gray[500]} />
          </Pressable>
          {errors?.gender ? (
            <Typography variant="text" size="xs" color={palette.borderError} style={styles.fieldError}>
              {errors.gender}
            </Typography>
          ) : null}
          {genderOpen ? (
            <View style={styles.dropdown}>
              {GENDER_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => {
                    updateField('gender', option);
                    setGenderOpen(false);
                  }}
                  style={styles.dropdownItem}>
                  <Typography variant="text" size="sm" weight={value.gender === option ? 'bold' : 'medium'}>
                    {option}
                  </Typography>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.halfField}>
          <Typography variant="text" size="sm" weight="medium" style={styles.fieldLabel}>
            Move in Date
          </Typography>
          <Pressable
            onPress={() => setCalendarOpen(true)}
            style={styles.selectField}
            accessibilityRole="button"
            accessibilityLabel="Select move in date">
            <Typography variant="text" size="md" color={palette.gray[800]} numberOfLines={1}>
              {formatMoveInDate(value.moveInDate)}
            </Typography>
            <HwSymbol name="calendar" size={14} tintColor={palette.gray[800]} />
          </Pressable>
        </View>
      </View>

      {formError ? (
        <Typography variant="text" size="xs" color={palette.red[600]}>
          {formError}
        </Typography>
      ) : null}

      <Button label="Continue" onPress={onVerifyPhone} style={styles.cta} />

      <CalendarPickerModal
        visible={calendarOpen}
        value={value.moveInDate}
        minDate={getDefaultMoveInDate()}
        maxDate={getLatestMoveInDate()}
        onClose={() => setCalendarOpen(false)}
        onApply={(date) => updateField('moveInDate', date)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldLabel: {
    color: palette.textLabel,
    marginBottom: 6,
  },
  selectField: {
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
  selectFieldError: {
    borderColor: palette.red[300],
  },
  fieldError: {
    marginTop: 6,
  },
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: palette.white,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  cta: {
    marginTop: 8,
  },
});
