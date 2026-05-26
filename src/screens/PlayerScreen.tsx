/**
 * Écran du lecteur audio en plein écran.
 * Affiche la grande pochette, la barre de progression, tous les contrôles, et le menu file d'attente.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ImageStyle,
  Modal,
  FlatList,
  Alert,
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
  ListMusic,
  X,
  Volume2
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING } from '../theme/colors';
import { 
  basculerLecturePause, 
  passerALaMusiqueSuivante, 
  revenirALaMusiquePrecedente 
} from '../services/ServiceLecteurAudio';
import TrackPlayer, { usePlaybackState, State, useActiveTrack, useProgress } from 'react-native-track-player';

const EcranLecteurPleinEcran = ({ navigation }: any) => {
  const etatLecture = usePlaybackState();
  const morceauActuel = useActiveTrack();
  const { position, duration } = useProgress();

  const [estFavori, setEstFavori] = useState(false);
  const [afficherFileDAttente, setAfficherFileDAttente] = useState(false);
  const [fileDAttente, setFileDAttente] = useState<any[]>([]);

  // Charge la file d'attente (queue) depuis TrackPlayer
  useEffect(() => {
    const chargerFileDAttente = async () => {
      try {
        const queue = await TrackPlayer.getQueue();
        setFileDAttente(queue);
      } catch (erreur) {
        console.error('Erreur chargement file d\'attente:', erreur);
      }
    };
    if (afficherFileDAttente) {
      chargerFileDAttente();
    }
  }, [afficherFileDAttente, morceauActuel]);

  if (!morceauActuel) return null;

  const estEnTrainDeJouer = etatLecture.state === State.Playing;

  // Formater le temps (secondes -> mm:ss)
  const formaterLeTemps = (secondes: number) => {
    const mins = Math.floor(secondes / 60);
    const secs = Math.floor(secondes % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Afficher les options supplémentaires (bouton trois points)
  const afficherOptionsMusique = () => {
    Alert.alert(
      morceauActuel.title || 'Options',
      `Artiste : ${morceauActuel.artist || 'Inconnu'}`,
      [
        { text: 'Ajouter aux favoris', onPress: () => setEstFavori(true) },
        { text: 'Partager cette musique', onPress: () => {} },
        { text: 'Fermer', style: 'cancel' }
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#1c352d', '#121212', '#050505']}
      style={styles.conteneurGradient}
    >
      <SafeAreaView style={styles.conteneurPrincipal}>
        {/* En-tête : Bouton retour et titre de la playlist */}
        <View style={styles.entete}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronDown color={COLORS.white} size={30} />
          </TouchableOpacity>
          <Text style={styles.textePlaylist}>LECTURE EN COURS</Text>
          <TouchableOpacity onPress={afficherOptionsMusique}>
            <MoreHorizontal color={COLORS.white} size={30} />
          </TouchableOpacity>
        </View>

        {/* Image de couverture (Grande) */}
        <View style={styles.sectionImage}>
          <Image source={{ uri: morceauActuel.artwork }} style={styles.grandeImage as ImageStyle} />
        </View>

        {/* Titre et Artiste */}
        <View style={styles.sectionInfo}>
          <View style={styles.detailsMusique}>
            <Text style={styles.titreMusique} numberOfLines={1}>
              {morceauActuel.title}
            </Text>
            <Text style={styles.artisteMusique} numberOfLines={1}>
              {morceauActuel.artist}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setEstFavori(!estFavori)}>
            <Heart 
              color={estFavori ? COLORS.green : COLORS.white} 
              size={28} 
              fill={estFavori ? COLORS.green : 'transparent'} 
            />
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
            maximumTrackTintColor="#5e5e5e"
            thumbTintColor={COLORS.white}
            onSlidingComplete={async (valeur) => {
              await TrackPlayer.seekTo(valeur);
            }}
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

        {/* Barre du bas : Périphériques et File d'attente (les 3 traits) */}
        <View style={styles.barreBasDePage}>
          <View style={styles.zoneAppareil}>
            <Volume2 color={COLORS.green} size={20} />
            <Text style={styles.texteAppareil}>Émulateur Android</Text>
          </View>
          <TouchableOpacity 
            style={styles.boutonQueue} 
            onPress={() => setAfficherFileDAttente(true)}
          >
            <ListMusic color={COLORS.white} size={26} />
          </TouchableOpacity>
        </View>

        {/* Modal File d'attente (Queue) */}
        <Modal
          visible={afficherFileDAttente}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAfficherFileDAttente(false)}
        >
          <View style={styles.conteneurModal}>
            <View style={styles.contenuModal}>
              <View style={styles.enTeteModal}>
                <Text style={styles.titreModal}>File d'attente</Text>
                <TouchableOpacity onPress={() => setAfficherFileDAttente(false)}>
                  <X color={COLORS.white} size={26} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={fileDAttente}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  const estMusiqueActive = item.id === morceauActuel.id;
                  return (
                    <TouchableOpacity 
                      style={[styles.ligneMusiqueQueue, estMusiqueActive && styles.ligneMusiqueActive]}
                      onPress={async () => {
                        await TrackPlayer.skip(index);
                        await TrackPlayer.play();
                        setAfficherFileDAttente(false);
                      }}
                    >
                      <Image source={{ uri: item.artwork }} style={styles.imageMiniatureQueue} />
                      <View style={styles.infosQueue}>
                        <Text 
                          style={[styles.titreQueue, estMusiqueActive && { color: COLORS.green }]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.artisteQueue} numberOfLines={1}>
                          {item.artist}
                        </Text>
                      </View>
                      {estMusiqueActive && (
                        <Text style={styles.badgeEnCours}>LECTURE</Text>
                      )}
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.listeQueue}
              />
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  conteneurGradient: {
    flex: 1,
  },
  conteneurPrincipal: {
    flex: 1,
    paddingHorizontal: SPACING.l,
    justifyContent: 'space-between',
    paddingBottom: SPACING.l,
  },
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.m,
  },
  textePlaylist: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  sectionImage: {
    alignItems: 'center',
    marginVertical: SPACING.l,
  },
  grandeImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: COLORS.cardBackground,
  },
  sectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  detailsMusique: {
    flex: 1,
    marginRight: SPACING.m,
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
    marginBottom: SPACING.m,
  },
  barreSlider: {
    width: '100%',
    height: 40,
  },
  tempsConteneur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  texteTemps: {
    color: COLORS.lightGray,
    fontSize: 12,
  },
  sectionControles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  boutonPlayPause: {
    backgroundColor: COLORS.white,
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barreBasDePage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.s,
    borderTopWidth: 0.5,
    borderTopColor: '#2b2b2b',
  },
  zoneAppareil: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  texteAppareil: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: SPACING.s,
  },
  boutonQueue: {
    padding: SPACING.s,
  },
  // Modal de file d'attente
  conteneurModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  contenuModal: {
    backgroundColor: '#181818',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
    padding: SPACING.l,
  },
  enTeteModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2b2b2b',
    paddingBottom: SPACING.m,
  },
  titreModal: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  listeQueue: {
    paddingBottom: SPACING.xl,
  },
  ligneMusiqueQueue: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.m,
    borderRadius: 8,
    paddingHorizontal: SPACING.s,
    marginBottom: SPACING.s,
  },
  ligneMusiqueActive: {
    backgroundColor: '#282828',
  },
  imageMiniatureQueue: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: COLORS.cardBackground,
  },
  infosQueue: {
    flex: 1,
    marginLeft: SPACING.m,
  },
  titreQueue: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  artisteQueue: {
    color: COLORS.lightGray,
    fontSize: 13,
    marginTop: 2,
  },
  badgeEnCours: {
    color: COLORS.black,
    backgroundColor: COLORS.green,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
});

export default EcranLecteurPleinEcran;
