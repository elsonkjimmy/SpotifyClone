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
  TouchableOpacity,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import ComposantCarteMusique from '../components/ComposantCarteMusique';
import { chargerEtJouerUneListeDeMusiques } from '../services/ServiceLecteurAudio';
import { recupererToutesLesChansons } from '../services/firestore';

// Grille de catégories colorées (typique de Spotify)
const CATEGORIES_RECHERCHE = [
  { id: '1', nom: 'Podcasts', couleur: '#E13300' },
  { id: '2', nom: 'Créé pour vous', couleur: '#1E3264' },
  { id: '3', nom: 'Nouveautés', couleur: '#E8115B' },
  { id: '4', nom: 'Pop', couleur: '#148A08' },
  { id: '5', nom: 'Hip-hop', couleur: '#BC462B' },
  { id: '6', nom: 'Danse/Électro', couleur: '#D84000' },
  { id: '7', nom: 'Afro', couleur: '#E1118C' },
  { id: '8', nom: 'Ambiance', couleur: '#503750' },
];

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
        // Fallback local en cas d'erreur Firestore
        const musiquesDeSecours = [
          { id: 's1', title: 'Blinding Lights', artist: 'The Weeknd', artwork: 'https://i.scdn.co/image/ab67616d0000b273b3c3c7e3f8476a66a152331a' },
          { id: 's2', title: 'Starboy', artist: 'The Weeknd', artwork: 'https://i.scdn.co/image/ab67616d0000b2734718e5b124f7979288e1467a' },
          { id: 's3', title: 'One Dance', artist: 'Drake', artwork: 'https://i.scdn.co/image/ab67616d0000b2739418edfa6d914569485b00c5' }
        ];
        setToutesLesMusiques(musiquesDeSecours);
        setResultatsFiltres(musiquesDeSecours);
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

  // Composant pour chaque carré de catégorie
  const RenduCarteCategorie = ({ item }: any) => (
    <TouchableOpacity style={[styles.carteCategorie, { backgroundColor: item.couleur }]}>
      <Text style={styles.texteCategorie}>{item.nom}</Text>
    </TouchableOpacity>
  );

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
          <Search color={COLORS.black} size={22} style={styles.iconeLoupe} />
          <TextInput
            style={styles.champSaisie}
            placeholder="Que souhaitez-vous écouter ?"
            placeholderTextColor="#535353"
            value={texteRecherche}
            onChangeText={filtrerLesMusiquesSelonLaSaisie}
          />
        </View>
      </View>

      {/* Si l'utilisateur n'a rien tapé, on montre les catégories */}
      {texteRecherche.trim() === '' ? (
        <View style={{ flex: 1 }}>
          <Text style={styles.sousTitreSection}>Parcourir tout</Text>
          <FlatList
            data={CATEGORIES_RECHERCHE}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <RenduCarteCategorie item={item} />}
            contentContainerStyle={styles.grilleCategories}
          />
        </View>
      ) : (
        /* Sinon on montre les résultats de recherche */
        <FlatList
          data={resultatsFiltres}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listeResultats}
          columnWrapperStyle={styles.ligneGrille}
          renderItem={({ item }) => (
            <ComposantCarteMusique
              titre={item.title}
              artiste={item.artist}
              urlImage={item.artwork}
              actionAuClic={() => chargerEtJouerUneListeDeMusiques([item])}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.texteAucunResultat}>Aucune musique trouvée pour "{texteRecherche}"</Text>
          }
        />
      )}
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
    fontSize: 28,
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
    height: 48,
  },
  iconeLoupe: {
    marginRight: SPACING.s,
  },
  champSaisie: {
    flex: 1,
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '700',
  },
  sousTitreSection: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.m,
    marginTop: SPACING.s,
    marginBottom: SPACING.m,
  },
  grilleCategories: {
    paddingHorizontal: SPACING.m - 8,
  },
  carteCategorie: {
    flex: 1,
    height: 100,
    borderRadius: 5,
    margin: 8,
    padding: SPACING.m,
  },
  texteCategorie: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listeResultats: {
    paddingHorizontal: SPACING.m,
    paddingBottom: 100,
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
