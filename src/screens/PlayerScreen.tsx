/**
 * Écran du lecteur audio en plein écran.
 * Design Premium fidèle à Spotify avec dégradés et contrôles complets.
 */
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronDown,
  MoreHorizontal,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Heart,
  Share2,
  Laptop2,
  AlignLeft,
  ListMusic,
  Download,
  Edit3,
  Trash2,
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import {RepeatMode} from 'react-native-track-player';
import {COLORS, SPACING} from '../theme/colors';
import {
  basculerLecturePause,
  passerALaMusiqueSuivante,
  revenirALaMusiquePrecedente,
  basculerModeAleatoire,
  basculerModeRepetition,
  obtenirEtatModeAleatoire,
  obtenirModeRepetition,
  obtenirNomPlaylistCourante,
  partagerLaMusique,
  seekVersPosition,
  demarrerMinuteurVeille,
  obtenirTempsRestantMinuteur,
} from '../services/ServiceLecteurAudio';
import {
  estChansonTelechargee,
  telechargerChanson,
  supprimerChansonTelechargee,
} from '../services/ServiceTelechargement';
import {supprimerMusiqueDeFirestore} from '../services/firestore';
import {
  usePlaybackState,
  State,
  useActiveTrack,
  useProgress,
} from 'react-native-track-player';
import {useAuth} from '../context/AuthContext';
import BoutonLike from '../components/BoutonLike';
import ModalModifierMusique from '../components/ModalModifierMusique';

const {width} = Dimensions.get('window');

