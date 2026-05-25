/**
 * Composant Mini Lecteur.
 * Il reste visible en bas de l'écran pendant que l'utilisateur navigue.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { basculerLecturePause, passerALaMusiqueSuivante } from '../services/ServiceLecteurAudio';
import { usePlaybackState, State, useActiveTrack } from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';

const MiniLecteurAudio = () => {
  const navigation = useNavigation<any>();
  const etatLecture = usePlaybackState();
  const morceauActuel = useActiveTrack();

  // Si aucune musique n'est chargée, on n'affiche pas le mini lecteur
  if (!morceauActuel) return null;

  const estEnTrainDeJouer = etatLecture.state === State.Playing;

  return (
    <View style={styles.conteneurMiniLecteur}>
      {/* Informations sur le morceau */}
      <TouchableOpacity 
        style={styles.sectionInfo} 
        onPress={() => navigation.navigate('Player')}
      >

        <Image source={{ uri: morceauActuel.artwork }} style={styles.imageMiniature} />
        <View style={styles.sectionTexte}>
          <Text style={styles.texteTitre} numberOfLines={1}>{morceauActuel.title}</Text>
          <Text style={styles.texteArtiste} numberOfLines={1}>{morceauActuel.artist}</Text>
        </View>
      </TouchableOpacity>

      {/* Boutons de contrôle */}
      <View style={styles.sectionControles}>
        <TouchableOpacity onPress={basculerLecturePause} style={styles.boutonControle}>
          {estEnTrainDeJouer ? (
            <Pause color={COLORS.white} size={28} />
          ) : (
            <Play color={COLORS.white} size={28} fill={COLORS.white} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={passerALaMusiqueSuivante} style={styles.boutonControle}>
          <SkipForward color={COLORS.white} size={28} fill={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneurMiniLecteur: {
    position: 'absolute',
    bottom: 50, // Juste au-dessus de la barre d'onglets
    left: 10,
    right: 10,
    backgroundColor: '#3E3E3E',
    height: 60,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.s,
    elevation: 5,
  },
  sectionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageMiniature: {
    width: 45,
    height: 45,
    borderRadius: 4,
  },
  sectionTexte: {
    marginLeft: SPACING.s,
    flex: 1,
  },
  texteTitre: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  texteArtiste: {
    color: COLORS.lightGray,
    fontSize: 12,
  },
  sectionControles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boutonControle: {
    padding: SPACING.s,
  },
});

export default MiniLecteurAudio;
