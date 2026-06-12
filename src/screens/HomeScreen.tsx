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
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SPACING} from '../theme/colors';
import SectionHeader from '../components/SectionHeader';
import ComposantCarteMusique from '../components/ComposantCarteMusique';
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
  const [listeDesMusiques, setListeDesMusiques] = useState<Chanson[]>([]);
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(true);
  const [filtreActif, setFiltreActif] = useState<
    'Tout' | 'Musique' | 'Podcasts'
  >('Tout');
  // Historique d'écoute : liste des chansons récemment jouées
  const [historiqueEcoute, setHistoriqueEcoute] = useState<Chanson[]>([]);
  const animationPulsation = useState(new Animated.Value(0.3))[0];

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

  let musiquesFiltrees =
    filtreActif === 'Podcasts'
      ? []
      : listeDesMusiques.filter(m =>
          filtreActif === 'Musique' ? m.genre !== 'Podcast' : true,
        );

  if (obtenirModeHorsLigne()) {
    musiquesFiltrees = musiquesFiltrees.filter(m =>
      estChansonTelechargee(m.id),
    );
  }

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
    <SafeAreaView style={styles.conteneurPrincipal}>
      <ScrollView>
        <View style={styles.enteteSquelette}>
          <View style={styles.ligneFiltresSquelette}>
            {[1, 2, 3].map(i => (
              <Animated.View
                key={i}
                style={[styles.piluleSquelette, {opacity: animationPulsation}]}
              />
            ))}
          </View>
        </View>
        <View style={styles.grilleSquelette}>
          {[1, 2, 3, 4].map(i => (
            <Animated.View
              key={i}
              style={[
                styles.carteRaccourciSquelette,
                {opacity: animationPulsation},
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.sectionEnTete}>
            <View style={styles.ligneFiltres}>
              {(['Tout', 'Musique', 'Podcasts'] as const).map(filtre => (
                <TouchableOpacity
                  key={filtre}
                  style={
                    filtreActif === filtre ? styles.piluleActive : styles.pilule
                  }
                  onPress={() => setFiltreActif(filtre)}>
                  <Text
                    style={
                      filtreActif === filtre
                        ? styles.textePiluleActive
                        : styles.textePilule
                    }>
                    {filtre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {musiquesFiltrees.length === 0 ? (
            <Text style={styles.texteVide}>Aucun contenu pour ce filtre.</Text>
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
                    titre={item.title}
                    artiste={item.artist}
                    urlImage={item.artwork}
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
                    titre={item.title}
                    artiste={item.artist}
                    urlImage={item.artwork}
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
  sectionEnTete: {
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.m,
    marginBottom: SPACING.l,
  },
  ligneFiltres: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  piluleActive: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  textePiluleActive: {color: COLORS.black, fontSize: 13, fontWeight: 'bold'},
  pilule: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  textePilule: {color: COLORS.white, fontSize: 13, fontWeight: '600'},
  sectionRaccourcis: {
    paddingHorizontal: SPACING.m - 4,
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
  texteVide: {
    color: COLORS.lightGray,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  espaceBas: {height: 120},
  enteteSquelette: {marginBottom: 30, padding: SPACING.m},
  ligneFiltresSquelette: {flexDirection: 'row', marginTop: 20},
  piluleSquelette: {
    width: 80,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 10,
  },
  grilleSquelette: {flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.m},
  carteRaccourciSquelette: {
    width: '47%',
    height: 56,
    backgroundColor: '#222',
    borderRadius: 4,
    margin: '1.5%',
  },
});

export default EcranAccueil;
