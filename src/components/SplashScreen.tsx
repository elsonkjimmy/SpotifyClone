import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {COLORS, SPACING} from '../theme/colors';
import SpotifyLogo from './SpotifyLogo';

const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.conteneur}>
      <View style={styles.centre}>
        <SpotifyLogo size={96} />
        <Text style={styles.nomApplication}>Spotify</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.l,
  },
  nomApplication: {
    color: COLORS.black,
    fontSize: 38,
    fontWeight: '900',
    marginTop: SPACING.m,
  },
});

export default SplashScreen;
