/**
 * Ce fichier gère la navigation principale de l'application.
 * Il permet d'accéder à l'application sans forcément se connecter.
 */
import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Home, Search, Library, User} from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import EcranRecherche from '../screens/SearchScreen';
import EcranMaBibliotheque from '../screens/LibraryScreen';
import EcranMonCompte from '../screens/AccountScreen';
import EcranDeConnexion from '../screens/LoginScreen';
import EcranDInscription from '../screens/RegisterScreen';
import EcranLecteurPleinEcran from '../screens/PlayerScreen';
import EcranAjouterMusique from '../screens/AddMusicScreen';
import EcranDetailPlaylist from '../screens/PlaylistDetailScreen';
import EcranCreerPlaylist from '../screens/CreatePlaylistScreen';
import EcranDemarrage from '../screens/SplashScreen';
import EcranFileAttente from '../screens/QueueScreen';

import MiniLecteurAudio from '../components/MiniLecteurAudio';
import {COLORS} from '../theme/colors';
import {useAuth} from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const IconeAccueil = ({color, size}: {color: string; size: number}) => (
  <Home color={color} size={size} />
);
const IconeRecherche = ({color, size}: {color: string; size: number}) => (
  <Search color={color} size={size} />
);
const IconeBibliotheque = ({color, size}: {color: string; size: number}) => (
  <Library color={color} size={size} />
);
const IconeCompte = ({color, size}: {color: string; size: number}) => (
  <User color={color} size={size} />
);

const NavigateurParOnglets = () => {
  return (
    <View style={styles.conteneurOnglets}>
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
        }}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Accueil',
            tabBarIcon: IconeAccueil,
          }}
        />
        <Tab.Screen
          name="Search"
          component={EcranRecherche}
          options={{
            tabBarLabel: 'Recherche',
            tabBarIcon: IconeRecherche,
          }}
        />
        <Tab.Screen
          name="Library"
          component={EcranMaBibliotheque}
          options={{
            tabBarLabel: 'Bibliothèque',
            tabBarIcon: IconeBibliotheque,
          }}
        />
        <Tab.Screen
          name="Account"
          component={EcranMonCompte}
          options={{
            tabBarLabel: 'Compte',
            tabBarIcon: IconeCompte,
          }}
        />
      </Tab.Navigator>
      <MiniLecteurAudio />
    </View>
  );
};

const AppNavigator = () => {
  const {chargement} = useAuth();
  const [afficherSplash, setAfficherSplash] = useState(true);

  useEffect(() => {
    if (!chargement) {
      const timer = setTimeout(() => setAfficherSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [chargement]);

  if (chargement || afficherSplash) {
    return <EcranDemarrage />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Main" component={NavigateurParOnglets} />
      <Stack.Screen
        name="Player"
        component={EcranLecteurPleinEcran}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen
        name="Queue"
        component={EcranFileAttente}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen
        name="AddMusic"
        component={EcranAjouterMusique}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen name="PlaylistDetail" component={EcranDetailPlaylist} />
      <Stack.Screen
        name="CreatePlaylist"
        component={EcranCreerPlaylist}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen name="Login" component={EcranDeConnexion} />
      <Stack.Screen name="Register" component={EcranDInscription} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  conteneurOnglets: {
    flex: 1,
  },
});

export default AppNavigator;
