/**
 * Composant Mini Lecteur avec transitions fluides.
 * Ce composant reste visible en bas de l'écran pendant la navigation.
 *
 * Améliorations visuelles :
 *  - Animation de glissement vers le haut à l'apparition (translateY)
 *  - Barre de progression fine en haut du lecteur
 *  - Fondu enchaîné (crossfade) sur la pochette quand le morceau change
 *  - Retour haptique visuel (scale spring) sur les boutons de contrôle
 */
import React, {useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import {Play, Pause, SkipForward} from 'lucide-react-native';
import {COLORS, SPACING} from '../theme/colors';
import {
  basculerLecturePause,
  passerALaMusiqueSuivante,
} from '../services/ServiceLecteurAudio';
import {
  usePlaybackState,
  State,
  useActiveTrack,
  useProgress,
} from 'react-native-track-player';
import {useNavigation} from '@react-navigation/native';

// ─── Sous-composant : Bouton animé avec effet de rebond (spring) ───
// On l'extrait pour éviter de créer un composant inline dans le render
const BoutonControleAnime = ({
  surAppui,
  children,
}: {
  surAppui: () => void;
  children: React.ReactNode;
}) => {
  const valeurEchelle = useRef(new Animated.Value(1)).current;

  const gererAppuiIn = () => {
    Animated.timing(valeurEchelle, {
      toValue: 0.8,
      duration: 50,
      useNativeDriver: true,
    }).start();
    // On déclenche l'action immédiatement au contact pour une réactivité maximale
    surAppui();
  };

  const gererAppuiOut = () => {
    Animated.spring(valeurEchelle, {
      toValue: 1.0,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={gererAppuiIn}
      onPressOut={gererAppuiOut}
      style={styles.boutonControle}
      activeOpacity={1}>
      <Animated.View style={{transform: [{scale: valeurEchelle}]}}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Composant principal ───
const MiniLecteurAudio = () => {
  const navigation = useNavigation<any>();
  const etatLecture = usePlaybackState();
  const morceauActuel = useActiveTrack();
  const progressionLecture = useProgress();

  // ── Refs pour les valeurs animées (évite les re-créations) ──

  // Animation de glissement vers le haut à l'apparition
  const translationVerticale = useRef(new Animated.Value(100)).current;

  // Opacité pour le fondu enchaîné de la pochette
  const opacitePochette = useRef(new Animated.Value(1)).current;

  // On stocke l'ID du dernier morceau affiché pour détecter les changements
  const dernierIdMorceau = useRef<string | null>(null);

  // ── Effet : animation de glissement à la première apparition ──
  useEffect(() => {
    if (morceauActuel) {
      // Premier morceau chargé → on fait glisser le mini lecteur vers le haut
      Animated.timing(translationVerticale, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [morceauActuel, translationVerticale]);

  // ── Effet : fondu enchaîné quand le morceau change ──
  useEffect(() => {
    if (!morceauActuel) {
      return;
    }

    const idActuel = morceauActuel.title ?? '';
    if (
      dernierIdMorceau.current !== null &&
      dernierIdMorceau.current !== idActuel
    ) {
      // Le morceau a changé → on lance le crossfade sur la pochette
      opacitePochette.setValue(0);
      Animated.timing(opacitePochette, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    // On met à jour la référence du dernier morceau affiché
    dernierIdMorceau.current = idActuel;
  }, [morceauActuel, opacitePochette]);

  // Si aucune musique n'est chargée, on n'affiche pas le mini lecteur
  if (!morceauActuel) {
    return null;
  }

  const estEnTrainDeJouer = etatLecture.state === State.Playing;

  // ── Calcul du pourcentage de progression pour la barre ──
  const pourcentageProgression =
    progressionLecture.duration > 0
      ? (progressionLecture.position / progressionLecture.duration) * 100
      : 0;

  return (
    <Animated.View
      style={[
        styles.conteneurMiniLecteur,
        {transform: [{translateY: translationVerticale}]},
      ]}>
      {/* Barre de progression fine en haut du lecteur */}
      <View style={styles.conteneurBarreProgression}>
        <View
          style={[
            styles.barreProgressionRemplie,
            {width: `${pourcentageProgression}%`},
          ]}
        />
      </View>

      {/* Informations sur le morceau (pochette + texte) */}
      <TouchableOpacity
        style={styles.sectionInfo}
        onPress={() => navigation.navigate('Player')}>
        <Animated.Image
          source={{uri: morceauActuel.artwork}}
          style={[styles.imageMiniature, {opacity: opacitePochette}]}
        />
        <View style={styles.sectionTexte}>
          <Text style={styles.texteTitre} numberOfLines={1}>
            {morceauActuel.title}
          </Text>
          <Text style={styles.texteArtiste} numberOfLines={1}>
            {morceauActuel.artist}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Boutons de contrôle avec retour visuel animé */}
      <View style={styles.sectionControles}>
        <BoutonControleAnime surAppui={basculerLecturePause}>
          {estEnTrainDeJouer ? (
            <Pause color={COLORS.white} size={28} />
          ) : (
            <Play color={COLORS.white} size={28} fill={COLORS.white} />
          )}
        </BoutonControleAnime>
        <BoutonControleAnime surAppui={passerALaMusiqueSuivante}>
          <SkipForward color={COLORS.white} size={28} fill={COLORS.white} />
        </BoutonControleAnime>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  conteneurMiniLecteur: {
    position: 'absolute',
    bottom: 65, // Remonté pour éviter d'être caché
    left: 12,
    right: 12,
    backgroundColor: 'rgba(35, 35, 35, 0.9)', // Plus opaque pour la visibilité
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Bordure effet verre givré
    height: 62,
    borderRadius: 14, // Bords arrondis lisses
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.s,
    // Ombre premium pour l'effet de flottement 3D
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden', // Pour que la barre de progression respecte le borderRadius
  },
  conteneurBarreProgression: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  barreProgressionRemplie: {
    height: 2,
    backgroundColor: COLORS.green,
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
