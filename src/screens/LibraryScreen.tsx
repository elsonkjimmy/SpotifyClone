/**
 * Écran Ma Bibliothèque (Library).
 * Affiche les playlists et les favoris de l'utilisateur avec un design Premium.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Heart, Plus, LogOut, Search, ArrowUpDown } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { deconnecterUtilisateur } from '../services/auth';
import auth from '@react-native-firebase/auth';

// Données fictives améliorées pour la bibliothèque
const MES_PLAYLISTS_EXEMPLE = [
  { id: '1', nom: 'Titres likés', createur: 'Playlist • 125 titres', estSpeciale: true },
  { id: '2', nom: 'Afrobeat 2026', createur: 'Playlist • Moi', image: 'https://i.scdn.co/image/ab67616d0000b273b3c3c7e3f8476a66a152331a' },
  { id: '3', nom: 'Concentration TP', createur: 'Playlist • Spotify', image: 'https://i.scdn.co/image/ab67616d0000b2734718e5b124f7979288e1467a' },
  { id: '4', nom: 'Sport Matin', createur: 'Album • Burna Boy', image: 'https://i.scdn.co/image/ab67616d0000b2739418edfa6d914569485b00c5' },
  { id: '5', nom: 'Mix Années 80', createur: 'Playlist • Spotify', image: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b0057b9e4450af5' },
];

const EcranMaBibliotheque = ({ navigation }: any) => {
  const utilisateurActuel = auth().currentUser;
  
  // Logique Admin pour le TP
  const EMAIL_ADMIN = 'admin@ict.com';
  const estAdministrateur = utilisateurActuel?.email === EMAIL_ADMIN;

  const RenduLignePlaylist = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.conteneurLigne}
      onPress={() => navigation.navigate('PlaylistDetail', { playlist: item })}
    >
      {item.estSpeciale ? (
        <View style={styles.carreVioletLike}>
          <Heart color={COLORS.white} size={24} fill={COLORS.white} />
        </View>
      ) : (
        <Image source={{ uri: item.image }} style={styles.imagePlaylist} />
      )}
      
      <View style={styles.sectionTexte}>
        <Text style={[styles.nomPlaylist, item.estSpeciale && { color: COLORS.green }]} numberOfLines={1}>
          {item.nom}
        </Text>
        <Text style={styles.infoCreateur}>{item.createur}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      {/* En-tête : Avatar, Titre et Actions */}
      <View style={styles.entete}>
        <View style={styles.ligneUtilisateur}>
          <View style={styles.avatarCercle}>
            <Text style={styles.texteAvatar}>U</Text>
          </View>
          <Text style={styles.titrePage}>Ta bibliothèque</Text>
          
          <View style={styles.iconesAction}>
            <TouchableOpacity style={styles.boutonIcone}>
              <Search color={COLORS.white} size={26} />
            </TouchableOpacity>
            {estAdministrateur && (
              <TouchableOpacity 
                style={styles.boutonIcone} 
                onPress={() => navigation.navigate('AddMusic')}
              >
                <Plus color={COLORS.white} size={30} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.boutonIcone} 
              onPress={() => deconnecterUtilisateur()}
            >
              <LogOut color={COLORS.lightGray} size={22} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Barre de filtres défilante */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barreFiltres}>
          {['Playlists', 'Artistes', 'Albums', 'Podcasts'].map((filtre, index) => (
            <TouchableOpacity key={index} style={styles.piluleFiltre}>
              <Text style={styles.texteFiltre}>{filtre}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Options de tri (Récents) */}
      <View style={styles.barreTri}>
        <ArrowUpDown color={COLORS.white} size={16} />
        <Text style={styles.texteTri}>Récents</Text>
      </View>

      {/* Liste des Playlists / Albums */}
      <FlatList
        data={MES_PLAYLISTS_EXEMPLE}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RenduLignePlaylist item={item} />}
        contentContainerStyle={styles.listeContenu}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  entete: {
    paddingTop: SPACING.m,
    paddingHorizontal: SPACING.m,
  },
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
  texteAvatar: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 14,
  },
  titrePage: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },
  iconesAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boutonIcone: {
    marginLeft: 20,
  },
  barreFiltres: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  piluleFiltre: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    marginRight: 8,
  },
  texteFiltre: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
  },
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
  listeContenu: {
    paddingHorizontal: SPACING.m,
    paddingBottom: 120,
  },
  conteneurLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaylist: {
    width: 64,
    height: 64,
    borderRadius: 4,
  },
  carreVioletLike: {
    width: 64,
    height: 64,
    borderRadius: 4,
    backgroundColor: '#450af5', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTexte: {
    marginLeft: 12,
    flex: 1,
  },
  nomPlaylist: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoCreateur: {
    color: COLORS.lightGray,
    fontSize: 13,
    marginTop: 4,
  },
});

export default EcranMaBibliotheque;
