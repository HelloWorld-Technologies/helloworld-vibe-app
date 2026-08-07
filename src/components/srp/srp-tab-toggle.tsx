import { useMemo } from 'react';

import { SegmentedTabToggle } from '@/components/ui/segmented-tab-toggle';

export type SrpTab = 'properties' | 'details';

type SrpTabToggleProps = {
  value: SrpTab;
  onChange: (tab: SrpTab) => void;
  /** When true, the details tab is labeled "Locality Details". */
  hasLocality?: boolean;
};

export function SrpTabToggle({ value, onChange, hasLocality = false }: SrpTabToggleProps) {
  const tabs = useMemo(
    () => [
      { id: 'properties' as const, label: 'Coliving PGs' },
      {
        id: 'details' as const,
        label: hasLocality ? 'Locality Details' : 'City Details',
      },
    ],
    [hasLocality],
  );

  return <SegmentedTabToggle value={value} onChange={onChange} tabs={tabs} />;
}
