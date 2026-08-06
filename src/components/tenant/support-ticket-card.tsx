import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { SupportTicket } from '@/types/ticket';
import { formatDisplayDate, isActiveTicket } from '@/utils/tenant-format';

type SupportTicketCardProps = {
  ticket: SupportTicket;
};

export function SupportTicketCard({ ticket }: SupportTicketCardProps) {
  const router = useRouter();
  const active = isActiveTicket(ticket.status);
  const createdAt = ticket.createdTime ?? ticket.created_at;
  const resolvedAt = (ticket as { resolved_at?: string }).resolved_at;
  const ticketNumber = ticket.ticket_number ?? ticket.id;

  function openDetails() {
    router.push({
      pathname: '/ticket-details',
      params: {
        id: String(ticket.id),
        subject: ticket.subject ?? 'Support ticket',
        ticketNumber: String(ticketNumber),
        status: ticket.status ?? 'Open',
        createdTime: createdAt ?? '',
      },
    });
  }

  return (
    <Pressable style={styles.card} onPress={openDetails} accessibilityRole="button">
      <View style={styles.headerRow}>
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

      <View style={styles.metaRow}>
        <Typography variant="label" size="xs" color={palette.gray[500]}>
          Ticket ID: {ticketNumber}
        </Typography>
        <Typography variant="label" size="xs" weight="medium" color={palette.gray[900]}>
          {active
            ? `Raised on ${formatDisplayDate(createdAt)}`
            : `Resolved on ${formatDisplayDate(resolvedAt ?? createdAt)}`}
        </Typography>
      </View>

      <Pressable style={styles.detailsLink} onPress={openDetails} accessibilityRole="button">
        <Typography variant="text" size="sm" weight="medium" color={palette.lime[700]}>
          View Details
        </Typography>
        <HwSymbol name="chevron.right" size={12} tintColor={palette.lime[700]} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.318 },
    shadowOpacity: 0.2,
    shadowRadius: 10.2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  subject: {
    flex: 1,
    color: palette.gray[900],
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeActive: {
    backgroundColor: palette.blue[50],
  },
  badgeResolved: {
    backgroundColor: palette.lime[50],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailsLink: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
