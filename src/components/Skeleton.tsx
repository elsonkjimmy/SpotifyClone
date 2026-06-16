import React from 'react';
import {Animated, View, StyleSheet, Dimensions} from 'react-native';

const Skeleton = ({width, height, borderRadius = 4, style}: any) => {
  const opacity = new Animated.Value(0.3);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {toValue: 1, duration: 800, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 0.3, duration: 800, useNativeDriver: true}),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {width, height, borderRadius, opacity},
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#333',
  },
});

export default Skeleton;
