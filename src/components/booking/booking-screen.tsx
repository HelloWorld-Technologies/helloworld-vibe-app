import { useRouter } from 'expo-router';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getPaymentDetails, verifyReferralCode } from '@/api/booking';
import { BookingChargesSheet } from '@/components/booking/booking-charges-sheet';
import { BookingOccupantSummary } from '@/components/booking/booking-occupant-summary';
import { BookingPaymentOption } from '@/components/booking/booking-payment-option';
import { BookingPropertySummary } from '@/components/booking/booking-property-summary';
import { DiscountCodeInput } from '@/components/booking/discount-code-input';
import { HdpVisitSheet } from '@/components/hdp/hdp-visit-sheet';
import { BookingChargesSkeleton } from '@/components/skeleton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import { BOOKING_TERMS } from '@/constants/booking';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { usePropertyCategories } from '@/queries/use-property-categories';
import { usePropertyDetail } from '@/queries/use-property-detail';
import { useAuthStore } from '@/stores/auth-store';
import { useBookingDraftStore } from '@/stores/booking-draft-store';
import { useIsTenant } from '@/stores/tenant-store';
import { useBookingPayment } from '@/hooks/use-booking-payment';
import type { AppliedDiscount, BookingChargeId, BookingChargeOption, BookingPricingDetails } from '@/types/booking-payment';
import {
  formatBookingAmount,
  formatBookingApiDate,
  getAppliedDiscountMessage,
  sumSelectedCharges,
} from '@/utils/booking-payment';
import {
  buildChargesFromPricing,
  computePayableSubtotal,
  mapPaymentDetailsData,
  syncSelectedCharges,
} from '@/utils/booking-pricing';
import { getExploreHomeRoute } from '@/utils/tenant-routing';

const DEFAULT_SELECTED: Record<BookingChargeId, boolean> = {
  token: true,
  moveIn: false,
  security: false,
  advanceRent: false,
  utility: false,
};

function formatRentLabel(amount?: number) {
  if (!amount || amount <= 0) return '₹—';
  return `₹${amount.toLocaleString('en-IN')}/mo`;
}

function formatDepositLabel(months?: number) {
  if (!months || months <= 0) return '1 months rent';
  return `${months} month${months > 1 ? 's' : ''} rent`;
}

