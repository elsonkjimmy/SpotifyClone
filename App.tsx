import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AppNavigator from './src/navigation/AppNavigator';
import {COLORS} from './src/theme/colors';
import {initialiserLeLecteurAudio} from './src/services/ServiceLecteurAudio';
import {initialiserDonneesDeTest} from './src/services/firestore';
import {AuthProvider} from './src/context/AuthContext';
import {ToastProvider} from './src/context/ToastContext';

const App = () => {
  useEffect(() => {
    try {
      firestore().settings({persistence: false});
    } catch (e) {
      console.log('Firestore déjà initialisé');
    }

    initialiserLeLecteurAudio();
    initialiserDonneesDeTest();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
          <AppNavigator />
        </NavigationContainer>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
