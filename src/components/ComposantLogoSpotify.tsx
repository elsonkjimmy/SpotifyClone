/**
 * Composant Logo Spotify.
 * Affiche l'icône officielle stylisée.
 */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {COLORS} from '../theme/colors';
import {Music2} from 'lucide-react-native';

interface LogoProps {
  taille?: number;
}

const ComposantLogoSpotify = ({taille = 50}: LogoProps) => {
  return (
    <View
      style={[
        styles.cercle,
        {width: taille, height: taille, borderRadius: taille / 2},
      ]}>
      <Music2 color={COLORS.black} size={taille * 0.6} fill={COLORS.black} />
    </View>
  );
};

const styles = StyleSheet.create({
  cercle: {
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ComposantLogoSpotify;
