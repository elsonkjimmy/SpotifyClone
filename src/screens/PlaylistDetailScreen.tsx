/**
 * Écran Détail de Playlist.
 * Affiche la liste des morceaux d'une playlist depuis Firestore.
 * Style : Glassmorphism premium avec fond en dégradé indigo profond.
 */
import React, {useCallback, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {
  ChevronLeft,
  Play,
  MoreVertical,
  Trash2,
  Edit3,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SPACING} from '../theme/colors';
import {chargerEtJouerUneListeDeMusiques} from '../services/ServiceLecteurAudio';
import {
  recupererChansonsParIds,
  recupererFavorisUtilisateur,
  supprimerMusiqueDeFirestore,
} from '../services/firestore';
import type {Chanson, Playlist} from '../types';
import {useAuth} from '../context/AuthContext';
import BoutonLike from '../components/BoutonLike';
import ModalAjouterAPlaylist from '../components/ModalAjouterAPlaylist';
import ModalModifierMusique from '../components/ModalModifierMusique';

// ─── Sous-composant : Ligne Musique Animée avec Effet de Rebond ───
const LigneMusiqueAnimee = ({
  item,
  index,
  musiques,
  playlistNom,
  estAdmin,
  surEditer,
  surSupprimer,
  surAjouterAPlaylist,
}: {
  item: Chanson;
  index: number;
  musiques: Chanson[];
  playlistNom: string;
  estAdmin: boolean;
  surEditer: () => void;
  surSupprimer: () => void;
  surAjouterAPlaylist: () => void;
}) => {
  const valeurEchelle = useRef(new Animated.Value(1)).current;

  const gererAppui = useCallback(() => {
    Animated.sequence([
      Animated.timing(valeurEchelle, {
        toValue: 0.96,
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
    chargerEtJouerUneListeDeMusiques(musiques, index, playlistNom);
  }, [musiques, index, playlistNom, valeurEchelle]);

  return (
    <Animated.View
      style={[
        styles.conteneurLigneMusiqueAnim,
        {transform: [{scale: valeurEchelle}]},
      ]}>
      <TouchableOpacity
        style={styles.ligneMusique}
        onPress={gererAppui}
        activeOpacity={0.85}>
        <View style={styles.blocTexte}>
          <Text style={styles.titreMusique}>{item.title}</Text>
          <Text style={styles.artisteMusique}>{item.artist}</Text>
        </View>
        <View style={styles.iconesActions}>
          <BoutonLike chanson={item} taille={20} />
          {estAdmin && (
            <>
              <TouchableOpacity
                onPress={surEditer}
                style={styles.boutonActionLigne}>
                <Edit3 color={COLORS.green} size={18} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={surSupprimer}
                style={styles.boutonActionLigne}>
                <Trash2 color="#FF4444" size={18} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={surAjouterAPlaylist} style={styles.boutonActionLigne}>
            <MoreVertical color={COLORS.lightGray} size={20} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EcranDetailPlaylist = ({route, navigation}: any) => {
  const {playlist}: {playlist: Playlist} = route.params;
  const {utilisateur, estAdmin} = useAuth();
  const [musiques, setMusiques] = useState<Chanson[]>([]);
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(true);
  /** Chanson sélectionnée pour le modal d'ajout à une playlist */
  const [chansonSelectionnee, setChansonSelectionnee] =
    useState<Chanson | null>(null);
  const [modalPlaylistVisible, setModalPlaylistVisible] = useState(false);
  const [chansonAEditer, setChansonAEditer] = useState<Chanson | null>(null);
  const [modalEditionVisible, setModalEditionVisible] = useState(false);

  const calculerDureeTotale = () => {
    // On simule une durée moyenne de 3min30 par titre pour l'affichage
    const totalMinutes = musiques.length * 3.5;
    const heures = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    if (heures > 0) return `${heures} h ${minutes} min`;
    return `${minutes} min`;
  };

  const gererSuppressionMusique = (chansonId: string) => {
    Alert.alert(
      'Supprimer du serveur 🚨',
      'Êtes-vous sûr de vouloir supprimer définitivement cette musique du catalogue ?',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await supprimerMusiqueDeFirestore(chansonId);
            chargerMusiques();
          },
        },
      ],
    );
  };

  const chargerMusiques = useCallback(async () => {
    setEstEnTrainDeCharger(true);
    try {
      let idsAVol = playlist.songIds ?? [];
      if (playlist.estSpeciale && utilisateur) {
        idsAVol = await recupererFavorisUtilisateur(utilisateur.uid);
      }
      const chansons = await recupererChansonsParIds(idsAVol);
      setMusiques(chansons);
    } catch (erreur) {
      console.log('Erreur détail playlist:', erreur);
    } finally {
      setEstEnTrainDeCharger(false);
    }
  }, [playlist.songIds, playlist.estSpeciale, utilisateur]);

  useFocusEffect(
    useCallback(() => {
      chargerMusiques();
    }, [chargerMusiques]),
  );

  const renderLigneMusique = ({
    item,
    index,
  }: {
    item: Chanson;
    index: number;
  }) => (
    <LigneMusiqueAnimee
      item={item}
      index={index}
      musiques={musiques}
      playlistNom={playlist.nom}
      estAdmin={estAdmin}
      surEditer={() => {
        setChansonAEditer(item);
        setModalEditionVisible(true);
      }}
      surSupprimer={() => gererSuppressionMusique(item.id)}
      surAjouterAPlaylist={() => {
        setChansonSelectionnee(item);
        setModalPlaylistVisible(true);
      }}
    />
  );

  return (
    <View style={styles.conteneur}>
      <LinearGradient
        colors={['rgba(40, 20, 95, 0.95)', '#140c26', COLORS.black]}
        style={styles.degrade}
      />

      <SafeAreaView style={styles.zoneSafe}>
        <TouchableOpacity
          style={styles.boutonRetour}
          onPress={() => navigation.goBack()}>
          <ChevronLeft color={COLORS.white} size={30} />
        </TouchableOpacity>

        <View style={styles.entete}>
          {playlist.estSpeciale ? (
            <View style={styles.imageSpeciale}>
              <Text style={styles.emojiLike}>♥</Text>
            </View>
          ) : (
            <Image
              source={{uri: playlist.image || 'https://picsum.photos/300'}}
              style={styles.imageGrande}
            />
          )}
          <Text style={styles.titrePlaylist}>{playlist.nom}</Text>
          <View style={styles.ligneInfosCreateur}>
            <Text style={styles.createur}>{playlist.createur}</Text>
          </View>
          <Text style={styles.metadata}>
            {musiques.length} titres • {calculerDureeTotale()}
          </Text>
          <Text style={styles.abonnés}>
            {Math.floor(Math.random() * 1000) + 1} abonnés
          </Text>

          <TouchableOpacity
            style={[
              styles.boutonPlay,
              musiques.length === 0 && styles.boutonPlayDesactive,
            ]}
            disabled={musiques.length === 0}
            onPress={() =>
              chargerEtJouerUneListeDeMusiques(musiques, 0, playlist.nom)
            }>
            <Play color={COLORS.black} size={30} fill={COLORS.black} />
          </TouchableOpacity>
        </View>

        {estEnTrainDeCharger ? (
          <ActivityIndicator color={COLORS.green} style={styles.chargement} />
        ) : (
          <FlatList
            data={musiques}
            keyExtractor={item => item.id}
            renderItem={renderLigneMusique}
            contentContainerStyle={styles.liste}
            ListEmptyComponent={
              <View style={styles.conteneurVide}>
                <Text style={styles.texteVide}>Cette playlist est vide.</Text>
                <TouchableOpacity
                  style={styles.boutonAjouterVide}
                  onPress={() => navigation.navigate('Search')}>
                  <Text style={styles.texteBoutonAjouterVide}>
                    TROUVER DES TITRES
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* Modal d'ajout à une playlist */}
      {chansonSelectionnee && (
        <ModalAjouterAPlaylist
          visible={modalPlaylistVisible}
          chanson={chansonSelectionnee}
          onFermer={() => {
            setModalPlaylistVisible(false);
            setChansonSelectionnee(null);
          }}
          onCreerPlaylist={() => navigation.navigate('CreatePlaylist')}
        />
      )}

      {/* Modal d'édition des infos (Admin uniquement) */}
      <ModalModifierMusique
        visible={modalEditionVisible}
        chanson={chansonAEditer}
        onFermer={() => {
          setModalEditionVisible(false);
          setChansonAEditer(null);
        }}
        onModifier={chargerMusiques}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  conteneur: {flex: 1, backgroundColor: COLORS.black},
  zoneSafe: {flex: 1},
  degrade: {...StyleSheet.absoluteFillObject, height: 400},
  boutonRetour: {padding: SPACING.m},
  entete: {alignItems: 'center', marginBottom: 20},
  imageGrande: {width: 200, height: 200, borderRadius: 12, elevation: 10},
  imageSpeciale: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#450af5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiLike: {fontSize: 64, color: COLORS.white},
  titrePlaylist: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  ligneInfosCreateur: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  createur: {color: COLORS.white, fontSize: 14, fontWeight: 'bold'},
  metadata: {color: COLORS.lightGray, fontSize: 12, marginTop: 4},
  abonnés: {color: COLORS.lightGray, fontSize: 12, marginTop: 2, opacity: 0.7},
  boutonPlay: {
    backgroundColor: COLORS.green,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    alignSelf: 'center',
  },
  boutonPlayDesactive: {opacity: 0.4},
  liste: {paddingHorizontal: SPACING.m, paddingBottom: 100},
  ligneMusique: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  blocTexte: {flex: 1},
  titreMusique: {color: COLORS.white, fontSize: 16, fontWeight: '500'},
  artisteMusique: {color: COLORS.lightGray, fontSize: 13, marginTop: 2},
  chargement: {marginTop: 30},
  conteneurVide: {alignItems: 'center', marginTop: 40},
  texteVide: {color: COLORS.lightGray, textAlign: 'center', marginBottom: 20},
  boutonAjouterVide: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  texteBoutonAjouterVide: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  iconesActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boutonActionLigne: {
    marginRight: 15,
  },
  conteneurLigneMusiqueAnim: {
    width: '100%',
  },
});

export default EcranDetailPlaylist;

