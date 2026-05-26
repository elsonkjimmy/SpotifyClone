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
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING } from '../theme/colors';
import SectionHeader from '../components/SectionHeader';
import ComposantCarteMusique from '../components/ComposantCarteMusique';
import SpotifyLogo from '../components/SpotifyLogo';
import { chargerEtJouerUneListeDeMusiques } from '../services/ServiceLecteurAudio';
import { recupererToutesLesChansons, ajouterDesMusiquesDeTest } from '../services/firestore';

const EcranAccueil = () => {
  const [listeDesMusiques, setListeDesMusiques] = useState<any[]>([]);
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(true);

  // Fonction pour charger les données depuis Firebase
  const chargerLesDonneesDepuisFirebase = async () => {
    try {
      // Fonction de chargement encapsulée
      const chargerDonnees = async () => {
        await ajouterDesMusiquesDeTest();
        const resultat = await recupererToutesLesChansons();
        return resultat.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      };

      // Si Firestore ne répond pas sous 4 secondes, on bascule sur les données locales
      const musiquesRecuperees = await Promise.race([
        chargerDonnees(),
        new Promise<any[]>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de connexion Firestore')), 4000)
        )
      ]);
      
      setListeDesMusiques(musiquesRecuperees);
    } catch (erreur) {
      console.log('Erreur lors du chargement des musiques:', erreur);
      // Données de secours en cas d'erreur réseau ou de service Firestore désactivé pour le TP
      setListeDesMusiques([
        { 
          id: 'secours-1',
          title: 'Blinding Lights', 
          artist: 'The Weeknd', 
          artwork: 'https://picsum.photos/id/111/300/300',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        },
        { 
          id: 'secours-2',
          title: 'Starboy', 
          artist: 'The Weeknd', 
          artwork: 'https://picsum.photos/id/122/300/300',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
        },
        { 
          id: 'secours-3',
          title: 'One Dance', 
          artist: 'Drake', 
          artwork: 'https://picsum.photos/id/133/300/300',
          url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        }
      ]);
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
        
        {/* En-tête de bienvenue avec les catégories Spotify */}
        <View style={styles.sectionEnTete}>
          <SpotifyLogo size={38} showWordmark />
          <Text style={styles.texteBienvenue}>Bonjour !</Text>

          {/* Catégories Spotify (Tout, Musique, Podcasts) */}
          <View style={styles.conteneurCategories}>
            <TouchableOpacity style={styles.piluleCategorieActive}>
              <Text style={styles.texteCategorieActive}>Tout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.piluleCategorie}>
              <Text style={styles.texteCategorie}>Musique</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.piluleCategorie}>
              <Text style={styles.texteCategorie}>Podcasts</Text>
            </TouchableOpacity>
          </View>
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
    marginTop: SPACING.m,
  },
  conteneurCategories: {
    flexDirection: 'row',
    marginTop: SPACING.m,
  },
  piluleCategorieActive: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: SPACING.s,
  },
  piluleCategorie: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: SPACING.s,
  },
  texteCategorieActive: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: 'bold',
  },
  texteCategorie: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  listeHorizontale: {
    paddingLeft: SPACING.m,
  },
});

export default EcranAccueil;
