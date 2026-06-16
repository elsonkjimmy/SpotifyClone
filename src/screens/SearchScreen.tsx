/**
 * Écran de Recherche (Search).
 * Permet à l'utilisateur de trouver des musiques par titre ou artiste.
 * Style : Glassmorphism premium avec fond en dégradé profond.
 */
import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Search, Camera} from 'lucide-react-native';
import Voice from '@react-native-voice/voice';
import BoutonMicro from '../components/BoutonMicro';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SPACING} from '../theme/colors';
import ComposantCarteMusique from '../components/ComposantCarteMusique';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';
import {chargerEtJouerUneListeDeMusiques} from '../services/ServiceLecteurAudio';
import {recupererToutesLesChansons} from '../services/firestore';
import type {Chanson} from '../types';
import {
  obtenirModeHorsLigne,
  estChansonTelechargee,
  recupererChansonsTelechargees,
} from '../services/ServiceTelechargement';

const CATEGORIES_RECHERCHE = [
  {id: '1', nom: 'Pop', couleur: '#148A08', genre: 'Pop'},
  {id: '2', nom: 'Afro', couleur: '#E1118C', genre: 'Afro'},
  {id: '3', nom: 'Hip-hop', couleur: '#BC462B', genre: 'Hip-hop'},
  {id: '4', nom: 'Créé pour vous', couleur: '#1E3264', genre: null},
  {id: '5', nom: 'Nouveautés', couleur: '#E8115B', genre: null},
  {id: '6', nom: 'Électro', couleur: '#D84000', genre: 'Électro'},
  {id: '7', nom: 'Ambiance', couleur: '#503750', genre: null},
  {id: '8', nom: 'Podcasts', couleur: '#27856A', genre: 'Podcast'},
  {id: '9', nom: 'Rock', couleur: '#E91429', genre: 'Rock'},
  {id: '10', nom: 'Jazz', couleur: '#7D4B32', genre: 'Jazz'},
  {id: '11', nom: 'Classique', couleur: '#BA5D07', genre: 'Classique'},
  {id: '12', nom: 'Entraînement', couleur: '#477D95', genre: null},
  {id: '13', nom: 'Sommeil', couleur: '#1E3264', genre: null},
  {id: '14', nom: 'Focus', couleur: '#503750', genre: null},
];

const EcranRecherche = () => {
  const {utilisateur} = useAuth();
  const {showToast} = useToast();
  const [texteRecherche, setTexteRecherche] = useState('');
  const [toutesLesMusiques, setToutesLesMusiques] = useState<Chanson[]>([]);
  const [resultatsFiltres, setResultatsFiltres] = useState<Chanson[]>([]);
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(true);
  const [categorieActive, setCategorieActive] = useState<string | null>(null);
  const [estEnEcoute, setEstEnEcoute] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        filtrerLesMusiquesSelonLaSaisie(e.value[0]);
        showToast(`Recherche : ${e.value[0]}`, 'success');
      }
      setEstEnEcoute(false);
    };
    Voice.onSpeechError = (e: any) => {
      console.log('Erreur Voice:', e);
      setEstEnEcoute(false);
      showToast('Erreur de reconnaissance vocale', 'error');
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const gererRechercheVocale = async () => {
    if (estEnEcoute) {
      try {
        await Voice.stop();
      } catch (e) {
        console.log(e);
      }
      setEstEnEcoute(false);
    } else {
      setEstEnEcoute(true);
      try {
        await Voice.start('fr-FR');
        showToast('Écoute en cours...');
      } catch (e) {
        console.log(e);
        setEstEnEcoute(false);
        showToast('Impossible de démarrer le micro', 'error');
      }
    }
  };

  const chargerMusiques = useCallback(async () => {
    setEstEnTrainDeCharger(true);
    try {
      let musiques = await recupererToutesLesChansons();
      if (obtenirModeHorsLigne()) {
        const chansonsLocalesTelechargees = recupererChansonsTelechargees();
        const mapParId = new Map(musiques.map(m => [m.id, m]));
        chansonsLocalesTelechargees.forEach(chanson => {
          mapParId.set(chanson.id, chanson);
        });
        musiques = Array.from(mapParId.values());
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
        <View style={styles.entetePremium}>
          <View style={styles.ligneUtilisateur}>
            <View style={styles.avatarCercleSmall}>
              <Text style={styles.texteAvatarSmall}>
                {utilisateur?.email?.charAt(0).toUpperCase() || 'G'}
              </Text>
            </View>
            <Text style={styles.titrePagePremium}>Recherche</Text>
            
            <View style={styles.iconesAction}>
              <TouchableOpacity
                style={styles.boutonIcone}
                onPress={() =>
                  showToast('Recherche visuelle bientôt disponible')
                }>
                <Camera color={COLORS.white} size={24} />
              </TouchableOpacity>
            </View>
          </View>
          
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
            <BoutonMicro onPress={gererRechercheVocale} isListening={estEnEcoute} />
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
                musique={item}
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
  entetePremium: {
    paddingTop: SPACING.m,
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.m,
  },
  ligneUtilisateur: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarCercleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F57C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  texteAvatarSmall: {color: COLORS.black, fontWeight: 'bold', fontSize: 14},
  titrePagePremium: {fontSize: 22, fontWeight: 'bold', color: COLORS.white, flex: 1},
  iconesAction: {flexDirection: 'row', alignItems: 'center'},
  boutonIcone: {marginLeft: 20},
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
