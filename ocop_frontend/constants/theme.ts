/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#007AFF'; // A slightly more vibrant blue
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000', // Pure black for highest contrast
    background: '#F2F2F7', // A slightly off-white background
    tint: tintColorLight,
    icon: '#2C2C2E', // A darker gray for icons
    tabIconDefault: '#8E8E93', // A standard gray for inactive tabs
    tabIconSelected: tintColorLight,
    card: '#fff', // White cards for content
    border: '#E5E5EA', // A light gray for borders
    primary: '#007AFF',
    secondary: '#FF3B30', // A vibrant red for destructive actions
    muted: '#8E8E93',
  },
  dark: {
    text: '#000', // Pure black for highest contrast
    background: '#000', // Pure black background
    tint: tintColorDark,
    icon: '#E5E5EA', // A light gray for icons
    tabIconDefault: '#8E8E93', // A standard gray for inactive tabs
    tabIconSelected: tintColorDark,
    card: '#1C1C1E', // A dark gray for cards
    border: '#38383A', // A medium gray for borders
    primary: '#007AFF',
    secondary: '#FF3B30',
    muted: '#8E8E93',
  },
};

export const Sizes = {
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  small: 14,
  caption: 12,

  // Icon sizes
  icon: 24,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
