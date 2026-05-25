import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/theme/colors';
import { initialiserLeLecteurAudio } from './src/services/ServiceLecteurAudio';

const App = () => {
  useEffect(() => {
    // On initialise le lecteur dès que l'application se lance
    initialiserLeLecteurAudio();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
