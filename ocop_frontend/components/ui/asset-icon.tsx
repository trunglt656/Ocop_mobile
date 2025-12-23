import React from 'react';
import { Image } from 'expo-image';
import { StyleProp, ImageStyle } from 'react-native';

// Map icon names to asset paths
const ICON_MAP = {
  // Navigation
  'home': require('@/assets/icon/home_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'menu': require('@/assets/icon/menu_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'menu-open': require('@/assets/icon/menu_open_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'arrow-back': require('@/assets/icon/arrow_back_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'close': require('@/assets/icon/close_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  
  // Actions
  'add': require('@/assets/icon/add_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'search': require('@/assets/icon/search_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'refresh': require('@/assets/icon/refresh_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'backspace': require('@/assets/icon/backspace_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'settings': require('@/assets/icon/settings_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  
  // Content
  'shop': require('@/assets/icon/shop_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'star': require('@/assets/icon/star_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'apps': require('@/assets/icon/apps_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'news': require('@/assets/icon/news_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  'add-home': require('@/assets/icon/add_home_work_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'),
  
  // Aliases for common uses (using existing icons creatively)
  'clock': require('@/assets/icon/refresh_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'), // Đang xử lý
  'checkmark': require('@/assets/icon/add_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'), // Đã giao (dùng add như checkmark)
  'creditcard': require('@/assets/icon/apps_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'), // Đã chi
  'medal': require('@/assets/icon/star_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'), // Hạng thành viên
  'history': require('@/assets/icon/refresh_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'), // Lịch sử
  'location': require('@/assets/icon/add_home_work_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'), // Địa chỉ
  'chart': require('@/assets/icon/apps_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'), // Tổng quan
  'sparkles': require('@/assets/icon/star_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'), // Tiện ích
  'logout': require('@/assets/icon/close_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'), // Đăng xuất
  'power': require('@/assets/icon/close_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg'), // Power icon
} as const;

export type AssetIconName = keyof typeof ICON_MAP;

interface AssetIconProps {
  name: AssetIconName;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
}

/**
 * Component để hiển thị SVG icons từ assets/icon
 * Sử dụng expo-image để render SVG
 */
export function AssetIcon({ name, size = 24, color, style }: AssetIconProps) {
  const iconSource = ICON_MAP[name];

  return (
    <Image
      source={iconSource}
      style={[
        {
          width: size,
          height: size,
          tintColor: color,
        },
        style,
      ]}
      contentFit="contain"
    />
  );
}
