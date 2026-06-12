/**
 * Écran de Recherche (Search).
 * Permet à l'utilisateur de trouver des musiques par titre ou artiste.
 * Style : Glassmorphism premium avec fond en dégradé profond.
 */
import React, {useCallback, useState} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';
import {Search} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SPACING} from '../theme/colors';
import ComposantCarteMusique from '../components/ComposantCarteMusique';
import {chargerEtJouerUneListeDeMusiques} from '../services/ServiceLecteurAudio';
import {recupererToutesLesChansons} from '../services/firestore';
import type {Chanson} from '../types';
import {
  obtenirModeHorsLigne,
  estChansonTelechargee,
} from '../services/ServiceTelechargement';

const CATEGORIES_RECHERCHE = [
  {id: '1', nom: 'Pop', couleur: 'rgba(20, 138, 8, 0.4)', genre: 'Pop'},
  {id: '2', nom: 'Afro', couleur: 'rgba(225, 17, 140, 0.4)', genre: 'Afro'},
  {
    id: '3',
    nom: 'Hip-hop',
    couleur: 'rgba(188, 70, 43, 0.4)',
    genre: 'Hip-hop',
  },
  {
    id: '4',
    nom: 'Créé pour vous',
    couleur: 'rgba(30, 50, 100, 0.4)',
    genre: null,
  },
  {id: '5', nom: 'Nouveautés', couleur: 'rgba(232, 17, 91, 0.4)', genre: null},
  {
    id: '6',
    nom: 'Danse/Électro',
    couleur: 'rgba(216, 64, 0, 0.4)',
    genre: 'Électro',
  },
  {id: '7', nom: 'Ambiance', couleur: 'rgba(80, 55, 80, 0.4)', genre: null},
  {
    id: '8',
    nom: 'Podcasts',
    couleur: 'rgba(225, 51, 0, 0.4)',
    genre: 'Podcast',
  },
];

const EcranRecherche = () => {
  const [texteRecherche, setTexteRecherche] = useState('');
  const [toutesLesMusiques, setToutesLesMusiques] = useState<Chanson[]>([]);
  const [resultatsFiltres, setResultatsFiltres] = useState<Chanson[]>([]);
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(true);
  const [categorieActive, setCategorieActive] = useState<string | null>(null);

  const chargerMusiques = useCallback(async () => {
    setEstEnTrainDeCharger(true);
    try {
      let musiques = await recupererToutesLesChansons();
      if (obtenirModeHorsLigne()) {
        musiques = musiques.filter(m => estChansonTelechargee(m.id));
      }
      setToutesLesMusiques(musiques);
      setResultatsFiltres(musiques);
    } catch (erreur) {
      console.log('Erreur recherche:', erreur);
    } finally {
      setEstEnTrainDeCharger(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      chargerMusiques();
    }, [chargerMusiques]),
  );

  const filtrerLesMusiquesSelonLaSaisie = (texte: string) => {
    setTexteRecherche(texte);
    setCategorieActive(null);

    if (texte.trim() === '') {
      setResultatsFiltres(toutesLesMusiques);
      return;
    }

    const musiquesTrouvees = toutesLesMusiques.filter(musique => {
      const titreCorrespond = musique.title
        .toLowerCase()
        .includes(texte.toLowerCase());
      const artisteCorrespond = musique.artist
        .toLowerCase()
        .includes(texte.toLowerCase());
      return titreCorrespond || artisteCorrespond;
    });

    setResultatsFiltres(musiquesTrouvees);
  };

  const filtrerParCategorie = (nom: string, genre: string | null) => {
    setCategorieActive(nom);
    setTexteRecherche(nom);

    if (!genre) {
      setResultatsFiltres(toutesLesMusiques);
      return;
    }

    setResultatsFiltres(
      toutesLesMusiques.filter(
        m => m.genre?.toLowerCase() === genre.toLowerCase(),
      ),
    );
  };

  const jouerMusique = async (item: Chanson) => {
    await chargerEtJouerUneListeDeMusiques(
      [item, ...toutesLesMusiques.filter(m => m.id !== item.id)],
      0,
      'Recherche',
    );
  };

  const renderCarteCategorie = ({
    item,
  }: {
    item: (typeof CATEGORIES_RECHERCHE)[0];
  }) => (
    <TouchableOpacity
      style={[
        styles.carteCategorie,
        {backgroundColor: item.couleur},
        categorieActive === item.nom && styles.carteCategorieActive,
      ]}
      onPress={() => filtrerParCategorie(item.nom, item.genre)}>
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

  const afficherCategories = texteRecherche.trim() === '' && !categorieActive;

  return (
    <View style={styles.conteneurPrincipal}>
      <LinearGradient
        colors={['#061a29', '#030c14', COLORS.black]}
        style={styles.degradeFond}
      />
      <SafeAreaView style={styles.zoneSafe}>
        <View style={styles.entete}>
          <Text style={styles.titrePage}>Recherche</Text>
          <View style={styles.conteneurBarreSaisie}>
            <Search
              color="rgba(255, 255, 255, 0.6)"
              size={22}
              style={styles.iconeLoupe}
            />
            <TextInput
              style={styles.champSaisie}
              placeholder="Que souhaitez-vous écouter ?"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={texteRecherche}
              onChangeText={filtrerLesMusiquesSelonLaSaisie}
            />
          </View>
        </View>

        {afficherCategories ? (
          <View style={styles.zoneCategories}>
            <Text style={styles.sousTitreSection}>Parcourir tout</Text>
            <FlatList
              data={CATEGORIES_RECHERCHE}
              numColumns={2}
              keyExtractor={item => item.id}
              renderItem={renderCarteCategorie}
              contentContainerStyle={styles.grilleCategories}
            />
          </View>
        ) : (
          <FlatList
            data={resultatsFiltres}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.listeResultats}
            columnWrapperStyle={styles.ligneGrille}
            renderItem={({item}) => (
              <ComposantCarteMusique
                titre={item.title}
                artiste={item.artist}
                urlImage={item.artwork}
                actionAuClic={() => jouerMusique(item)}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.texteAucunResultat}>
                Aucune musique trouvée pour "{texteRecherche}"
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {flex: 1, backgroundColor: COLORS.black},
  zoneSafe: {flex: 1},
  degradeFond: {...StyleSheet.absoluteFillObject},
  centrerContenu: {justifyContent: 'center', alignItems: 'center'},
  entete: {padding: SPACING.m},
  titrePage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.m,
  },
  conteneurBarreSaisie: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Barre translucide
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: SPACING.s,
    height: 48,
  },
  iconeLoupe: {marginRight: SPACING.s},
  champSaisie: {flex: 1, color: COLORS.white, fontSize: 15, fontWeight: '600'},
  zoneCategories: {flex: 1},
  sousTitreSection: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.m,
    marginTop: SPACING.s,
    marginBottom: SPACING.m,
  },
  grilleCategories: {paddingHorizontal: SPACING.m - 8},
  carteCategorie: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    margin: 8,
    padding: SPACING.m,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Effet vitré
    // Ombre délicate
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  carteCategorieActive: {borderWidth: 2, borderColor: COLORS.white},
  texteCategorie: {color: COLORS.white, fontSize: 16, fontWeight: 'bold'},
  listeResultats: {paddingHorizontal: SPACING.m, paddingBottom: 100},
  ligneGrille: {justifyContent: 'space-between'},
  texteAucunResultat: {
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});

export default EcranRecherche;
