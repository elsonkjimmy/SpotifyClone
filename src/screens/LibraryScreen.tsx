/**
 * Écran Ma Bibliothèque (Library).
 * Permet à l'utilisateur de voir ses playlists et ses musiques favorites.
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
} from 'react-native';
import { Heart, Plus, Music, LogOut } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { deconnecterUtilisateur } from '../services/auth';
import auth from '@react-native-firebase/auth';

// Données fictives pour simuler le contenu de la bibliothèque
const MES_PLAYLISTS_EXEMPLE = [
  { id: '1', nom: 'Titres likés', createur: 'Playlist • 125 titres', icone: 'heart', estSpeciale: true },
  { id: '2', nom: 'Afrobeat 2026', createur: 'Par Moi', image: 'https://i.scdn.co/image/ab67616d0000b273b3c3c7e3f8476a66a152331a' },
  { id: '3', nom: 'Concentration TP', createur: 'Par Moi', image: 'https://i.scdn.co/image/ab67616d0000b2734718e5b124f7979288e1467a' },
  { id: '4', nom: 'Sport Matin', createur: 'Par Moi', image: 'https://i.scdn.co/image/ab67616d0000b2739418edfa6d914569485b00c5' },
];

const EcranMaBibliotheque = ({ navigation }: any) => {
  const utilisateurActuel = auth().currentUser;
  
  // On définit ici l'email de l'administrateur (celui qui a le droit d'ajouter)
  const EMAIL_ADMIN = 'admin@ict.com';
  const estAdministrateur = utilisateurActuel?.email === EMAIL_ADMIN;

  // Composant interne pour afficher chaque ligne de playlist
  const RenduLignePlaylist = ({ item }: any) => (
    <TouchableOpacity style={styles.conteneurLigne}>
      {item.estSpeciale ? (
        <View style={styles.carreIconeLike}>
          <Heart color={COLORS.white} size={24} fill={COLORS.white} />
        </View>
      ) : (
        <Image source={{ uri: item.image }} style={styles.imagePlaylist} />
      )}
      
      <View style={styles.sectionTexte}>
        <Text style={[styles.nomPlaylist, item.estSpeciale && { color: COLORS.green }]}>
          {item.nom}
        </Text>
        <Text style={styles.infoCreateur}>{item.createur}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      {/* En-tête de la bibliothèque */}
      <View style={styles.entete}>
        <View style={styles.ligneUtilisateur}>
          <View style={styles.avatarCercle}>
            <Text style={styles.texteAvatar}>U</Text>
          </View>
          <Text style={styles.titrePage}>Ta bibliothèque</Text>
          <View style={styles.iconesAction}>
            {estAdministrateur && (
              <TouchableOpacity 
                style={styles.boutonAction} 
                onPress={() => navigation.navigate('AddMusic')}
              >
                <Plus color={COLORS.white} size={28} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.boutonAction} 
              onPress={() => deconnecterUtilisateur()}
            >
              <LogOut color={COLORS.lightGray} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtres (Boutons "Playlists", "Artistes", etc.) */}
        <View style={styles.conteneurFiltres}>
          <TouchableOpacity style={styles.piluleFiltreActive}>
            <Text style={styles.texteFiltreActif}>Playlists</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.piluleFiltre}>
            <Text style={styles.texteFiltre}>Artistes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.piluleFiltre}>
            <Text style={styles.texteFiltre}>Albums</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des playlists */}
      <FlatList
        data={MES_PLAYLISTS_EXEMPLE}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RenduLignePlaylist item={item} />}
        contentContainerStyle={styles.listePlaylists}
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
    padding: SPACING.m,
  },
  ligneUtilisateur: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  avatarCercle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#F57C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  texteAvatar: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 16,
  },
  titrePage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },
  iconesAction: {
    flexDirection: 'row',
  },
  boutonAction: {
    marginLeft: SPACING.m,
  },
  conteneurFiltres: {
    flexDirection: 'row',
    marginBottom: SPACING.s,
  },
  piluleFiltre: {
    paddingHorizontal: SPACING.m,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    marginRight: SPACING.s,
  },
  piluleFiltreActive: {
    paddingHorizontal: SPACING.m,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.green,
    marginRight: SPACING.s,
  },
  texteFiltre: {
    color: COLORS.white,
    fontSize: 12,
  },
  texteFiltreActif: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listePlaylists: {
    paddingHorizontal: SPACING.m,
    paddingBottom: 100,
  },
  conteneurLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  imagePlaylist: {
    width: 64,
    height: 64,
    borderRadius: 4,
  },
  carreIconeLike: {
    width: 64,
    height: 64,
    borderRadius: 4,
    backgroundColor: '#450af5', // Violet Spotify pour les titres likés
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTexte: {
    marginLeft: SPACING.m,
    flex: 1,
  },
  nomPlaylist: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCreateur: {
    color: COLORS.lightGray,
    fontSize: 14,
    marginTop: 4,
  },
});

export default EcranMaBibliotheque;
