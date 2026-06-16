import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {WifiOff} from 'lucide-react-native';
import {COLORS} from '../theme/colors';
import {useOffline} from '../hooks/useOffline';

const OfflineBanner = () => {
  const estHorsLigne = useOffline();

  if (!estHorsLigne) return null;

  return (
    <View style={styles.banner}>
      <WifiOff color={COLORS.black} size={16} />
      <Text style={styles.text}>Mode hors-ligne activé</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  text: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default OfflineBanner;
