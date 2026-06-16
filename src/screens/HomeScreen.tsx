/**
 * Écran d'accueil principal de l'application.
 * Affiche les différentes sections de musiques et de playlists.
 */
import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
} from 'react-native';
import {Bell, Clock, Settings} from 'lucide-react-native';
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SPACING} from '../theme/colors';
import SectionHeader from '../components/SectionHeader';
import ComposantCarteMusique from '../components/ComposantCarteMusique';
import Skeleton from '../components/Skeleton';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';
import OfflineBanner from '../components/OfflineBanner';
import {chargerEtJouerUneListeDeMusiques} from '../services/ServiceLecteurAudio';
import {recupererToutesLesChansons} from '../services/firestore';
import {recupererHistorique} from '../services/ServiceHistorique';
import type {Chanson} from '../types';
import {
  obtenirModeHorsLigne,
  estChansonTelechargee,
} from '../services/ServiceTelechargement';

// ─── Sous-composant : Carte Raccourci Animée avec Effet de Rebond ───
const CarteRaccourciAnimee = ({
  item,
  surAppui,
}: {
  item: Chanson;
  surAppui: () => void;
}) => {
  const valeurEchelle = useRef(new Animated.Value(1)).current;

  const gererAppui = useCallback(() => {
    Animated.sequence([
      Animated.timing(valeurEchelle, {
        toValue: 0.95,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(valeurEchelle, {
        toValue: 1.0,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
    surAppui();
  }, [surAppui, valeurEchelle]);

  return (
    <Animated.View
      style={[
        styles.conteneurCarteRaccourciAnim,
        {transform: [{scale: valeurEchelle}]},
      ]}>
      <TouchableOpacity
        style={styles.carteRaccourci}
        onPress={gererAppui}
        activeOpacity={0.85}>
        <Image source={{uri: item.artwork}} style={styles.imageRaccourci} />
        <Text style={styles.titreRaccourci} numberOfLines={2}>
          {item.title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EcranAccueil = ({navigation}: any) => {
  const {utilisateur} = useAuth();
  const {showToast} = useToast();
  const [listeDesMusiques, setListeDesMusiques] = useState<Chanson[]>([]);
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(true);
  const [filtreActif, setFiltreActif] = useState<
    'Tout' | 'Musique' | 'Podcasts'
  >('Tout');
  // Historique d'écoute : liste des chansons récemment jouées
  const [historiqueEcoute, setHistoriqueEcoute] = useState<Chanson[]>([]);
  const animationPulsation = useState(new Animated.Value(0.3))[0];

  const obtenirSalutation = () => {
    const heure = new Date().getHours();
    if (heure < 12) return 'Bonjour';
    if (heure < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const chargerLesDonneesDepuisFirebase = useCallback(async () => {
    setEstEnTrainDeCharger(true);
    try {
      const musiques = await recupererToutesLesChansons();
      setListeDesMusiques(musiques);
    } catch (erreur) {
      console.log('Erreur lors du chargement des musiques:', erreur);
    } finally {
      setTimeout(() => setEstEnTrainDeCharger(false), 600);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      chargerLesDonneesDepuisFirebase();
      // Rafraîchir l'historique d'écoute à chaque retour sur l'écran d'accueil
      setHistoriqueEcoute(recupererHistorique());
    }, [chargerLesDonneesDepuisFirebase]),
  );

  useEffect(() => {
    if (estEnTrainDeCharger) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animationPulsation, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(animationPulsation, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [estEnTrainDeCharger, animationPulsation]);

  let musiquesFiltrees = listeDesMusiques.filter(m => {
    if (filtreActif === 'Musique') return m.genre !== 'Podcast';
    if (filtreActif === 'Podcasts') return m.genre === 'Podcast';
    return true;
  });

  if (obtenirModeHorsLigne()) {
    musiquesFiltrees = musiquesFiltrees.filter(m =>
      estChansonTelechargee(m.id),
    );
  }

  // Fallback : si après filtrage c'est vide mais qu'on a des musiques au total, 
  // on affiche tout pour éviter un écran vide frustrant pour l'utilisateur
  const afficherMessageVide = musiquesFiltrees.length === 0 && !estEnTrainDeCharger;

  const gererLectureMusique = async (musiqueSelectionnee: Chanson) => {
    const baseList = obtenirModeHorsLigne()
      ? listeDesMusiques.filter(m => estChansonTelechargee(m.id))
      : listeDesMusiques;
    const fileAttente = [
      musiqueSelectionnee,
      ...baseList.filter(m => m.id !== musiqueSelectionnee.id),
    ];
    await chargerEtJouerUneListeDeMusiques(fileAttente, 0, 'Écoutés récemment');
  };

  const renderSqueletteChargement = () => (
    <View style={styles.conteneurPrincipal}>
      <View style={styles.entetePremium}>
        <Skeleton width={200} height={30} />
      </View>
      <View style={styles.grilleSquelette}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} width="47%" height={56} style={{margin: '1.5%'}} />
        ))}
      </View>
    </View>
  );

  if (estEnTrainDeCharger) {
    return renderSqueletteChargement();
  }

  const renderRaccourci = ({item}: {item: Chanson}) => (
    <CarteRaccourciAnimee
      item={item}
      surAppui={() =>
        navigation.navigate('PlaylistDetail', {
          playlist: {
            id: item.id,
            nom: item.title,
            image: item.artwork,
            createur: `Playlist • ${item.artist}`,
            songIds: [item.id],
          },
        })
      }
    />
  );

  return (
    <View style={styles.conteneurPrincipal}>
      <LinearGradient
        colors={['#082414', '#050f14', COLORS.black]}
        style={styles.degradeFond}
      />
      <SafeAreaView style={styles.zoneSafe}>
        <OfflineBanner />
        <View style={styles.entetePremium}>
          <View style={styles.ligneUtilisateur}>
            <View style={styles.avatarCercleSmall}>
              <Text style={styles.texteAvatarSmall}>
                {utilisateur?.email?.charAt(0).toUpperCase() || 'G'}
              </Text>
            </View>
            <Text style={styles.titrePagePremium}>{obtenirSalutation()}</Text>
            
            <View style={styles.iconesAction}>
              <TouchableOpacity
                style={styles.boutonIcone}
                onPress={() =>
                  showToast('Aucune nouvelle notification')
                }>
                <Bell color={COLORS.white} size={22} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.boutonIcone}
                onPress={() => navigation.navigate('Account')}>
                <Clock color={COLORS.white} size={22} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.boutonIcone}
                onPress={() => navigation.navigate('Account')}>
                <Settings color={COLORS.white} size={22} />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.barreFiltres}>
            {(['Tout', 'Musique', 'Podcasts'] as const).map(filtre => (
              <TouchableOpacity
                key={filtre}
                style={[
                  styles.piluleFiltre,
                  filtreActif === filtre && styles.piluleFiltreActive,
                ]}
                onPress={() => setFiltreActif(filtre)}>
                <Text
                  style={[
                    styles.texteFiltre,
                    filtreActif === filtre && styles.texteFiltreActive,
                  ]}>
                  {filtre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {afficherMessageVide ? (
            <View style={styles.conteneurVideAccueil}>
              <Text style={styles.texteVide}>
                {obtenirModeHorsLigne() 
                  ? "Vous êtes actuellement en mode hors-ligne. Seuls vos titres téléchargés s'affichent ici." 
                  : (filtreActif === 'Podcasts' 
                    ? "Les podcasts arrivent bientôt sur votre application Spotify Clone !" 
                    : "Aucune musique ne correspond à votre sélection.")
                }
              </Text>
              <TouchableOpacity 
                style={styles.boutonReinitialiser}
                onPress={() => {
                  if (obtenirModeHorsLigne()) {
                    navigation.navigate('Account');
                  } else {
                    setFiltreActif('Tout');
                  }
                }}
              >
                <Text style={styles.texteBoutonReinitialiser}>
                  {obtenirModeHorsLigne() ? "DÉSACTIVER LE MODE HORS-LIGNE" : "VOIR TOUT LE CATALOGUE"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.sectionRaccourcis}>
                <FlatList
                  data={musiquesFiltrees.slice(0, 6)}
                  numColumns={2}
                  scrollEnabled={false}
                  keyExtractor={item => 'raccourci-' + item.id}
                  renderItem={renderRaccourci}
                />
              </View>

              <SectionHeader title="Écoutés récemment" />
              <FlatList
                data={
                  obtenirModeHorsLigne()
                    ? historiqueEcoute.filter(m => estChansonTelechargee(m.id))
                    : historiqueEcoute.length > 0
                    ? historiqueEcoute
                    : musiquesFiltrees
                }
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => 'recent-' + item.id}
                contentContainerStyle={styles.listeHorizontale}
                renderItem={({item}) => (
                  <ComposantCarteMusique
                    musique={item}
                    actionAuClic={() => gererLectureMusique(item)}
                  />
                )}
              />

              <SectionHeader title="Fait pour vous" />
              <FlatList
                data={[...musiquesFiltrees].reverse()}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => 'recommandé-' + item.id}
                contentContainerStyle={styles.listeHorizontale}
                renderItem={({item}) => (
                  <ComposantCarteMusique
                    musique={item}
                    actionAuClic={() => gererLectureMusique(item)}
                  />
                )}
              />

              <SectionHeader title="Mix personnalisés" />
              <FlatList
                data={[...musiquesFiltrees].sort(() => Math.random() - 0.5)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => 'mix-' + item.id}
                contentContainerStyle={styles.listeHorizontale}
                renderItem={({item}) => (
                  <ComposantCarteMusique
                    musique={item}
                    actionAuClic={() => gererLectureMusique(item)}
                  />
                )}
              />
            </>
          )}
          <View style={styles.espaceBas} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {flex: 1, backgroundColor: COLORS.black},
  zoneSafe: {flex: 1},
  conteneurCarteRaccourciAnim: {flex: 1},
  degradeFond: {position: 'absolute', top: 0, left: 0, right: 0, height: 300},
  entetePremium: {
    paddingTop: SPACING.m,
    paddingHorizontal: SPACING.m,
    marginBottom: 5,
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
  barreFiltres: {flexDirection: 'row', marginBottom: 10},
  piluleFiltre: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginRight: 8,
  },
  piluleFiltreActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  texteFiltre: {color: COLORS.white, fontSize: 13, fontWeight: '500'},
  texteFiltreActive: {color: COLORS.black, fontWeight: 'bold'},
  sectionRaccourcis: {
    paddingHorizontal: SPACING.m - 4,
    marginTop: 10,
    marginBottom: SPACING.m,
  },
  carteRaccourci: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)', // Verre givré translucide
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', // Bordure blanche translucide
    borderRadius: 8, // Arrondi plus moderne
    margin: 4,
    height: 56,
    overflow: 'hidden',
    // Ombre légère
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageRaccourci: {width: 56, height: 56},
  titreRaccourci: {
    flex: 1,
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  listeHorizontale: {paddingLeft: SPACING.m},
  conteneurVideAccueil: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  texteVide: {
    color: COLORS.lightGray,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  boutonReinitialiser: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  texteBoutonReinitialiser: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  espaceBas: {height: 120},
});

export default EcranAccueil;
