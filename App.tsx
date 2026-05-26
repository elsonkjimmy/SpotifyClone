import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/theme/colors';
import { initialiserLeLecteurAudio } from './src/services/ServiceLecteurAudio';

const App = () => {
  useEffect(() => {
    // 1. Configurer Firestore (persistence: false évite les timeouts sur émulateur)
    try {
      firestore().settings({ persistence: false });
    } catch (e) {
      console.log('Firestore déjà initialisé');
    }

    // 2. Initialiser le lecteur audio
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
