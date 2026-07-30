import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/tenant/dashboard/dashboard-section-header';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { DASHBOARD_TICKETS_PAGE_SIZE } from '@/queries/use-support-tickets';
import type { SupportTicket } from '@/types/ticket';
import { formatDisplayDate, isActiveTicket } from '@/utils/tenant-format';

type DashboardSupportPreviewProps = {
  tickets: SupportTicket[];
  onRaiseRequest: () => void;
};

function TicketPreviewRow({ ticket }: { ticket: SupportTicket }) {
  const router = useRouter();
  const active = isActiveTicket(ticket.status);
  const createdAt = ticket.createdTime ?? ticket.created_at;
  const resolvedAt = (ticket as { resolved_at?: string }).resolved_at;

  return (
    <Pressable
      style={styles.ticketRow}
      onPress={() =>
        router.push({
          pathname: '/ticket-details',
          params: {
            id: String(ticket.id),
            subject: ticket.subject ?? 'Support ticket',
            ticketNumber: String(ticket.ticket_number ?? ticket.id),
            status: ticket.status ?? 'Open',
            createdTime: createdAt ?? '',
          },
        })
      }
      accessibilityRole="button">
      <View style={styles.ticketHeader}>
        <Typography variant="text" size="sm" weight="medium" style={styles.subject} numberOfLines={1}>
          {ticket.subject ?? 'Support request'}
        </Typography>
        <View style={[styles.badge, active ? styles.badgeActive : styles.badgeResolved]}>
          <Typography
            variant="label"
            size="xs"
            weight="medium"
            color={active ? palette.blue[800] : palette.lime[800]}>
            {active ? 'In Progress' : 'Resolved'}
          </Typography>
        </View>
      </View>
      <Typography variant="label" size="xs" color={palette.gray[500]}>
        {active
          ? `Raised on ${formatDisplayDate(createdAt)}`
          : `Resolved on ${formatDisplayDate(resolvedAt ?? createdAt)}`}
      </Typography>
    </Pressable>
  );
}

export function DashboardSupportPreview({ tickets, onRaiseRequest }: DashboardSupportPreviewProps) {
  const router = useRouter();
  const previewTickets = tickets
    .filter((ticket) => isActiveTicket(ticket.status))
    .slice(0, DASHBOARD_TICKETS_PAGE_SIZE);

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title="Support"
        actionLabel="View All"
        onActionPress={() => router.push('/(tabs)/support')}
      />

      <View style={styles.card}>
        {previewTickets.map((ticket, index) => (
          <View key={ticket.id}>
            <TicketPreviewRow ticket={ticket} />
            {index < previewTickets.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}

        <Pressable style={styles.raiseButton} onPress={onRaiseRequest} accessibilityRole="button">
          <SymbolView name="plus" size={16} tintColor={palette.gray[800]} />
          <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
            Raise New Request
          </Typography>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 16,
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  ticketRow: {
    gap: 6,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  subject: {
    flex: 1,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeActive: {
    backgroundColor: palette.blue[100],
  },
  badgeResolved: {
    backgroundColor: palette.lime[50],
  },
  divider: {
    height: 1,
    backgroundColor: palette.gray[200],
    marginVertical: 12,
  },
  raiseButton: {
    minHeight: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[300],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
