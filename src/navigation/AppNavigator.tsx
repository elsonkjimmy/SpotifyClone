/**
 * Ce fichier gère la navigation principale de l'application.
 * Il permet d'accéder à l'application sans forcément se connecter.
 */
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Search, Library, User } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import EcranRecherche from '../screens/SearchScreen';
import EcranMaBibliotheque from '../screens/LibraryScreen';
import EcranMonCompte from '../screens/AccountScreen';
import EcranDeConnexion from '../screens/LoginScreen';
import EcranDInscription from '../screens/RegisterScreen';
import EcranLecteurPleinEcran from '../screens/PlayerScreen';
import EcranAjouterMusique from '../screens/AddMusicScreen';
import EcranDetailPlaylist from '../screens/PlaylistDetailScreen';
import EcranDemarrage from '../screens/SplashScreen';

import MiniLecteurAudio from '../components/MiniLecteurAudio';
import { COLORS } from '../theme/colors';
import { surveillerChangementEtatAuthentification } from '../services/auth';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Le navigateur par onglets avec 4 écrans désormais
const NavigateurParOnglets = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.tabBarBackground,
            borderTopWidth: 0,
            height: 60,
            paddingBottom: 5,
          },
          tabBarActiveTintColor: COLORS.green,
          tabBarInactiveTintColor: COLORS.lightGray,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Accueil',
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Search"
          component={EcranRecherche}
          options={{
            tabBarLabel: 'Recherche',
            tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Library"
          component={EcranMaBibliotheque}
          options={{
            tabBarLabel: 'Bibliothèque',
            tabBarIcon: ({ color, size }) => <Library color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Account"
          component={EcranMonCompte}
          options={{
            tabBarLabel: 'Compte',
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
      <MiniLecteurAudio />
    </View>
  );
};

const AppNavigator = () => {
  const [utilisateurConnecte, setUtilisateurConnecte] = useState<any>(null);
  const [estEnTrainDInitialiser, setEstEnTrainDInitialiser] = useState(true);

  useEffect(() => {
    const desabonner = surveillerChangementEtatAuthentification((etatUtilisateur) => {
      setUtilisateurConnecte(etatUtilisateur);
      
      // Delai Splash Screen
      setTimeout(() => {
        setEstEnTrainDInitialiser(false);
      }, 2000);
    });
    return desabonner;
  }, []);

  if (estEnTrainDInitialiser) return <EcranDemarrage />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* On peut maintenant entrer dans l'app sans login */}
      <Stack.Screen name="Main" component={NavigateurParOnglets} />
      
      {/* Écrans additionnels accessibles depuis la stack */}
      <Stack.Screen name="Player" component={EcranLecteurPleinEcran} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddMusic" component={EcranAjouterMusique} options={{ presentation: 'modal' }} />
      <Stack.Screen name="PlaylistDetail" component={EcranDetailPlaylist} />
      <Stack.Screen name="Login" component={EcranDeConnexion} />
      <Stack.Screen name="Register" component={EcranDInscription} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
