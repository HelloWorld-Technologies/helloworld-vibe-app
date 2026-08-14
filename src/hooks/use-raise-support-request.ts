import { useQueryClient } from '@tanstack/react-query';
import { router as expoRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { getKbCategories, postCreateTicket } from '@/api/tickets';
import { getUploadedAttachmentUrls } from '@/components/support/ticket-attachments-field';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantProfile } from '@/stores/tenant-store';
import type { RaiseSupportRequestPayload } from '@/types/ticket';

export function useRaiseSupportRequest() {
  const queryClient = useQueryClient();
  const profile = useTenantProfile();
  const selectedCity = useAuthStore((state) => state.selectedCity);
  const [sheetVisible, setSheetVisible] = useState(false);

  const openRaiseRequest = useCallback(() => {
    void queryClient.prefetchQuery({
      queryKey: ['kb-categories'],
      queryFn: getKbCategories,
    });
    setSheetVisible(true);
  }, [queryClient]);

  const closeRaiseRequest = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const submitRaiseRequest = useCallback(
    async (payload: RaiseSupportRequestPayload) => {
      if (payload.category === 'move-out') {
        setSheetVisible(false);
        setTimeout(() => {
          expoRouter.push({
            pathname: '/profile/move-out',
            params: { from: 'support' },
          });
        }, 360);
        return;
      }

      if (!profile?.userInfo?.email) {
        throw new Error('We could not find your account email. Please try again.');
      }

      const result = await postCreateTicket({
        category: payload.category,
        subCategory: payload.subCategory,
        subCategoryId: payload.subCategoryId,
        description: payload.description,
        email: profile.userInfo.email,
        propertyName: profile.propertyInfo?.name,
        city: selectedCity ?? profile.propertyInfo?.locality,
        bookingId: profile.bookingId,
        propertyId: profile.propertyInfo?.propertyId,
        attachments: getUploadedAttachmentUrls(payload.attachments ?? []),
      });

      if (!result.success || !result.ticketNumber) {
        throw new Error(result.message ?? 'Failed to create ticket');
      }

      await queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      return result.ticketNumber;
    },
    [profile, queryClient, selectedCity],
  );

  return {
    sheetVisible,
    openRaiseRequest,
    closeRaiseRequest,
    submitRaiseRequest,
  };
}
