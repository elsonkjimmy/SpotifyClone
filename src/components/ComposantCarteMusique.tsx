/**
 * Composant visuel représentant une carte de musique ou d'album.
 * Affiche l'image de couverture, le titre et l'artiste.
 */
import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {COLORS, SPACING} from '../theme/colors';

interface ProprietesDeLaCarte {
  titre: string;
  artiste: string;
  urlImage: string;
  actionAuClic: () => void;
  estLike?: boolean;
  onLike?: () => void;
}

const ComposantCarteMusique = ({
  titre,
  artiste,
  urlImage,
  actionAuClic,
  estLike = false,
  onLike,
}: ProprietesDeLaCarte) => {
  return (
    <TouchableOpacity style={styles.conteneurDeLaCarte} onPress={actionAuClic}>
      {/* Image + bouton like */}
      <View style={styles.zoneImage}>
        <Image source={{uri: urlImage}} style={styles.imageDeCouverture} />

        {/* ❤️ bouton like */}
        <TouchableOpacity
          style={styles.boutonLike}
          onPress={e => {
            e.stopPropagation(); // évite de lancer la musique
            onLike?.();
          }}>
          <Text style={{fontSize: 18}}>{estLike ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.texteTitre} numberOfLines={1}>
        {titre}
      </Text>
      <Text style={styles.texteArtiste} numberOfLines={1}>
        {artiste}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  conteneurDeLaCarte: {
    width: 150,
    marginRight: SPACING.m,
    marginBottom: SPACING.m,
  },

  zoneImage: {
    position: 'relative',
  },

  imageDeCouverture: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: COLORS.cardBackground,
  },

  boutonLike: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 20,
  },

  texteTitre: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: SPACING.s,
  },

  texteArtiste: {
    color: COLORS.lightGray,
    fontSize: 14,
    marginTop: 2,
  },
});

export default ComposantCarteMusique;
