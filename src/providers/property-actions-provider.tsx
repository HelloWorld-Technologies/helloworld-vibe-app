import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { RequestCallbackSheet } from '@/components/callback/request-callback-sheet';
import { HdpVisitSheet } from '@/components/hdp/hdp-visit-sheet';
import type { PropertyActionTarget } from '@/types/property';

interface PropertyActionsContextValue {
  openRequestCallback: (target: PropertyActionTarget) => void;
  openScheduleVisit: (target: PropertyActionTarget) => void;
}

const PropertyActionsContext = createContext<PropertyActionsContextValue | null>(null);

function formatRentLabel(amount?: number) {
  if (!amount || amount <= 0) return '—';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function PropertyActionsProvider({
  children,
  defaultCity,
  defaultLocation,
}: {
  children: ReactNode;
  defaultCity?: string;
  defaultLocation?: string;
}) {
  const [callbackTarget, setCallbackTarget] = useState<PropertyActionTarget | null>(null);
  const [visitTarget, setVisitTarget] = useState<PropertyActionTarget | null>(null);
  const lastVisitTargetRef = useRef<PropertyActionTarget | null>(null);
  if (visitTarget) {
    lastVisitTargetRef.current = visitTarget;
  }
  const sheetTarget = visitTarget ?? lastVisitTargetRef.current;

  const openRequestCallback = useCallback((target: PropertyActionTarget) => {
    setCallbackTarget(target);
  }, []);

  const openScheduleVisit = useCallback((target: PropertyActionTarget) => {
    setVisitTarget(target);
  }, []);

  const value = useMemo(
    () => ({ openRequestCallback, openScheduleVisit }),
    [openRequestCallback, openScheduleVisit],
  );

  const visitRent = sheetTarget?.startingRent;
  const rentLabel = formatRentLabel(visitRent);

  return (
    <PropertyActionsContext.Provider value={value}>
      {children}
      <RequestCallbackSheet
        visible={callbackTarget != null}
        onClose={() => setCallbackTarget(null)}
        propertyName={callbackTarget?.propertyName ?? ''}
        location={callbackTarget?.location ?? defaultLocation}
        city={callbackTarget?.city ?? defaultCity}
        srp={Boolean(callbackTarget?.propertyId)}
      />
      {sheetTarget ? (
        <HdpVisitSheet
          visible={visitTarget != null}
          onClose={() => setVisitTarget(null)}
          propertyId={String(sheetTarget.propertyId)}
          propertyName={sheetTarget.propertyName}
          propertyLocation={sheetTarget.location}
          imageUri={sheetTarget.imageUri}
          rentLabel={rentLabel}
          depositLabel="—"
          startingRent={visitRent}
          initialTab="schedule"
          visitOnly
        />
      ) : null}
    </PropertyActionsContext.Provider>
  );
}

export function usePropertyActions() {
  const context = useContext(PropertyActionsContext);
  if (!context) {
    throw new Error('usePropertyActions must be used within PropertyActionsProvider');
  }
  return context;
}

export function useOptionalPropertyActions() {
  return useContext(PropertyActionsContext);
}
