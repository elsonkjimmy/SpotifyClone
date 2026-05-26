import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { COLORS } from '../theme/colors';

type SpotifyLogoProps = {
  size?: number;
  showWordmark?: boolean;
  wordmarkColor?: string;
};

const SpotifyLogo = ({
  size = 48,
  showWordmark = false,
  wordmarkColor = COLORS.white,
}: SpotifyLogoProps) => {
  return (
    <View style={styles.conteneur}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Circle cx="32" cy="32" r="30" fill={COLORS.green} />
        <Path
          d="M18 24c10-3 22-2 31 4"
          stroke={COLORS.black}
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M20 34c8-2.5 18-1.4 26 3.5"
          stroke={COLORS.black}
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M22 43c7-1.8 14-.9 20 3"
          stroke={COLORS.black}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      {showWordmark && (
        <Text style={[styles.wordmark, { color: wordmarkColor }]}>Spotify</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  conteneur: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmark: {
    marginLeft: 10,
    fontSize: 28,
    fontWeight: '800',
  },
});

export default SpotifyLogo;
