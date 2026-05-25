/**
 * Écran de Recherche (Search).
 * Permet à l'utilisateur de trouver des musiques par titre ou artiste.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import ComposantCarteMusique from '../components/ComposantCarteMusique';
import { chargerEtJouerUneListeDeMusiques } from '../services/ServiceLecteurAudio';
import { recupererToutesLesChansons } from '../services/firestore';

const EcranRecherche = () => {
  const [texteRecherche, setTexteRecherche] = useState('');
  const [toutesLesMusiques, setToutesLesMusiques] = useState<any[]>([]);
  const [resultatsFiltres, setResultatsFiltres] = useState<any[]>([]);
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(true);

  // Charger les musiques depuis Firestore au démarrage
  useEffect(() => {
    const chargerMusiques = async () => {
      try {
        const resultat = await recupererToutesLesChansons();
        const musiques = resultat.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setToutesLesMusiques(musiques);
        setResultatsFiltres(musiques);
      } catch (erreur) {
        console.log('Erreur recherche:', erreur);
      } finally {
        setEstEnTrainDeCharger(false);
      }
    };
    chargerMusiques();
  }, []);

  // Fonction explicite pour filtrer la liste en fonction de la saisie
  const filtrerLesMusiquesSelonLaSaisie = (texte: string) => {
    setTexteRecherche(texte);
    
    if (texte.trim() === '') {
      setResultatsFiltres(toutesLesMusiques);
      return;
    }

    const musiquesTrouvees = toutesLesMusiques.filter((musique) => {
      const titreCorrespond = musique.title.toLowerCase().includes(texte.toLowerCase());
      const artisteCorrespond = musique.artist.toLowerCase().includes(texte.toLowerCase());
      return titreCorrespond || artisteCorrespond;
    });

    setResultatsFiltres(musiquesTrouvees);
  };

  const gererLectureMusique = async (musiqueSelectionnee: any) => {
    await chargerEtJouerUneListeDeMusiques([musiqueSelectionnee]);
  };

  if (estEnTrainDeCharger) {
    return (
      <SafeAreaView style={[styles.conteneurPrincipal, styles.centrerContenu]}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      <View style={styles.entete}>
        <Text style={styles.titrePage}>Recherche</Text>
        
        {/* Barre de recherche stylisée Spotify */}
        <View style={styles.conteneurBarreSaisie}>
          <Search color={COLORS.black} size={20} style={styles.iconeLoupe} />
          <TextInput
            style={styles.champSaisie}
            placeholder="Que souhaitez-vous écouter ?"
            placeholderTextColor="#535353"
            value={texteRecherche}
            onChangeText={filtrerLesMusiquesSelonLaSaisie}
          />
        </View>
      </View>

      {/* Liste des résultats */}
      <FlatList
        data={resultatsFiltres}
        keyExtractor={(item) => item.id}
        numColumns={2} // Affichage en grille (2 colonnes)
        contentContainerStyle={styles.listeResultats}
        columnWrapperStyle={styles.ligneGrille}
        renderItem={({ item }) => (
          <ComposantCarteMusique
            titre={item.title}
            artiste={item.artist}
            urlImage={item.artwork}
            actionAuClic={() => gererLectureMusique(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.texteAucunResultat}>Aucune musique trouvée pour "{texteRecherche}"</Text>
        }
      />
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
  entete: {
    padding: SPACING.m,
  },
  titrePage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.m,
  },
  conteneurBarreSaisie: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: SPACING.s,
    height: 45,
  },
  iconeLoupe: {
    marginRight: SPACING.s,
  },
  champSaisie: {
    flex: 1,
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '600',
  },
  listeResultats: {
    paddingHorizontal: SPACING.m,
    paddingBottom: 100, // Pour ne pas être caché par le mini lecteur
  },
  ligneGrille: {
    justifyContent: 'space-between',
  },
  texteAucunResultat: {
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default EcranRecherche;
