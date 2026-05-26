/**
 * Écran du lecteur audio en plein écran.
 * Design Premium fidèle à Spotify avec dégradés et contrôles complets.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
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
  Laptop2
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING } from '../theme/colors';
import { 
  basculerLecturePause, 
  passerALaMusiqueSuivante, 
  revenirALaMusiquePrecedente,
  basculerModeAleatoire,
  basculerModeRepetition,
  obtenirEtatModeAleatoire,
  obtenirEtatModeRepetition,
  partagerLaMusique
} from '../services/ServiceLecteurAudio';
import { usePlaybackState, State, useActiveTrack, useProgress } from 'react-native-track-player';

const { width } = Dimensions.get('window');

const EcranLecteurPleinEcran = ({ navigation }: any) => {
  const etatLecture = usePlaybackState();
  const morceauActuel = useActiveTrack();
  const { position, duration } = useProgress();

  const [modeAleatoireActif, setModeAleatoireActif] = React.useState(false);
  const [modeRepetitionActif, setModeRepetitionActif] = React.useState(false);

  if (!morceauActuel) return null;

  const estEnTrainDeJouer = etatLecture.state === State.Playing;

  const formaterLeTemps = (secondes: number) => {
    const mins = Math.floor(secondes / 60);
    const secs = Math.floor(secondes % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const gererAleatoire = () => {
    setModeAleatoireActif(basculerModeAleatoire());
  };

  const gererRepetition = () => {
    setModeRepetitionActif(basculerModeRepetition());
  };

  const gererPartage = async () => {
    await partagerLaMusique(morceauActuel.title || 'Musique', morceauActuel.artist || 'Artiste');
  };

  return (
    <View style={styles.conteneurGlobal}>
      {/* Fond dégradé immersif */}
      <LinearGradient 
        colors={['#555555', COLORS.black]} 
        style={styles.degradeFond} 
      />

      <SafeAreaView style={styles.zoneContenu}>
        {/* En-tête : Réduire et Options */}
        <View style={styles.entete}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonIcone}>
            <ChevronDown color={COLORS.white} size={30} />
          </TouchableOpacity>
          <View style={styles.sectionTitreEntete}>
            <Text style={styles.textePetitTitre}>LECTURE EN COURS</Text>
            <Text style={styles.textePlaylistTitre} numberOfLines={1}>Favoris</Text>
          </View>
          <TouchableOpacity style={styles.boutonIcone}>
            <MoreHorizontal color={COLORS.white} size={28} />
          </TouchableOpacity>
        </View>

        {/* Image de couverture */}
        <View style={styles.sectionImage}>
          <View style={styles.conteneurOmbreImage}>
            <Image source={{ uri: morceauActuel.artwork }} style={styles.pochetteAlbum} />
          </View>
        </View>

        {/* Infos Musique et Like */}
        <View style={styles.sectionInfosMusique}>
          <View style={styles.blocTexte}>
            <Text style={styles.titrePrincipal} numberOfLines={1}>{morceauActuel.title}</Text>
            <Text style={styles.artistePrincipal} numberOfLines={1}>{morceauActuel.artist}</Text>
          </View>
          <TouchableOpacity>
            <Heart color={COLORS.green} size={28} fill={COLORS.green} />
          </TouchableOpacity>
        </View>

        {/* Barre de progression */}
        <View style={styles.sectionProgression}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor={COLORS.white}
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor={COLORS.white}
          />
          <View style={styles.tempsConteneur}>
            <Text style={styles.texteChrono}>{formaterLeTemps(position)}</Text>
            <Text style={styles.texteChrono}>{formaterLeTemps(duration)}</Text>
          </View>
        </View>

        {/* Contrôles Principaux */}
        <View style={styles.sectionControles}>
          <TouchableOpacity onPress={gererAleatoire}>
            <Shuffle color={modeAleatoireActif ? COLORS.green : COLORS.white} size={24} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={revenirALaMusiquePrecedente}>
            <SkipBack color={COLORS.white} size={36} fill={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.boutonCerclePlay} onPress={basculerLecturePause}>
            {estEnTrainDeJouer ? (
              <Pause color={COLORS.black} size={34} fill={COLORS.black} />
            ) : (
              <Play color={COLORS.black} size={34} fill={COLORS.black} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={passerALaMusiqueSuivante}>
            <SkipForward color={COLORS.white} size={36} fill={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity onPress={gererRepetition}>
            <Repeat color={modeRepetitionActif ? COLORS.green : COLORS.white} size={24} />
          </TouchableOpacity>
        </View>

        {/* Pied de page : Périphériques et Partage */}
        <View style={styles.basDePage}>
          <TouchableOpacity style={styles.boutonBas}>
            <Laptop2 color={COLORS.green} size={20} />
            <Text style={styles.texteDevice}>Écoute sur cet appareil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={gererPartage}>
            <Share2 color={COLORS.white} size={20} />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneurGlobal: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  degradeFond: {
    ...StyleSheet.absoluteFillObject,
  },
  zoneContenu: {
    flex: 1,
    paddingHorizontal: SPACING.l,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    height: 60,
  },
  boutonIcone: {
    padding: 5,
  },
  sectionTitreEntete: {
    flex: 1,
    alignItems: 'center',
  },
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    borderRadius: 8,
  },
  pochetteAlbum: {
    width: width - (SPACING.l * 2),
    height: width - (SPACING.l * 2),
    borderRadius: 8,
  },
  sectionInfosMusique: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  blocTexte: {
    flex: 1,
    marginRight: 15,
  },
  titrePrincipal: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  artistePrincipal: {
    color: COLORS.lightGray,
    fontSize: 18,
    marginTop: 5,
    fontWeight: '500',
  },
  sectionProgression: {
    marginBottom: 20,
  },
  slider: {
    width: '105%',
    height: 40,
    alignSelf: 'center',
  },
  tempsConteneur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -5,
  },
  texteChrono: {
    color: COLORS.lightGray,
    fontSize: 12,
    fontWeight: '500',
  },
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
  boutonBas: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  texteDevice: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default EcranLecteurPleinEcran;