export function BookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isTenant = useIsTenant();
  const draft = useBookingDraftStore((state) => state.draft);
  const { startBookingPayment } = useBookingPayment();

  const [pricingDetails, setPricingDetails] = useState<BookingPricingDetails | null>(null);
  const [discountPricingDetails, setDiscountPricingDetails] = useState<BookingPricingDetails | null>(
    null,
  );
  const [pricingLoading, setPricingLoading] = useState(true);
  const [charges, setCharges] = useState<BookingChargeOption[]>([]);
  const [selected, setSelected] = useState<Record<BookingChargeId, boolean>>(DEFAULT_SELECTED);
  const [referralInput, setReferralInput] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [referralLoading, setReferralLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedReferral, setAppliedReferral] = useState<AppliedDiscount | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedDiscount | null>(null);
  const [chargesSheetOpen, setChargesSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editBookStep, setEditBookStep] = useState<'rooms' | 'details'>('rooms');
  const storedMobile = useAuthStore((state) => state.mobile);

  const activePricing = appliedCoupon && discountPricingDetails ? discountPricingDetails : pricingDetails;

  const propertyId = draft?.propertyId ?? '';
  const { data: propertyData } = usePropertyDetail(propertyId);
  const { data: categories = [] } = usePropertyCategories(propertyId);

  const property = propertyData?.success
    ? (propertyData.data as Record<string, unknown>)
    : null;

  const startingRent = useMemo(() => {
    const value =
      property?.min_rent ??
      property?.starting_rent ??
      property?.price ??
      property?.rent ??
      draft?.roomPrice;
    return typeof value === 'number' ? value : undefined;
  }, [draft?.roomPrice, property]);

  const roomTypes = useMemo(() => {
    const fromProperty = [
      ...(Array.isArray(property?.room_types) ? property.room_types : []),
      ...(Array.isArray(property?.sharing_types) ? property.sharing_types : []),
    ].filter((item): item is string => typeof item === 'string');

    return fromProperty.length > 0 ? fromProperty : undefined;
  }, [property]);

  const minStayMonths =
    (typeof property?.lock_in_period === 'number' ? property.lock_in_period : undefined) ??
    (typeof property?.minimum_stay === 'number' ? property.minimum_stay : undefined) ??
    (typeof property?.min_stay_months === 'number' ? property.min_stay_months : undefined) ??
    draft?.securityDepositMonths ??
    3;

  const depositMonths =
    (typeof property?.security_deposit_months === 'number'
      ? property.security_deposit_months
      : undefined) ?? minStayMonths;

  useEffect(() => {
    if (!draft) {
      router.replace(getExploreHomeRoute(isTenant));
    }
  }, [draft, isTenant, router]);

  useEffect(() => {
    if (!draft) return;

    const draftSnapshot = draft;
    let cancelled = false;

    async function loadPaymentDetails(couponCode?: string) {
      const response = await getPaymentDetails({
        categoryId: draftSnapshot.categoryId ?? draftSnapshot.roomId,
        sharingType: draftSnapshot.sharingType,
        moveInDate: formatBookingApiDate(draftSnapshot.moveInDate),
        sdMonths: draftSnapshot.securityDepositMonths ?? 1,
        propertyId: draftSnapshot.propertyId,
        ...(couponCode
          ? {
              couponCode,
              propertyName: draftSnapshot.propertyName,
              sdKey: pricingDetails?.sdKey,
            }
          : {}),
      });

      if (!response.success) {
        return null;
      }

      return mapPaymentDetailsData(response.data);
    }

    async function fetchPricing() {
      setPricingLoading(true);
      try {
        const pricing = await loadPaymentDetails();
        if (cancelled || !pricing) return;

        const nextCharges = buildChargesFromPricing(pricing, draftSnapshot.moveInDate);
        setPricingDetails(pricing);
        setCharges(nextCharges);
        setSelected((current) => syncSelectedCharges(current, nextCharges));
      } finally {
        if (!cancelled) {
          setPricingLoading(false);
        }
      }
    }

    void fetchPricing();

    return () => {
      cancelled = true;
    };
  }, [draft]);

  useEffect(() => {
    if (!appliedCoupon) {
      setDiscountPricingDetails(null);
      if (pricingDetails) {
        const nextCharges = buildChargesFromPricing(pricingDetails, draft?.moveInDate);
        setCharges(nextCharges);
        setSelected((current) => syncSelectedCharges(current, nextCharges));
      }
    }
  }, [appliedCoupon, pricingDetails]);

  const discounts = useMemo(
    () => [appliedCoupon, appliedReferral].filter((item): item is AppliedDiscount => Boolean(item)),
    [appliedCoupon, appliedReferral],
  );

  const subtotal = useMemo(() => {
    if (activePricing) {
      return computePayableSubtotal(activePricing, selected);
    }
    return sumSelectedCharges(charges, selected);
  }, [activePricing, charges, selected]);
  // Referral is first-rent / post move-in (helloworld-next). Coupon is already in discounted pricing.
  const total = subtotal;
  const selectedIds = useMemo(
    () => new Set(charges.filter((charge) => selected[charge.id]).map((charge) => charge.id)),
    [charges, selected],
  );

  if (!draft) {
    return null;
  }

  const bookingDraft = draft;

  function toggleCharge(id: BookingChargeId) {
    if (id === 'token') return;
    const charge = charges.find((item) => item.id === id);
    if (charge?.disabled || charge?.required) return;

    setSelected((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function openPropertyEdit() {
    setEditBookStep('rooms');
    setEditSheetOpen(true);
  }

  function openOccupantEdit() {
    setEditBookStep('details');
    setEditSheetOpen(true);
  }

  async function handleApplyReferral() {
    setReferralError('');
    setReferralLoading(true);

    try {
      const code = referralInput.trim();
      const response = await verifyReferralCode({
        referralCode: code,
        propertyName: bookingDraft.propertyName,
      });

      if (response.isValid) {
        setAppliedReferral({
          type: 'referral',
          code,
          amount: 0,
          message: `Your referral code ${code} has been applied`,
        });
        setReferralInput('');
      } else {
        setReferralError(response.message || 'Invalid referral code');
      }
    } catch {
      setReferralError('Unable to validate referral code');
    } finally {
      setReferralLoading(false);
    }
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;

    setCouponError('');
    setCouponLoading(true);

    try {
      const response = await getPaymentDetails({
        categoryId: bookingDraft.categoryId ?? bookingDraft.roomId,
        sharingType: bookingDraft.sharingType,
        moveInDate: formatBookingApiDate(bookingDraft.moveInDate),
        sdMonths: bookingDraft.securityDepositMonths ?? 1,
        propertyId: bookingDraft.propertyId,
        couponCode: code,
        propertyName: bookingDraft.propertyName,
        sdKey: pricingDetails?.sdKey,
      });

      if (!response.success) {
        setCouponError(
          response.message || 'This coupon is invalid or has expired. Please try again.',
        );
        return;
      }

      const discountedPricing = mapPaymentDetailsData(response.data);
      if (!discountedPricing) {
        setCouponError(
          response.message || 'This coupon is invalid or has expired. Please try again.',
        );
        return;
      }

      const originalSubtotal = pricingDetails
        ? computePayableSubtotal(pricingDetails, selected)
        : 0;
      const discountedSubtotal = computePayableSubtotal(discountedPricing, selected);

      setDiscountPricingDetails(discountedPricing);
      const nextCharges = buildChargesFromPricing(discountedPricing, bookingDraft.moveInDate);
      setCharges(nextCharges);
      setSelected((current) => syncSelectedCharges(current, nextCharges));
      setAppliedCoupon({
        type: 'coupon',
        code,
        amount: Math.max(0, originalSubtotal - discountedSubtotal),
        message: response.discountMessage || response.message,
      });
      setCouponInput('');
    } catch {
      setCouponError('Unable to apply coupon code');
    } finally {
      setCouponLoading(false);
    }
  }

  function handlePayNow() {
    if (pricingLoading || !activePricing) return;
    setChargesSheetOpen(true);
  }

  function handleConfirmPayment() {
    if (!activePricing) {
      return;
    }

    setChargesSheetOpen(false);

    const mobile =
      storedMobile?.replace(/\D/g, '').slice(-10) ||
      bookingDraft.occupant.phone.replace(/\D/g, '').slice(-10);

    startBookingPayment({
      draft: bookingDraft,
      selected,
      total,
      couponCode: appliedCoupon?.code,
      referralCode: appliedReferral?.code,
      sdKey: activePricing.sdKey,
      mobile,
      charges,
      discounts,
      pricing: activePricing,
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <HwSymbol name="chevron.left" size={16} weight="semibold" tintColor={palette.gray[800]} />
        </Pressable>
        <Typography variant="text" size="md" weight="bold">
          Complete Your Booking
        </Typography>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[styles.content, { paddingBottom: 120 + insets.bottom }]}>
        <Typography variant="display" size="sm" weight="bold">
          You&apos;re Almost There!
        </Typography>

        <View style={styles.infoBanner}>
          <Typography variant="text" size="sm" color={palette.blue[700]}>
            Reserve now, pay the rest later. Start with the token amount to lock your room instantly.
          </Typography>
        </View>

        <BookingPropertySummary
          propertyName={bookingDraft.propertyName}
          location={bookingDraft.location}
          roomName={bookingDraft.roomName}
          occupancyLabel={bookingDraft.occupancyLabel}
          rent={bookingDraft.roomPrice}
          moveInDate={bookingDraft.moveInDate}
          imageUri={bookingDraft.imageUri}
          onEdit={openPropertyEdit}
        />

        <BookingOccupantSummary
          occupant={bookingDraft.occupant}
          onEdit={openOccupantEdit}
        />

        <View style={styles.section}>
          <Typography variant="text" size="md" weight="bold">
            Choose what to pay now
          </Typography>
          <View style={styles.optionList}>
            {pricingLoading ? (
              <BookingChargesSkeleton />
            ) : (
              charges.map((charge) => (
                <BookingPaymentOption
                  key={charge.id}
                  label={charge.label}
                  amount={charge.amount}
                  description={charge.description}
                  selected={selected[charge.id]}
                  required={charge.required}
                  badge={charge.badge}
                  disabled={charge.required || charge.disabled}
                  onPress={() => toggleCharge(charge.id)}
                />
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Typography variant="text" size="md" weight="bold">
            🏷️ Apply discounts
          </Typography>

          <DiscountCodeInput
            label="Referral Code"
            placeholder="Enter referral code"
            value={referralInput}
            onChange={setReferralInput}
            onApply={handleApplyReferral}
            loading={referralLoading}
            error={referralError}
            appliedCode={appliedReferral?.code}
            successMessage={appliedReferral ? getAppliedDiscountMessage(appliedReferral) : undefined}
            onClear={() => {
              setAppliedReferral(null);
              setReferralError('');
            }}
          />

          <DiscountCodeInput
            label="Coupon Code"
            placeholder="Enter coupon code"
            value={couponInput}
            onChange={setCouponInput}
            onApply={handleApplyCoupon}
            loading={couponLoading}
            error={couponError}
            appliedCode={appliedCoupon?.code}
            successMessage={appliedCoupon ? getAppliedDiscountMessage(appliedCoupon) : undefined}
            onClear={() => {
              setAppliedCoupon(null);
              setCouponError('');
            }}
          />
        </View>

        <Pressable style={styles.totalRow} onPress={handlePayNow}>
          <Typography variant="text" size="sm" weight="medium" color={palette.gray[700]}>
            Total Amount
          </Typography>
          <View style={styles.totalValue}>
            {pricingLoading ? (
              <Skeleton width={72} height={20} />
            ) : (
              <Typography variant="text" size="md" weight="bold">
                {formatBookingAmount(total)}
              </Typography>
            )}
            <HwSymbol name="chevron.right" size={12} tintColor={palette.gray[500]} />
          </View>
        </Pressable>

        <View style={styles.section}>
          <Typography variant="text" size="md" weight="bold">
            Terms & Conditions
          </Typography>
          <View style={styles.termsList}>
            {BOOKING_TERMS(bookingDraft.securityDepositMonths ?? 3).map((term) => (
              <View key={term} style={styles.termItem}>
                <Typography variant="text" size="xs" color={palette.gray[600]}>
                  •
                </Typography>
                <Typography variant="text" size="xs" color={palette.gray[600]} style={styles.termText}>
                  {term}
                </Typography>
              </View>
            ))}
          </View>
          <Typography variant="text" size="xs" color={palette.gray[600]}>
            Please refer to HelloWorld&apos;s Terms and conditions for more details.
          </Typography>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label="Pay Now" onPress={handlePayNow} disabled={pricingLoading || !activePricing} />
      </View>

      <BookingChargesSheet
        visible={chargesSheetOpen}
        onClose={() => setChargesSheetOpen(false)}
        charges={charges}
        selectedIds={selectedIds}
        discounts={discounts}
        total={total}
        onPayNow={handleConfirmPayment}
      />

      <HdpVisitSheet
        visible={editSheetOpen}
        onClose={() => setEditSheetOpen(false)}
        propertyId={bookingDraft.propertyId}
        propertyName={bookingDraft.propertyName}
        property={property}
        propertyLocation={bookingDraft.location}
        imageUri={bookingDraft.imageUri}
        rentLabel={formatRentLabel(startingRent)}
        depositLabel={formatDepositLabel(depositMonths)}
        startingRent={startingRent}
        minStayMonths={minStayMonths}
        roomTypes={roomTypes}
        categories={categories}
        bookOnly
        editDraft={bookingDraft}
        initialBookStep={editBookStep}
        onBookingUpdated={() => setEditSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
    gap: 20,
  },
  infoBanner: {
    backgroundColor: palette.blue[50],
    borderRadius: Radius.md,
    padding: 14,
  },
  section: {
    gap: 12,
  },
  optionList: {
    gap: 10,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  termsList: {
    gap: 8,
  },
  termItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  termText: {
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
