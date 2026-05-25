/**
 * Écran d'accueil principal de l'application.
 * Affiche les différentes sections de musiques et de playlists.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../theme/colors';
import SectionHeader from '../components/SectionHeader';
import ComposantCarteMusique from '../components/ComposantCarteMusique';
import { chargerEtJouerUneListeDeMusiques } from '../services/ServiceLecteurAudio';
import { recupererToutesLesChansons, ajouterDesMusiquesDeTest } from '../services/firestore';

const EcranAccueil = () => {
  const [listeDesMusiques, setListeDesMusiques] = useState<any[]>([]);
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(true);

  // Fonction pour charger les données depuis Firebase
  const chargerLesDonneesDepuisFirebase = async () => {
    try {
      // Étape 1 : On s'assure qu'il y a des données de test (pour le TP)
      await ajouterDesMusiquesDeTest();
      
      // Étape 2 : On récupère les musiques de Firestore
      const resultat = await recupererToutesLesChansons();
      const musiquesRecuperees = resultat.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setListeDesMusiques(musiquesRecuperees);
    } catch (erreur) {
      console.log('Erreur lors du chargement des musiques:', erreur);
    } finally {
      setEstEnTrainDeCharger(false);
    }
  };

  useEffect(() => {
    chargerLesDonneesDepuisFirebase();
  }, []);

  const gererLectureMusique = async (musiqueSelectionnee: any) => {
    await chargerEtJouerUneListeDeMusiques([musiqueSelectionnee, ...listeDesMusiques.filter(m => m.id !== musiqueSelectionnee.id)]);
  };

  if (estEnTrainDeCharger) {
    return (
      <SafeAreaView style={[styles.conteneurPrincipal, styles.centrerContenu]}>
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text style={styles.texteChargement}>Chargement de la musique...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* En-tête de bienvenue */}
        <View style={styles.sectionEnTete}>
          <Text style={styles.texteBienvenue}>Bonjour !</Text>
        </View>

        {/* Section : Écoutés récemment */}
        <SectionHeader title="Écoutés récemment" />
        <FlatList
          data={listeDesMusiques}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listeHorizontale}
          renderItem={({ item }) => (
            <ComposantCarteMusique
              titre={item.title}
              artiste={item.artist}
              urlImage={item.artwork}
              actionAuClic={() => gererLectureMusique(item)}
            />
          )}
        />

        {/* Section : Vos playlists préférées */}
        <SectionHeader title="Vos playlists préférées" />
        <FlatList
          data={[...listeDesMusiques].reverse()} // Juste pour varier
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listeHorizontale}
          renderItem={({ item }) => (
            <ComposantCarteMusique
              titre={item.title}
              artiste={item.artist}
              urlImage={item.artwork}
              actionAuClic={() => gererLectureMusique(item)}
            />
          )}
        />

        {/* Section : Recommandé pour vous */}
        <SectionHeader title="Recommandé pour vous" />
        <FlatList
          data={listeDesMusiques}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listeHorizontale}
          renderItem={({ item }) => (
            <ComposantCarteMusique
              titre={item.title}
              artiste={item.artist}
              urlImage={item.artwork}
              actionAuClic={() => gererLectureMusique(item)}
            />
          )}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  centrerContenu: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  texteChargement: {
    color: COLORS.white,
    marginTop: SPACING.m,
    fontSize: 16,
  },
  sectionEnTete: {
    padding: SPACING.m,
    marginTop: SPACING.m,
  },
  texteBienvenue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  listeHorizontale: {
    paddingLeft: SPACING.m,
  },
});

export default EcranAccueil;
