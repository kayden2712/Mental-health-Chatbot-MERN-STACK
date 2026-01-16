// Dự phòng cho việc sử dụng MaterialIcons trên Android và web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Thêm các ánh xạ SF Symbols sang Material Icons của bạn tại đây.
 * - xem Material Icons trong [Thư mục Icons](https://icons.expo.fyi).
 * - xem SF Symbols trong ứng dụng [SF Symbols](https://developer.apple.com/sf-symbols/).
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'message.fill': 'chat',
  'calendar': 'event',
  'person.fill': 'person',
  'building.2.fill': 'business',
} as IconMapping;

/**
 * Component icon sử dụng SF Symbols native trên iOS, và Material Icons trên Android và web.
 * Điều này đảm bảo giao diện nhất quán trên các nền tảng và sử dụng tài nguyên tối ưu.
 * Tên icon dựa trên SF Symbols và yêu cầu ánh xạ thủ công sang Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
