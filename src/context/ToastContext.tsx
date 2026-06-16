import React, {createContext, useContext, useState, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../theme/colors';

type ToastType = 'info' | 'success' | 'error';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const showToast = (msg: string, t: ToastType = 'info') => {
    setMessage(msg);
    setType(t);

    Animated.parallel([
      Animated.timing(opacity, {toValue: 1, duration: 300, useNativeDriver: true}),
      Animated.timing(translateY, {toValue: 0, duration: 300, useNativeDriver: true}),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {toValue: 0, duration: 300, useNativeDriver: true}),
        Animated.timing(translateY, {toValue: 20, duration: 300, useNativeDriver: true}),
      ]).start();
    }, 2500);
  };

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toast,
          {
            opacity,
            transform: [{translateY}],
            backgroundColor: type === 'success' ? COLORS.green : 'rgba(40, 40, 40, 0.95)',
          },
        ]}>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  text: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
