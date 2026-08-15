import type { AndroidSymbol } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

/** Cross-platform SymbolView name — bare SF strings render only on iOS. */
export type PlatformSymbolName = {
  ios: SFSymbol;
  android: AndroidSymbol;
  web: AndroidSymbol;
};

type SymbolNameInput = SFSymbol | string | PlatformSymbolName | {
  ios?: SFSymbol;
  android?: AndroidSymbol;
  web?: AndroidSymbol;
};

/** SF Symbol → Material Symbols (Android / web via expo-symbols). */
const SF_TO_ANDROID: Record<string, AndroidSymbol> = {
  'arrow.clockwise': 'refresh',
  'arrow.down.circle': 'arrow_circle_down',
  'arrow.down.left': 'south_west',
  'arrow.right': 'arrow_forward',
  'arrow.up.right': 'north_east',
  'bed.double.fill': 'bed',
  'bolt.fill': 'bolt',
  'building.2': 'apartment',
  calendar: 'calendar_today',
  'chart.bar.fill': 'bar_chart',
  checkmark: 'check',
  'checkmark.circle.fill': 'check_circle',
  'chevron.down': 'expand_more',
  'chevron.left': 'chevron_left',
  'chevron.right': 'chevron_right',
  clock: 'schedule',
  'clock.arrow.circlepath': 'history',
  creditcard: 'credit_card',
  'doc.on.doc': 'content_copy',
  'doc.text.fill': 'description',
  'door.left.hand.open': 'door_front',
  'ellipsis.circle': 'more_horiz',
  exclamationmark: 'priority_high',
  'exclamationmark.triangle': 'warning',
  'exclamationmark.triangle.fill': 'warning',
  'fork.knife': 'restaurant',
  headphones: 'headphones',
  heart: 'favorite_border',
  'heart.fill': 'favorite',
  'house.fill': 'home',
  'line.3.horizontal': 'menu',
  'line.3.horizontal.decrease': 'filter_list',
  'location.fill': 'location_on',
  'location.north.fill': 'navigation',
  magnifyingglass: 'search',
  mappin: 'place',
  'mappin.and.ellipse': 'map',
  paperclip: 'attach_file',
  'paperplane.fill': 'send',
  'pause.fill': 'pause',
  pencil: 'edit',
  person: 'person',
  'person.2.fill': 'group',
  'phone.fill': 'call',
  envelope: 'mail',
  'play.fill': 'play_arrow',
  plus: 'add',
  'speaker.slash.fill': 'volume_off',
  'speaker.wave.2.fill': 'volume_up',
  'square.and.arrow.down': 'download',
  'square.and.arrow.up': 'share',
  'star.fill': 'star',
  'video.fill': 'videocam',
  'wrench.and.screwdriver': 'handyman',
  xmark: 'close',
  'xmark.circle.fill': 'cancel',
};

export const BACK_CHEVRON_SYMBOL: PlatformSymbolName = {
  ios: 'chevron.left',
  android: 'chevron_left',
  web: 'chevron_left',
};

/** iOS share sheet glyph vs Android Material share. */
export const SHARE_SYMBOL: PlatformSymbolName = {
  ios: 'square.and.arrow.up',
  android: 'share',
  web: 'share',
};

function platformName(ios: SFSymbol, android: AndroidSymbol): PlatformSymbolName {
  return { ios, android, web: android };
}

/**
 * Resolve a SymbolView `name` so Android/web always get a Material symbol.
 * Passes through explicit `{ ios, android, web }` objects unchanged when android is set.
 */
export function resolvePlatformSymbol(name: SymbolNameInput): PlatformSymbolName | { ios?: SFSymbol; android?: AndroidSymbol; web?: AndroidSymbol } {
  if (name != null && typeof name === 'object') {
    if (name.android) {
      return {
        ios: name.ios,
        android: name.android,
        web: name.web ?? name.android,
      };
    }
    if (name.ios) {
      const android = SF_TO_ANDROID[name.ios];
      if (android) return platformName(name.ios, android);
    }
    return name;
  }

  const ios = name as SFSymbol;
  const android = SF_TO_ANDROID[ios];
  if (android) return platformName(ios, android);

  // Unknown SF name: keep iOS glyph; Android falls back via SymbolView `fallback` if provided.
  return { ios };
}
