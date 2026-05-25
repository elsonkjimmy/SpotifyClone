/**
 * Écran du lecteur audio en plein écran.
 * Affiche la grande pochette, la barre de progression et tous les contrôles.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
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
  Heart
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { COLORS, SPACING } from '../theme/colors';
import { 
  basculerLecturePause, 
  passerALaMusiqueSuivante, 
  revenirALaMusiquePrecedente 
} from '../services/ServiceLecteurAudio';
import { usePlaybackState, State, useActiveTrack, useProgress } from 'react-native-track-player';

const EcranLecteurPleinEcran = ({ navigation }: any) => {
  const etatLecture = usePlaybackState();
  const morceauActuel = useActiveTrack();
  const { position, duration } = useProgress(); // Récupère la position actuelle et la durée totale

  if (!morceauActuel) return null;

  const estEnTrainDeJouer = etatLecture.state === State.Playing;

  // Fonction pour formater le temps (secondes -> mm:ss)
  const formaterLeTemps = (secondes: number) => {
    const mins = Math.floor(secondes / 60);
    const secs = Math.floor(secondes % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      {/* En-tête : Bouton retour et titre de la playlist */}
      <View style={styles.entete}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronDown color={COLORS.white} size={30} />
        </TouchableOpacity>
        <Text style={styles.textePlaylist}>LECTURE EN COURS</Text>
        <TouchableOpacity>
          <MoreHorizontal color={COLORS.white} size={30} />
        </TouchableOpacity>
      </View>

      {/* Image de couverture (Grande) */}
      <View style={styles.sectionImage}>
        <Image source={{ uri: morceauActuel.artwork }} style={styles.grandeImage} />
      </View>

      {/* Titre et Artiste */}
      <View style={styles.sectionInfo}>
        <View>
          <Text style={styles.titreMusique}>{morceauActuel.title}</Text>
          <Text style={styles.artisteMusique}>{morceauActuel.artist}</Text>
        </View>
        <TouchableOpacity>
          <Heart color={COLORS.green} size={28} fill={COLORS.green} />
        </TouchableOpacity>
      </View>

      {/* Barre de progression */}
      <View style={styles.sectionProgression}>
        <Slider
          style={styles.barreSlider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          minimumTrackTintColor={COLORS.white}
          maximumTrackTintColor={COLORS.lightGray}
          thumbTintColor={COLORS.white}
        />
        <View style={styles.tempsConteneur}>
          <Text style={styles.texteTemps}>{formaterLeTemps(position)}</Text>
          <Text style={styles.texteTemps}>{formaterLeTemps(duration)}</Text>
        </View>
      </View>

      {/* Contrôles de lecture principaux */}
      <View style={styles.sectionControles}>
        <TouchableOpacity>
          <Shuffle color={COLORS.green} size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={revenirALaMusiquePrecedente}>
          <SkipBack color={COLORS.white} size={35} fill={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.boutonPlayPause} onPress={basculerLecturePause}>
          {estEnTrainDeJouer ? (
            <Pause color={COLORS.black} size={35} fill={COLORS.black} />
          ) : (
            <Play color={COLORS.black} size={35} fill={COLORS.black} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={passerALaMusiqueSuivante}>
          <SkipForward color={COLORS.white} size={35} fill={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Repeat color={COLORS.green} size={24} />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {
    flex: 1,
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.l,
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    marginTop: SPACING.m,
  },
  textePlaylist: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionImage: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  grandeImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  sectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  titreMusique: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  artisteMusique: {
    color: COLORS.lightGray,
    fontSize: 18,
    marginTop: 4,
  },
  sectionProgression: {
    marginBottom: SPACING.l,
  },
  barreSlider: {
    width: '100%',
    height: 40,
  },
  tempsConteneur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  texteTemps: {
    color: COLORS.lightGray,
    fontSize: 12,
  },
  sectionControles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.m,
  },
  boutonPlayPause: {
    backgroundColor: COLORS.white,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EcranLecteurPleinEcran;
