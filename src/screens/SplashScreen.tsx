/**
 * Écran de démarrage (Splash Screen).
 * S'affiche pendant 2 secondes au lancement de l'application.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../theme/colors';
import SpotifyLogo from '../components/SpotifyLogo';

const EcranDemarrage = ({ navigation }: any) => {
  const animationOpacite = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'apparition du logo
    Animated.sequence([
      Animated.timing(animationOpacite, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
    ]).start();
  }, []);

  return (
    <View style={styles.conteneur}>
      <Animated.View style={{ opacity: animationOpacite }}>
        <View style={styles.conteneurLogo}>
          <SpotifyLogo size={100} />
          <Text style={styles.texteSpotify}>SPOTIFY</Text>
          <Text style={styles.slogan}>Your Music, Your Way</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteneurLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  texteSpotify: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    letterSpacing: 2,
  },
  slogan: {
    color: COLORS.green,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 12,
    letterSpacing: 1,
    fontWeight: '500',
  },
});

export default EcranDemarrage;
