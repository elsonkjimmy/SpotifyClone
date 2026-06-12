/**
 * Écran de la file d'attente (Queue).
 * Affiche le morceau en cours de lecture et les morceaux à venir
 * dans la file d'attente du lecteur audio.
 */
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {X, Play} from 'lucide-react-native';
import TrackPlayer, {Track} from 'react-native-track-player';
import {useFocusEffect} from '@react-navigation/native';
import {COLORS, SPACING} from '../theme/colors';

/**
 * Composant principal de l'écran File d'attente.
 * Récupère la queue du lecteur audio et l'index du morceau actif
 * à chaque fois que l'écran reçoit le focus.
 */
const EcranFileAttente = ({navigation}: any) => {
  // Liste complète des morceaux dans la file d'attente
  const [fileAttente, setFileAttente] = useState<Track[]>([]);
  // Index du morceau actuellement en lecture
  const [indexMorceauActif, setIndexMorceauActif] = useState<number>(0);

  // Rafraîchir la file d'attente à chaque focus de l'écran
  useFocusEffect(
    useCallback(() => {
      const chargerFileAttente = async () => {
        try {
          const queue = await TrackPlayer.getQueue();
          const indexActif = await TrackPlayer.getActiveTrackIndex();
          setFileAttente(queue);
          setIndexMorceauActif(indexActif ?? 0);
        } catch (erreur) {
          console.log(
            "Erreur lors du chargement de la file d'attente:",
            erreur,
          );
        }
      };
      chargerFileAttente();
    }, []),
  );

  // Morceau actuellement en cours de lecture
  const morceauEnCours = fileAttente[indexMorceauActif];

  // Morceaux qui viennent après le morceau actuel
  const morceauxASuivre = fileAttente.slice(indexMorceauActif + 1);

  // Fonction de rendu pour un élément de la file d'attente
  const rendreElementFileAttente = ({
    item,
    index,
  }: {
    item: Track;
    index: number;
  }) => {
    return (
      <View style={styles.ligneMorceau}>
        <View style={styles.infosTexte}>
          <Text style={styles.titreMorceau} numberOfLines={1}>
            {item.title ?? 'Titre inconnu'}
          </Text>
          <Text style={styles.artisteMorceau} numberOfLines={1}>
            {item.artist ?? 'Artiste inconnu'}
          </Text>
        </View>
        <Text style={styles.indexMorceau}>{index + 1}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      {/* En-tête avec titre et bouton fermer */}
      <View style={styles.entete}>
        <View style={styles.espaceVide} />
        <Text style={styles.titreEntete}>File d'attente</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.boutonFermer}>
          <X color={COLORS.white} size={24} />
        </TouchableOpacity>
      </View>

      {/* Section : Morceau en cours de lecture */}
      {morceauEnCours && (
        <View style={styles.sectionEnCours}>
          <Text style={styles.titreSection}>En cours de lecture</Text>
          <View style={styles.ligneMorceauActif}>
            <Play color={COLORS.green} size={18} fill={COLORS.green} />
            <View style={styles.infosTexteActif}>
              <Text style={styles.titreMorceauActif} numberOfLines={1}>
                {morceauEnCours.title ?? 'Titre inconnu'}
              </Text>
              <Text style={styles.artisteMorceauActif} numberOfLines={1}>
                {morceauEnCours.artist ?? 'Artiste inconnu'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Section : Morceaux à suivre */}
      <View style={styles.sectionASuivre}>
        <Text style={styles.titreSection}>À suivre</Text>
        {morceauxASuivre.length > 0 ? (
          <FlatList
            data={morceauxASuivre}
            keyExtractor={(item, index) => `queue-${item.id ?? index}-${index}`}
            renderItem={rendreElementFileAttente}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listeContenu}
          />
        ) : (
          <Text style={styles.texteVide}>
            Aucun morceau dans la file d'attente
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  espaceVide: {
    width: 24,
  },
  titreEntete: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  boutonFermer: {
    padding: SPACING.xs,
  },
  sectionEnCours: {
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.l,
    paddingBottom: SPACING.m,
  },
  titreSection: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: SPACING.m,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ligneMorceauActif: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.s,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
  },
  infosTexteActif: {
    flex: 1,
    marginLeft: SPACING.m,
  },
  titreMorceauActif: {
    color: COLORS.green,
    fontSize: 16,
    fontWeight: '600',
  },
  artisteMorceauActif: {
    color: COLORS.green,
    fontSize: 13,
    marginTop: 2,
    opacity: 0.8,
  },
  sectionASuivre: {
    flex: 1,
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.l,
  },
  ligneMorceau: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  infosTexte: {
    flex: 1,
    marginRight: SPACING.m,
  },
  titreMorceau: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '500',
  },
  artisteMorceau: {
    color: COLORS.lightGray,
    fontSize: 13,
    marginTop: 2,
  },
  indexMorceau: {
    color: COLORS.lightGray,
    fontSize: 12,
  },
  listeContenu: {
    paddingBottom: SPACING.xl,
  },
  texteVide: {
    color: COLORS.lightGray,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

export default EcranFileAttente;
