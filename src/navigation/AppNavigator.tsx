/**
 * Ce fichier gère la navigation principale de l'application.
 * Il décide si on affiche les écrans de connexion ou l'application principale.
 */
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Search, Library } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import EcranRecherche from '../screens/SearchScreen';
import EcranMaBibliotheque from '../screens/LibraryScreen';
import EcranDeConnexion from '../screens/LoginScreen';
import EcranDInscription from '../screens/RegisterScreen';
import EcranLecteurPleinEcran from '../screens/PlayerScreen';
import EcranAjouterMusique from '../screens/AddMusicScreen';
import MiniLecteurAudio from '../components/MiniLecteurAudio';
import { COLORS } from '../theme/colors';
import { surveillerChangementEtatAuthentification } from '../services/auth';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Le navigateur par onglets (bas de l'écran) pour l'application une fois connecté
const NavigateurParOnglets = () => {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.tabBarBackground,
            borderTopWidth: 0,
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

      </Tab.Navigator>
      
      {/* On affiche le mini lecteur ici pour qu'il soit par-dessus la navigation */}
      <MiniLecteurAudio />
    </View>
  );
};

// Le navigateur principal qui gère le flux Login vs App
const AppNavigator = () => {
  const [utilisateurConnecte, setUtilisateurConnecte] = useState<any>(null);
  const [estEnTrainDInitialiser, setEstEnTrainDInitialiser] = useState(true);

  useEffect(() => {
    // On écoute Firebase pour savoir si un utilisateur est déjà connecté
    const desabonner = surveillerChangementEtatAuthentification((etatUtilisateur) => {
      setUtilisateurConnecte(etatUtilisateur);
      if (estEnTrainDInitialiser) setEstEnTrainDInitialiser(false);
    });
    return desabonner;
  }, []);

  // Si Firebase n'a pas encore répondu, on n'affiche rien (écran blanc temporaire)
  if (estEnTrainDInitialiser) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {utilisateurConnecte ? (
        // Si l'utilisateur est connecté, on montre les onglets principaux
        <>
          <Stack.Screen name="Main" component={NavigateurParOnglets} />
          <Stack.Screen 
            name="Player" 
            component={EcranLecteurPleinEcran} 
            options={{ presentation: 'modal' }} 
          />
          <Stack.Screen 
            name="AddMusic" 
            component={EcranAjouterMusique} 
            options={{ presentation: 'modal' }} 
          />
        </>
      ) : (
        // Sinon, on montre les écrans de connexion/inscription
        <>
          <Stack.Screen name="Login" component={EcranDeConnexion} />
          <Stack.Screen name="Register" component={EcranDInscription} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
