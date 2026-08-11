import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { postInitiatePayment, postVerifyPayment } from '@/api/checkout';
import config from '@/config';
import { BookingPaymentFailedView } from '@/components/booking/booking-payment-failed-view';
import { PaymentErrorView } from '@/components/payment/payment-error-view';
import { PaymentSuccessView } from '@/components/payment/payment-success-view';
import { TenantScreenHeader } from '@/components/tenant/tenant-screen-header';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { useBookingDraftStore } from '@/stores/booking-draft-store';
import { useTenantProfile } from '@/stores/tenant-store';
import { buildBookingPaymentPayload, buildBookingVerifyPayload } from '@/utils/booking-checkout';
import { buildInvoiceId } from '@/utils/booking-payment';
import { resetRootRoute } from '@/utils/navigation-reset';
import { getPaymentLogoImage } from '@/utils/payment-logo';
import {
  CFEnvironment,
  CFPaymentGatewayService,
  CFSession,
  RazorpayCheckout,
} from '@/utils/payment-gateway';

type PaymentStatus = 'loading' | 'success' | 'failed';

type InitPaymentData = {
  paymentObj: {
    paymentSessionId?: string;
    orderId?: string;
    razaorpayKey?: string;
    notes?: Record<string, unknown>;
    transactionId?: string;
  };
  amount?: number;
  id?: string;
  data?: Record<string, unknown>;
};

function parseRazorpayError(error: unknown): string {
  try {
    if (typeof error === 'string') {
      const parsed = JSON.parse(error) as {
        error?: { description?: string };
        description?: string;
      };
      return parsed?.error?.description || parsed?.description || 'Payment failed';
    }
    if (error && typeof error === 'object') {
      const record = error as { error?: { description?: string }; description?: string };
      if (record.error) return record.error.description || String(record.error);
      if (record.description) return record.description;
    }
  } catch {
    return 'Payment failed. Please try again later.';
  }
  return 'Payment failed. Please try again later.';
}

function parsePayloadParam(payload: string | string[] | undefined) {
  if (!payload) return {};

  try {
    return typeof payload === 'string'
      ? (JSON.parse(payload) as Record<string, unknown>)
      : Array.isArray(payload)
        ? {}
        : (payload as Record<string, unknown>);
  } catch {
    return {};
  }
}

