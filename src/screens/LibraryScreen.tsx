/**
 * Écran Ma Bibliothèque (Library).
 * Affiche les playlists depuis Firestore.
 * Style : Glassmorphism premium avec fond en dégradé violet profond.
 */
import React, {useCallback, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Heart, Plus, Search, ArrowUpDown, ListPlus} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SPACING} from '../theme/colors';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';
import OfflineBanner from '../components/OfflineBanner';
import {
  recupererToutesLesPlaylists,
  recupererFavorisUtilisateur,
} from '../services/firestore';
import type {Playlist} from '../types';

// ─── Sous-composant : Ligne Playlist Animée avec Effet de Rebond ───
const LignePlaylistAnimee = ({
  item,
  surAppui,
}: {
  item: Playlist;
  surAppui: () => void;
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
    surAppui();
  }, [surAppui, valeurEchelle]);

  return (
    <Animated.View style={{transform: [{scale: valeurEchelle}]}}>
      <TouchableOpacity
        style={styles.conteneurLigne}
        onPress={gererAppui}
        activeOpacity={0.85}>
        {item.estSpeciale ? (
          <LinearGradient
            colors={['#7f00ff', '#e100ff']}
            style={styles.carreVioletLike}>
            <Heart color={COLORS.white} size={24} fill={COLORS.white} />
          </LinearGradient>
        ) : (
          <Image
            source={{uri: item.image || 'https://picsum.photos/64'}}
            style={styles.imagePlaylist}
          />
        )}

        <View style={styles.sectionTexte}>
          <Text
            style={[
              styles.nomPlaylist,
              item.estSpeciale && styles.nomPlaylistSpeciale,
            ]}
            numberOfLines={1}>
            {item.nom}
          </Text>
          <Text style={styles.infoCreateur}>
            {item.createur} • {item.songIds?.length ?? 0} titres
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EcranMaBibliotheque = ({navigation}: any) => {
  const {utilisateur, estAdmin} = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(true);
  const [filtreActif, setFiltreActif] = useState('Playlists');
  const [triActif, setTriActif] = useState<
    'recents' | 'alphabetique' | 'inverse'
  >('recents');

  const chargerPlaylists = useCallback(async () => {
    setEstEnTrainDeCharger(true);
    try {
      let resultat = await recupererToutesLesPlaylists();
      if (utilisateur) {
        const favoris = await recupererFavorisUtilisateur(utilisateur.uid);
        resultat = resultat.map(p => {
          if (p.estSpeciale) {
            return {...p, songIds: favoris};
          }
          return p;
        });
      }
      setPlaylists(resultat);
    } catch (erreur) {
      console.log('Erreur bibliothèque:', erreur);
    } finally {
      setEstEnTrainDeCharger(false);
    }
  }, [utilisateur]);

  useFocusEffect(
    useCallback(() => {
      chargerPlaylists();
    }, [chargerPlaylists]),
  );

  const playlistsFiltrees = playlists.filter(p => {
    if (filtreActif === 'Albums') {
      return p.createur.toLowerCase().includes('album');
    }
    if (filtreActif === 'Playlists') {
      return !p.createur.toLowerCase().includes('album');
    }
    return true;
  });

  const playlistsTriees = [...playlistsFiltrees].sort((a, b) => {
    if (triActif === 'alphabetique') {
      return a.nom.localeCompare(b.nom);
    }
    if (triActif === 'inverse') {
      return b.nom.localeCompare(a.nom);
    }
    return 0;
  });

  const initialeAvatar = utilisateur?.email?.charAt(0).toUpperCase() ?? 'U';

  const renderLignePlaylist = ({item}: {item: Playlist}) => (
    <LignePlaylistAnimee
      item={item}
      surAppui={() => navigation.navigate('PlaylistDetail', {playlist: item})}
    />
  );

  return (
    <View style={styles.conteneurPrincipal}>
      <LinearGradient
        colors={['#1c0c29', '#0d0714', COLORS.black]}
        style={styles.degradeFond}
      />
      <SafeAreaView style={styles.zoneSafe}>
        <OfflineBanner />
        <View style={styles.entete}>
          <View style={styles.ligneUtilisateur}>
            <View style={styles.avatarCercle}>
              <Text style={styles.texteAvatar}>{initialeAvatar}</Text>
            </View>
            <Text style={styles.titrePage}>Ta bibliothèque</Text>

            <View style={styles.iconesAction}>
              <TouchableOpacity
                style={styles.boutonIcone}
                onPress={() => navigation.navigate('Search')}>
                <Search color={COLORS.white} size={26} />
              </TouchableOpacity>
              {utilisateur && (
                <TouchableOpacity
                  style={styles.boutonIcone}
                  onPress={() => navigation.navigate('CreatePlaylist')}>
                  <ListPlus color={COLORS.white} size={28} />
                </TouchableOpacity>
              )}
              {estAdmin && (
                <TouchableOpacity
                  style={styles.boutonIcone}
                  onPress={() => navigation.navigate('AddMusic')}>
                  <Plus color={COLORS.white} size={30} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.barreFiltres}>
            {['Playlists', 'Artistes', 'Albums', 'Podcasts'].map(filtre => (
              <TouchableOpacity
                key={filtre}
                style={[
                  styles.piluleFiltre,
                  filtreActif === filtre && styles.piluleFiltreActive,
                ]}
                onPress={() => setFiltreActif(filtre)}>
                <Text
                  style={[
                    styles.texteFiltre,
                    filtreActif === filtre && styles.texteFiltreActive,
                  ]}>
                  {filtre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.barreTri}
          onPress={() => {
            if (triActif === 'recents') {
              setTriActif('alphabetique');
            } else if (triActif === 'alphabetique') {
              setTriActif('inverse');
            } else {
              setTriActif('recents');
            }
          }}>
          <ArrowUpDown color={COLORS.white} size={16} />
          <Text style={styles.texteTri}>
            {triActif === 'recents'
              ? 'Récents'
              : triActif === 'alphabetique'
              ? 'Nom (A-Z)'
              : 'Nom (Z-A)'}
          </Text>
        </TouchableOpacity>

        {estEnTrainDeCharger ? (
          <ActivityIndicator color={COLORS.green} style={styles.chargement} />
        ) : (
          <FlatList
            data={playlistsTriees}
            keyExtractor={item => item.id}
            renderItem={renderLignePlaylist}
            contentContainerStyle={styles.listeContenu}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={estEnTrainDeCharger}
                onRefresh={chargerPlaylists}
                tintColor={COLORS.green}
              />
            }
            ListEmptyComponent={
              <View style={styles.conteneurVide}>
                <ListPlus color={COLORS.lightGray} size={60} style={{marginBottom: 20}} />
                <Text style={styles.titreVide}>Ta bibliothèque est vide</Text>
                <Text style={styles.sousTitreVide}>
                  Commence par créer une playlist ou ajoute tes titres préférés.
                </Text>
                <TouchableOpacity
                  style={styles.boutonExplorer}
                  onPress={() => navigation.navigate('Search')}>
                  <Text style={styles.texteBoutonExplorer}>EXPLORER</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {flex: 1, backgroundColor: COLORS.black},
  zoneSafe: {flex: 1},
  degradeFond: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  entete: {paddingTop: SPACING.m, paddingHorizontal: SPACING.m},
  ligneUtilisateur: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCercle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F57C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  texteAvatar: {color: COLORS.black, fontWeight: 'bold', fontSize: 14},
  titrePage: {fontSize: 22, fontWeight: 'bold', color: COLORS.white, flex: 1},
  iconesAction: {flexDirection: 'row', alignItems: 'center'},
  boutonIcone: {marginLeft: 20},
  barreFiltres: {flexDirection: 'row', marginBottom: 10},
  piluleFiltre: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Effet de verre givré
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginRight: 8,
  },
  piluleFiltreActive: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  texteFiltre: {color: COLORS.white, fontSize: 13, fontWeight: '500'},
  texteFiltreActive: {color: COLORS.black, fontWeight: 'bold'},
  barreTri: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: 15,
  },
  texteTri: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  listeContenu: {paddingHorizontal: SPACING.m, paddingBottom: 120},
  conteneurLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaylist: {width: 64, height: 64, borderRadius: 4},
  carreVioletLike: {
    width: 64,
    height: 64,
    borderRadius: 4,
    backgroundColor: '#450af5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTexte: {marginLeft: 12, flex: 1},
  nomPlaylist: {color: COLORS.white, fontSize: 16, fontWeight: '600'},
  nomPlaylistSpeciale: {color: COLORS.green},
  infoCreateur: {color: COLORS.lightGray, fontSize: 13, marginTop: 4},
  chargement: {marginTop: 40},
  conteneurVide: {alignItems: 'center', marginTop: 80, paddingHorizontal: 40},
  titreVide: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  sousTitreVide: {
    color: COLORS.lightGray,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  boutonExplorer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
  },
  texteBoutonExplorer: {
    color: COLORS.black,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 12,
  },
});

export default EcranMaBibliotheque;
