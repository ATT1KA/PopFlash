import { PropsWithChildren } from 'react';
import { View, Text } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface SectionProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
}

export function Section({ title, subtitle, children }: SectionProps) {
  return (
    <View style={{ gap: spacing.sm }}>
      <View>
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: typography.bodyBold,
            fontSize: 18,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: typography.body,
              fontSize: 13,
              marginTop: spacing.xs,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}