// Composant pour le visualiseur audio animé
const VisualiseurAudio = () => {
  const bar1 = useRef(new Animated.Value(3)).current;
  const bar2 = useRef(new Animated.Value(3)).current;
  const bar3 = useRef(new Animated.Value(3)).current;
  const bar4 = useRef(new Animated.Value(3)).current;
  const bar5 = useRef(new Animated.Value(3)).current;

  useEffect(() => {
    let actif = true;
    const animer = (
      val: Animated.Value,
      min: number,
      max: number,
      dur: number,
    ) => {
      if (!actif) {
        return;
      }
      Animated.sequence([
        Animated.timing(val, {
          toValue: Math.floor(Math.random() * (max - min + 1)) + min,
          duration: dur,
          useNativeDriver: false,
        }),
        Animated.timing(val, {
          toValue: Math.floor(Math.random() * (max - min + 1)) + min,
          duration: dur,
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (actif) {
          animer(val, min, max, dur);
        }
      });
    };

    animer(bar1, 5, 25, 280);
    animer(bar2, 5, 30, 320);
    animer(bar3, 5, 20, 250);
    animer(bar4, 5, 35, 350);
    animer(bar5, 5, 22, 290);

    return () => {
      actif = false;
    };
  }, [bar1, bar2, bar3, bar4, bar5]);

  return (
    <View style={styles.conteneurVisualiseur}>
      <Animated.View style={[styles.barreVisualiseur, {height: bar1}]} />
      <Animated.View style={[styles.barreVisualiseur, {height: bar2}]} />
      <Animated.View style={[styles.barreVisualiseur, {height: bar3}]} />
      <Animated.View style={[styles.barreVisualiseur, {height: bar4}]} />
      <Animated.View style={[styles.barreVisualiseur, {height: bar5}]} />
    </View>
  );
};

const EcranLecteurPleinEcran = ({navigation}: any) => {
  const {utilisateur} = useAuth();
  const etatLecture = usePlaybackState();
  const estEnTrainDeJouer = etatLecture.state === State.Playing;
  const morceauActuel = useActiveTrack();
  const {position, duration} = useProgress(250);
  const [positionLocale, setPositionLocale] = useState(0);
  const [modeAleatoireActif, setModeAleatoireActif] = useState(
    obtenirEtatModeAleatoire(),
  );
  const [modeRepetition, setModeRepetition] = useState(obtenirModeRepetition());
  // État pour afficher ou masquer le panneau de paroles
  const [afficherParoles, setAfficherParoles] = useState(false);
  const [secondesRestantes, setSecondesRestantes] = useState(0);
  const [estTelecharge, setEstTelecharge] = useState(false);
  const [estEnCoursDeTelechargement, setEstEnCoursDeTelechargement] =
    useState(false);
  const [modalEditionVisible, setModalEditionVisible] = useState(false);

  useEffect(() => {
    const intervalle = setInterval(() => {
      const restants = obtenirTempsRestantMinuteur();
      setSecondesRestantes(restants);
    }, 1000);
    return () => clearInterval(intervalle);
  }, []);

  useEffect(() => {
    if (morceauActuel?.id) {
      setEstTelecharge(estChansonTelechargee(morceauActuel.id));
    }
  }, [morceauActuel?.id]);

  const animationArt = useRef(new Animated.Value(1)).current;
  const animationTaillePlay = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(animationArt, {
      toValue: estEnTrainDeJouer ? 1.02 : 0.98,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [estEnTrainDeJouer, morceauActuel?.id, animationArt]);

  useEffect(() => {
    let actif = true;
    const animerBouton = () => {
      if (!estEnTrainDeJouer || !actif) {
        Animated.timing(animationTaillePlay, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        return;
      }

      Animated.sequence([
        Animated.timing(animationTaillePlay, {
          toValue: 1.06,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animationTaillePlay, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (actif) {
          animerBouton();
        }
      });
    };

    animerBouton();

    return () => {
      actif = false;
    };
  }, [estEnTrainDeJouer, animationTaillePlay]);

  const gererTelechargement = async () => {
    if (!morceauActuel?.id) {
      return;
    }
    if (estTelecharge) {
      Alert.alert(
        'Supprimer le téléchargement',
        'Voulez-vous supprimer ce morceau de vos téléchargements hors-ligne ?',
        [
          {text: 'Annuler', style: 'cancel'},
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              await supprimerChansonTelechargee(morceauActuel.id);
              setEstTelecharge(false);
              Alert.alert(
                'Supprimé',
                'Le morceau a été retiré des téléchargements.',
              );
            },
          },
        ],
      );
    } else {
      setEstEnCoursDeTelechargement(true);
      try {
        await telechargerChanson(morceauActuel);
        setEstTelecharge(true);
        Alert.alert(
          'Succès',
          'Le morceau a été téléchargé pour une écoute hors-ligne !',
        );
      } catch (erreur) {
        console.log('Erreur de téléchargement:', erreur);
      } finally {
        setEstEnCoursDeTelechargement(false);
      }
    }
  };

  const ouvrirMenuMinuteur = () => {
    Alert.alert(
      'Minuteur de veille ⏳',
      "Choisissez après combien de temps la musique doit s'arrêter automatiquement :",
      [
        {
          text: 'Désactiver le minuteur',
          onPress: () => demarrerMinuteurVeille(0),
        },
        {text: '5 minutes', onPress: () => demarrerMinuteurVeille(5)},
        {text: '15 minutes', onPress: () => demarrerMinuteurVeille(15)},
        {text: '30 minutes', onPress: () => demarrerMinuteurVeille(30)},
        {text: '60 minutes', onPress: () => demarrerMinuteurVeille(60)},
        {text: 'Fermer', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  useEffect(() => {
    setPositionLocale(position);
  }, [position]);

  if (!morceauActuel) {
    return null;
  }

  const formaterLeTemps = (secondes: number) => {
    const mins = Math.floor(secondes / 60);
    const secs = Math.floor(secondes % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const gererAleatoire = async () => {
    setModeAleatoireActif(await basculerModeAleatoire());
  };

  const gererRepetition = async () => {
    setModeRepetition(await basculerModeRepetition());
  };

  const gererPartage = async () => {
    await partagerLaMusique(
      morceauActuel.title || 'Musique',
      morceauActuel.artist || 'Artiste',
    );
  };

  const couleurRepetition =
    modeRepetition !== RepeatMode.Off ? COLORS.green : COLORS.white;
  const chansonActuelle = {
    id: morceauActuel.id || '',
    title: morceauActuel.title ?? '',
    artist: morceauActuel.artist ?? '',
    artwork: morceauActuel.artwork ?? '',
    url: morceauActuel.url ?? '',
  };

  const gererSuppressionAdmin = () => {
    if (!chansonActuelle.id) {
      return;
    }
    Alert.alert(
      'Supprimer du serveur 🚨',
      'Êtes-vous sûr de vouloir supprimer définitivement cette musique du catalogue ?',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const suppressionServeurReussie = await supprimerMusiqueDeFirestore(
              chansonActuelle.id,
            );
            Alert.alert(
              'Terminé',
              suppressionServeurReussie
                ? 'La musique a été supprimée du serveur.'
                : 'La musique a été retirée localement (hors-ligne / serveur indisponible).',
            );
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.conteneurGlobal}>
      <LinearGradient
        colors={['#242436', '#12121c', COLORS.black]}
        style={styles.degradeFond}
      />

      <SafeAreaView style={styles.zoneContenu}>
        <View style={styles.entete}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.boutonIcone}>
            <ChevronDown color={COLORS.white} size={30} />
          </TouchableOpacity>
          <View style={styles.sectionTitreEntete}>
            <Text style={styles.textePetitTitre}>LECTURE EN COURS</Text>
            <Text style={styles.textePlaylistTitre} numberOfLines={1}>
              {obtenirNomPlaylistCourante()}
              {secondesRestantes > 0 &&
                ` • ⏳ ${Math.ceil(secondesRestantes / 60)} min`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.boutonIcone}
            onPress={ouvrirMenuMinuteur}>
            <MoreHorizontal color={COLORS.white} size={28} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionImage}>
          <Animated.View
            style={[
              styles.conteneurOmbreImage,
              {transform: [{scale: animationArt}]},
            ]}>
            <Image
              source={{uri: morceauActuel.artwork}}
              style={styles.pochetteAlbum}
            />
          </Animated.View>
        </View>

        <View style={styles.sectionInfosMusique}>
          <View style={styles.blocTexte}>
            <Text style={styles.titrePrincipal} numberOfLines={1}>
              {morceauActuel.title}
            </Text>
            <Text style={styles.artistePrincipal} numberOfLines={1}>
              {morceauActuel.artist}
            </Text>
          </View>
          {estEnTrainDeJouer && <VisualiseurAudio />}
          <BoutonLike
            chanson={chansonActuelle}
            taille={28}
          />
        </View>

        {utilisateur?.email?.toLowerCase() === 'admin@ict.com' && (
          <View style={styles.actionsAdmin}>
            <TouchableOpacity
              style={styles.boutonAdmin}
              onPress={() => setModalEditionVisible(true)}>
              <Edit3 color={COLORS.green} size={18} />
              <Text style={styles.texteBoutonAdmin}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.boutonAdmin}
              onPress={gererSuppressionAdmin}>
              <Trash2 color="#FF6B6B" size={18} />
              <Text style={styles.texteBoutonAdmin}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.sectionProgression}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={positionLocale}
            onValueChange={setPositionLocale}
            onSlidingComplete={seekVersPosition}
            minimumTrackTintColor={COLORS.white}
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor={COLORS.white}
          />
          <View style={styles.tempsConteneur}>
            <Text style={styles.texteChrono}>
              {formaterLeTemps(positionLocale)}
            </Text>
            <Text style={styles.texteChrono}>{formaterLeTemps(duration)}</Text>
          </View>
        </View>

        <View style={styles.sectionControles}>
          <TouchableOpacity onPress={gererAleatoire}>
            <Shuffle
              color={modeAleatoireActif ? COLORS.green : COLORS.white}
              size={24}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={revenirALaMusiquePrecedente}>
            <SkipBack color={COLORS.white} size={36} fill={COLORS.white} />
          </TouchableOpacity>

          <Animated.View style={{transform: [{scale: animationTaillePlay}]}}>
            <TouchableOpacity
              style={styles.boutonCerclePlay}
              onPress={basculerLecturePause}>
              {estEnTrainDeJouer ? (
                <Pause color={COLORS.black} size={34} fill={COLORS.black} />
              ) : (
                <Play color={COLORS.black} size={34} fill={COLORS.black} />
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={passerALaMusiqueSuivante}>
            <SkipForward color={COLORS.white} size={36} fill={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity onPress={gererRepetition}>
            <Repeat color={couleurRepetition} size={24} />
          </TouchableOpacity>
        </View>

        {/* Bouton pour afficher/masquer les paroles */}
        <TouchableOpacity
          style={styles.boutonParoles}
          onPress={() => setAfficherParoles(!afficherParoles)}>
          <AlignLeft
            color={afficherParoles ? COLORS.green : COLORS.white}
            size={22}
          />
          <Text
            style={[
              styles.texteParolesBtn,
              afficherParoles && styles.texteParolesBtnActif,
            ]}>
            Paroles
          </Text>
        </TouchableOpacity>

        {/* Panneau dépliable des paroles avec fond vert dégradé */}
        {afficherParoles && (
          <View style={styles.panneauParoles}>
            <LinearGradient
              colors={['rgba(29, 185, 84, 0.35)', 'rgba(13, 92, 43, 0.15)']}
              style={styles.degradeParoles}>
              <ScrollView
                style={styles.scrollParoles}
                showsVerticalScrollIndicator={false}>
                <Text style={styles.texteParoles}>
                  {morceauActuel.description
                    ? morceauActuel.description
                    : 'Paroles non disponibles pour ce titre'}
                </Text>
              </ScrollView>
            </LinearGradient>
          </View>
        )}

        <View style={styles.basDePage}>
          <TouchableOpacity style={styles.boutonBas}>
            <Laptop2 color={COLORS.green} size={20} />
            <Text style={styles.texteDevice}>Écoute sur cet appareil</Text>
          </TouchableOpacity>
          <View style={styles.boutonsBasDroite}>
            <TouchableOpacity
              onPress={gererTelechargement}
              style={styles.boutonFileAttente}
              disabled={estEnCoursDeTelechargement}>
              {estEnCoursDeTelechargement ? (
                <ActivityIndicator size="small" color={COLORS.green} />
              ) : (
                <Download
                  color={estTelecharge ? COLORS.green : COLORS.white}
                  size={20}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Queue')}
              style={styles.boutonFileAttente}>
              <ListMusic color={COLORS.white} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={gererPartage}>
              <Share2 color={COLORS.white} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ModalModifierMusique
        visible={modalEditionVisible}
        chanson={chansonActuelle}
        onFermer={() => setModalEditionVisible(false)}
        onModifier={() => {
          // Le lecteur garde les métadonnées en mémoire jusqu'au prochain rechargement.
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  conteneurGlobal: {flex: 1, backgroundColor: COLORS.black},
  degradeFond: {...StyleSheet.absoluteFillObject},
  zoneContenu: {flex: 1, paddingHorizontal: SPACING.l},
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    height: 60,
  },
  boutonIcone: {padding: 5},
  sectionTitreEntete: {flex: 1, alignItems: 'center'},
  textePetitTitre: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  textePlaylistTitre: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sectionImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  conteneurOmbreImage: {
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 15,
    borderRadius: 8,
  },
  pochetteAlbum: {
    width: width - SPACING.l * 2,
    height: width - SPACING.l * 2,
    borderRadius: 8,
  },
  sectionInfosMusique: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  blocTexte: {flex: 1, marginRight: 15},
  titrePrincipal: {color: COLORS.white, fontSize: 24, fontWeight: 'bold'},
  artistePrincipal: {
    color: COLORS.lightGray,
    fontSize: 18,
    marginTop: 5,
    fontWeight: '500',
  },
  sectionProgression: {marginBottom: 20},
  slider: {width: '105%', height: 40, alignSelf: 'center'},
  tempsConteneur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -5,
  },
  texteChrono: {color: COLORS.lightGray, fontSize: 12, fontWeight: '500'},
  sectionControles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  boutonCerclePlay: {
    backgroundColor: COLORS.white,
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  basDePage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  boutonBas: {flexDirection: 'row', alignItems: 'center'},
  // -- Styles du panneau de paroles --
  boutonParoles: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.m,
  },
  texteParolesBtn: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: SPACING.s,
  },
  texteParolesBtnActif: {
    color: COLORS.green,
  },
  panneauParoles: {
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: 200,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  degradeParoles: {
    padding: SPACING.l,
    borderRadius: 16,
  },
  scrollParoles: {
    maxHeight: 160,
  },
  texteParoles: {
    color: COLORS.white,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '600',
  },
  texteDevice: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  boutonsBasDroite: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boutonFileAttente: {
    marginRight: SPACING.m,
  },
  actionsAdmin: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.m,
    marginBottom: SPACING.m,
  },
  boutonAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: SPACING.m,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  texteBoutonAdmin: {
    color: COLORS.white,
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 13,
  },
  conteneurVisualiseur: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: 28,
    height: 25,
    marginRight: 10,
    alignSelf: 'center',
  },
  barreVisualiseur: {
    width: 3.5,
    backgroundColor: COLORS.green,
    borderRadius: 2,
  },
});

export default EcranLecteurPleinEcran;
