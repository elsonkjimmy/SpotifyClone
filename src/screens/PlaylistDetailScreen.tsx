/**
 * Écran Détail de Playlist.
 * Affiche la liste des morceaux d'une playlist spécifique.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ChevronLeft, Play, MoreVertical } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING } from '../theme/colors';
import { chargerEtJouerUneListeDeMusiques } from '../services/ServiceLecteurAudio';

const EcranDetailPlaylist = ({ route, navigation }: any) => {
  const { playlist } = route.params;

  // On simule une liste de musiques pour la démonstration
  const MUSIQUES_DE_LA_PLAYLIST = [
    { id: 'p1', title: 'Song One', artist: playlist.nom, artwork: playlist.image || 'https://picsum.photos/200', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'p2', title: 'Song Two', artist: playlist.nom, artwork: playlist.image || 'https://picsum.photos/201', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'p3', title: 'Song Three', artist: playlist.nom, artwork: playlist.image || 'https://picsum.photos/202', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  ];

  const RenduLigneMusique = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.ligneMusique}
      onPress={() => chargerEtJouerUneListeDeMusiques([item])}
    >
      <View style={styles.blocTexte}>
        <Text style={styles.titreMusique}>{item.title}</Text>
        <Text style={styles.artisteMusique}>{item.artist}</Text>
      </View>
      <MoreVertical color={COLORS.lightGray} size={20} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.conteneur}>
      <LinearGradient colors={['#555555', COLORS.black]} style={styles.degrade} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.boutonRetour} onPress={() => navigation.goBack()}>
          <ChevronLeft color={COLORS.white} size={30} />
        </TouchableOpacity>

        <View style={styles.entete}>
          <Image source={{ uri: playlist.image || 'https://picsum.photos/300' }} style={styles.imageGrande} />
          <Text style={styles.titrePlaylist}>{playlist.nom}</Text>
          <Text style={styles.createur}>{playlist.createur}</Text>
          
          <TouchableOpacity style={styles.boutonPlay} onPress={() => chargerEtJouerUneListeDeMusiques(MUSIQUES_DE_LA_PLAYLIST)}>
            <Play color={COLORS.black} size={30} fill={COLORS.black} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={MUSIQUES_DE_LA_PLAYLIST}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RenduLigneMusique item={item} />}
          contentContainerStyle={styles.liste}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneur: { flex: 1, backgroundColor: COLORS.black },
  degrade: { ...StyleSheet.absoluteFillObject, height: 400 },
  boutonRetour: { padding: SPACING.m },
  entete: { alignItems: 'center', marginBottom: 20 },
  imageGrande: { width: 200, height: 200, borderRadius: 4, elevation: 10 },
  titrePlaylist: { color: COLORS.white, fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  createur: { color: COLORS.lightGray, fontSize: 14, marginTop: 5 },
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
  liste: { paddingHorizontal: SPACING.m, paddingBottom: 100 },
  ligneMusique: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  blocTexte: { flex: 1 },
  titreMusique: { color: COLORS.white, fontSize: 16, fontWeight: '500' },
  artisteMusique: { color: COLORS.lightGray, fontSize: 13, marginTop: 2 },
});

export default EcranDetailPlaylist;