export function CompletePaymentScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams();
  const setPaymentResult = useBookingDraftStore((state) => state.setPaymentResult);
  const pendingCheckout = useBookingDraftStore((state) => state.pendingCheckout);
  const setPendingCheckout = useBookingDraftStore((state) => state.setPendingCheckout);
  const profile = useTenantProfile();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const initDataRef = useRef<InitPaymentData | null>(null);
  const verifyPaymentRef = useRef<
    ((initData: InitPaymentData, razorpayData: { razorpay_payment_id: string; razorpay_signature: string }) => Promise<void>) | null
  >(null);

  const amount = params.amount ? parseFloat(String(params.amount)) : 0;
  const paymentType = (params.type as string) || 'invoice';
  const initApi = (params.initApi as string) || 'api/hello/v2/payments/init';
  const verifyApi = (params.verifyApi as string) || 'api/hello/v2/payments/verify_payment';
  const email = (params.email as string) || '';
  const mobile = (params.mobile as string) || '';
  const description = (params.description as string) || 'Payment';
  const eventId = (params.paymentFor as string) || '';
  const eventName = (params.eventName as string) || '';
  const moveInDate =
    paymentType === 'booking'
      ? pendingCheckout?.draft.moveInDate ?? ''
      : (params.moveInDate as string) || '';

  const paymentPayload =
    paymentType === 'booking' && pendingCheckout
      ? buildBookingPaymentPayload(pendingCheckout)
      : parsePayloadParam(params.payload);

  const bookingSummary = pendingCheckout?.summary ?? null;

  const completeBookingPayment = useCallback(
    (initData: InitPaymentData) => {
      setPaymentResult({
        invoiceId: initData.id ? String(initData.id) : buildInvoiceId(),
        paidAmount: initData.amount ?? amount,
        moveInDate,
        paymentDate: new Date().toISOString(),
      });
      setPendingCheckout(null);
      resetRootRoute('/booking-success');
    },
    [amount, moveInDate, setPaymentResult, setPendingCheckout],
  );

  const completeEventPayment = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['community-events'] });
    router.replace({
      pathname: '/community-registration-confirmed',
      params: {
        id: eventId,
        name: eventName,
      },
    });
  }, [eventId, eventName, queryClient, router]);

  const handlePaymentSuccess = useCallback(
    (initData?: InitPaymentData) => {
      if (paymentType === 'booking' && initData) {
        completeBookingPayment(initData);
        return;
      }
      if (paymentType === 'events') {
        completeEventPayment();
        return;
      }
      setStatus('success');
    },
    [completeBookingPayment, completeEventPayment, paymentType],
  );

  useEffect(() => {
    if (!CFPaymentGatewayService) return;

    CFPaymentGatewayService.setCallback({
      onVerify(orderID) {
        const initData = initDataRef.current;
        if (
          (paymentType === 'booking' ||
            paymentType === 'events' ||
            paymentType === 'invoice' ||
            paymentType === 'movein') &&
          initData &&
          verifyPaymentRef.current
        ) {
          void verifyPaymentRef.current(initData, {
            razorpay_payment_id: orderID,
            razorpay_signature: orderID,
          });
          return;
        }
        handlePaymentSuccess();
      },
      onError(error) {
        setStatus('failed');
        setErrorMessage(error?.getMessage?.() || 'Payment failed');
      },
    });

    return () => {
      CFPaymentGatewayService?.removeCallback();
      CFPaymentGatewayService?.removeEventSubscriber();
    };
  }, [handlePaymentSuccess, paymentType]);

  function buildVerifyPayload(
    initData: InitPaymentData,
    razorpayData: { razorpay_payment_id: string; razorpay_signature: string },
  ) {
    const isCashfree = Boolean(initData.paymentObj.paymentSessionId);

    if (paymentType === 'booking') {
      return buildBookingVerifyPayload(initData, razorpayData, initData.amount ?? amount);
    }

    if (paymentType === 'movein') {
      const bookingId =
        (params.bookingId as string) || profile?.bookingId || (params.paymentFor as string) || '';

      if (isCashfree) {
        return {
          bookingId,
          transactionId: initData.paymentObj.transactionId,
          amount,
          paymentMethod: 'upi',
          payment_gateway: 'cashfree',
          orderId: initData.paymentObj.orderId ?? razorpayData.razorpay_payment_id,
        };
      }

      return {
        bookingId,
        transactionId: initData.paymentObj.transactionId,
        amount,
        paymentMethod: 'UPI',
        razorpayPaymentId: razorpayData.razorpay_payment_id,
        razorpaySignature: razorpayData.razorpay_signature,
      };
    }

    if (isCashfree && paymentType === 'invoice') {
      return {
        ...paymentPayload,
        transactionId: initData.paymentObj.transactionId,
        amount,
        paymentMethod: 'upi',
        paymentMode: 'cashfree',
        orderId: initData.paymentObj.orderId ?? razorpayData.razorpay_payment_id,
      };
    }

    return {
      ...paymentPayload,
      transactionId: initData.paymentObj.transactionId,
      amount,
      paymentMethod: 'UPI',
      razorpayPaymentId: razorpayData.razorpay_payment_id,
      razorpaySignature: razorpayData.razorpay_signature,
    };
  }

  const verifyPayment = useCallback(
    async (
      initData: InitPaymentData,
      razorpayData: { razorpay_payment_id: string; razorpay_signature: string },
    ) => {
      try {
        const verifyPayload = buildVerifyPayload(initData, razorpayData);
        const { success, message } = await postVerifyPayment(verifyApi, verifyPayload);
        if (success) {
          handlePaymentSuccess(initData);
        } else {
          setStatus('failed');
          setErrorMessage(message || 'Payment verification failed');
        }
      } catch (error) {
        setStatus('failed');
        setErrorMessage(error instanceof Error ? error.message : 'Payment verification failed');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [amount, handlePaymentSuccess, params.bookingId, params.paymentFor, paymentPayload, paymentType, profile?.bookingId, verifyApi],
  );

  useEffect(() => {
    verifyPaymentRef.current = verifyPayment;
  }, [verifyPayment]);

  async function startCashfreeCheckout(initData: InitPaymentData) {
    if (!CFPaymentGatewayService || !CFSession || !CFEnvironment) {
      setStatus('failed');
      setErrorMessage('Payment gateway not available. Please use a development build.');
      return;
    }

    try {
      const session = new CFSession(
        initData.paymentObj.paymentSessionId ?? '',
        initData.paymentObj.orderId ?? '',
        config.BASE_URL === 'https://api.thehelloworld.com'
          ? CFEnvironment.PRODUCTION
          : CFEnvironment.SANDBOX,
      );
      CFPaymentGatewayService.doWebPayment(session);
    } catch (error) {
      setStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to open payment gateway');
    }
  }

  useEffect(() => {
    void getPaymentLogoImage();
  }, []);

  async function startRazorpayCheckout(initData: InitPaymentData) {
    if (!RazorpayCheckout) {
      setStatus('failed');
      setErrorMessage('Payment gateway not available. Please use a development build.');
      return;
    }

    try {
      const paymentLogo = await getPaymentLogoImage();
      const options = {
        description,
        image: paymentLogo,
        currency: 'INR',
        key: initData.paymentObj.razaorpayKey ?? '',
        amount: Math.round((initData.amount ?? amount) * 100),
        name: 'HelloWorld Technologies',
        contact: mobile,
        email: email.trim(),
        order_id: initData.paymentObj.orderId,
        notes: { ...(initData.paymentObj.notes ?? {}) },
      };

      const razorpayData = await RazorpayCheckout.open(options);
      await verifyPayment(initData, razorpayData);
    } catch (error) {
      setStatus('failed');
      setErrorMessage(parseRazorpayError(error));
    }
  }

  function openGateway(initData: InitPaymentData) {
    if (initData.paymentObj.paymentSessionId) {
      void startCashfreeCheckout(initData);
      return;
    }
    void startRazorpayCheckout(initData);
  }

  const initPayment = useCallback(async () => {
    if (paymentType === 'booking' && !pendingCheckout) {
      setStatus('failed');
      setErrorMessage('Booking payment session expired. Please try again from the booking screen.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    const { data, success, message: apiMessage, payments } = await postInitiatePayment(
      initApi,
      paymentPayload,
    );

    if (!success) {
      setStatus('failed');
      setErrorMessage(apiMessage || 'Failed to initiate payment.');
      return;
    }

    const paymentRecord = (payments ?? data?.paymentObj ?? {}) as InitPaymentData['paymentObj'] & {
      amount?: number;
    };
    const resolvedAmount =
      typeof paymentRecord.amount === 'number'
        ? paymentRecord.amount
        : typeof data?.amount === 'number'
          ? data.amount
          : amount;

    const initData: InitPaymentData = {
      paymentObj: paymentRecord,
      amount: resolvedAmount,
      id: data?.id as string | undefined,
      data: data as Record<string, unknown> | undefined,
    };
    initDataRef.current = initData;

    setTimeout(() => {
      openGateway(initData);
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCheckout, paymentType]);

  useEffect(() => {
    void initPayment();
  }, [initPayment]);

  if (status === 'loading') {
    return (
      <View style={styles.loadingRoot}>
        <TenantScreenHeader title="Complete Payment" onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.lime[700]} />
          <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.loadingText}>
            Processing payment...
          </Typography>
        </View>
      </View>
    );
  }

  if (status === 'failed') {
    if (paymentType === 'booking') {
      const transactionId = initDataRef.current?.paymentObj.transactionId;
      const resolvedSummary = {
        ...(bookingSummary ?? {
          invoiceId: buildInvoiceId(),
          date: new Date().toISOString(),
          lines: [{ label: 'Booking payment', amount }],
          discounts: [],
          total: amount,
        }),
        invoiceId:
          transactionId != null
            ? String(transactionId)
            : bookingSummary?.invoiceId ?? buildInvoiceId(),
      };

      return (
        <BookingPaymentFailedView
          summary={resolvedSummary}
          errorMessage={errorMessage}
          onRetry={initPayment}
        />
      );
    }

    return <PaymentErrorView message={errorMessage} onRetry={initPayment} />;
  }

  return (
    <PaymentSuccessView
      isInvoicePayment={paymentType === 'invoice'}
      isMoveInPayment={paymentType === 'movein'}
    />
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: palette.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.white,
    gap: 12,
  },
  loadingText: {
    marginTop: 8,
  },
});
