import React, {useEffect, useRef} from 'react';
import {TouchableOpacity, Animated, StyleSheet} from 'react-native';
import {Mic} from 'lucide-react-native';
import {COLORS} from '../theme/colors';

interface Props {
  onPress: () => void;
  isListening: boolean;
}

const BoutonMicro = ({onPress, isListening}: Props) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {toValue: 1.2, duration: 600, useNativeDriver: true}),
          Animated.timing(scale, {toValue: 1, duration: 600, useNativeDriver: true}),
        ]),
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [isListening, scale]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.bouton}>
      <Animated.View style={{transform: [{scale}]}}>
        <Mic color={isListening ? COLORS.green : COLORS.white} size={24} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bouton: {
    padding: 10,
  },
});

export default BoutonMicro;
