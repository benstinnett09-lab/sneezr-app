import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { colors, textVariants, type TextVariant } from '../../theme';

export interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  muted?: boolean;
  children: React.ReactNode;
}

export function AppText({
  variant = 'body',
  muted = false,
  style,
  children,
  ...rest
}: AppTextProps) {
  const color = muted ? colors.textMuted : colors.text;
  return (
    <RNText
      style={[textVariants[variant], { color }, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
