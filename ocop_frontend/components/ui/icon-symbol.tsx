// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'bag.fill': 'shopping-bag',
  'heart.fill': 'favorite',
  'location.fill': 'location-on',
  'gearshape.fill': 'settings',
  'questionmark.circle.fill': 'help-outline',
  'person.circle.fill': 'account-circle',
  'rectangle.portrait.and.arrow.right': 'logout',
  // Additional icons for tab navigation and UI
  'square.grid.2x2': 'grid-view',
  'square.grid.2x2.fill': 'grid-view',
  'person.fill': 'person',
  'minus': 'remove',
  'plus': 'add',
  'trash': 'delete',
  'star.fill': 'star',
  'cart': 'shopping-cart',
  'bell.fill': 'notifications',
  'magnifyingglass': 'search',
  'gift.fill': 'card-giftcard',
  'star.circle.fill': 'stars',
  // Icons for product detail screen
  'exclamationmark.triangle': 'warning',
  'star.lefthalf.fill': 'star-half',
  'star': 'star-outline',
  'heart': 'favorite-border',
  'bag': 'shopping-bag',
  // Icons for order history
  'bag.badge.plus': 'add-shopping-cart',
  'arrow.triangle.2.circlepath': 'sync',
  'checkmark.circle.fill': 'check-circle',
  'dollarsign.circle.fill': 'account-balance-wallet',
  'calendar.badge.clock': 'event',
  'cube.box.fill': 'inventory',
  'arrow.right.circle.fill': 'arrow-circle-right',
  'shippingbox': 'local-shipping',
  'exclamationmark.triangle.fill': 'error',
  'tray': 'inbox',
  'mappin.and.ellipse': 'place',
  'clock.fill': 'schedule',
  'checkmark.seal.fill': 'verified',
  'creditcard.fill': 'credit-card',
  'calendar': 'calendar-today',
  'shippingbox.fill': 'local-shipping',
  // Icons for profile and settings
  'chevron.left': 'chevron-left',
  'camera.fill': 'camera-alt',
  'envelope.fill': 'email',
  'phone.fill': 'phone',
  'shield.fill': 'shield',
  'lock.fill': 'lock',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'info.circle.fill': 'info',
  'checkmark.shield.fill': 'verified-user',
  'xmark.circle.fill': 'cancel',
  'person.circle': 'account-circle',
  'person.badge.plus.fill': 'person-add',
  'pencil.circle.fill': 'edit',
  // Icons for home screen
  'arrow.turn.up.right': 'subdirectory-arrow-right',
  'arrow.clockwise': 'refresh',
  'arrow.right': 'arrow-forward',
  'sparkles': 'auto-awesome',
  'leaf.fill': 'eco',
  'tag.fill': 'local-offer',
} as IconMapping;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
