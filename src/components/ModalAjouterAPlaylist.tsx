/**
 * Modal pour ajouter ou retirer une chanson de playlists utilisateur.
 * Apparaît quand l'utilisateur appuie longuement (ou clique '...') sur une chanson.
 * Affiche la liste des playlists de l'utilisateur avec des cases à cocher,
 * et un bouton pour créer une nouvelle playlist.
 */
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {X, Plus, Check, Square, ListMusic} from 'lucide-react-native';
import {COLORS, SPACING} from '../theme/colors';
import {useAuth} from '../context/AuthContext';
import {
  recupererPlaylistsUtilisateur,
  ajouterChansonAPlaylist,
  retirerChansonDePlaylist,
} from '../services/firestore';
import type {Chanson, Playlist} from '../types';

interface ProprietesModalAjouterAPlaylist {
  visible: boolean;
  chanson: Chanson;
  onFermer: () => void;
  /** Optionnel : appelé pour naviguer vers l'écran de création de playlist */
  onCreerPlaylist?: () => void;
}

const ModalAjouterAPlaylist = ({
  visible,
  chanson,
  onFermer,
  onCreerPlaylist,
}: ProprietesModalAjouterAPlaylist) => {
  const {utilisateur} = useAuth();
  const [playlistsUtilisateur, setPlaylistsUtilisateur] = useState<Playlist[]>(
    [],
  );
  const [estEnChargement, setEstEnChargement] = useState(false);
  /** Ensemble des IDs de playlists contenant déjà la chanson */
  const [idsPlaylistsSelectionnees, setIdsPlaylistsSelectionnees] = useState<
    Set<string>
  >(new Set());

  /** Charge les playlists de l'utilisateur connecté */
  const chargerLesPlaylistsUtilisateur = useCallback(async () => {
    if (!utilisateur) {
      return;
    }
    setEstEnChargement(true);
    try {
      const playlists = await recupererPlaylistsUtilisateur(utilisateur.uid);
      setPlaylistsUtilisateur(playlists);

      // Pré-cocher les playlists qui contiennent déjà la chanson
      const idsDejaPresents = new Set<string>();
      playlists.forEach(playlist => {
        if (playlist.songIds.includes(chanson.id)) {
          idsDejaPresents.add(playlist.id);
        }
      });
      setIdsPlaylistsSelectionnees(idsDejaPresents);
    } catch (erreur) {
      console.log('Erreur chargement playlists utilisateur:', erreur);
    } finally {
      setEstEnChargement(false);
    }
  }, [utilisateur, chanson.id]);

  useEffect(() => {
    if (visible) {
      chargerLesPlaylistsUtilisateur();
    }
  }, [visible, chargerLesPlaylistsUtilisateur]);

  /** Bascule l'état d'une chanson dans une playlist (ajout ou retrait) */
  const basculerChansonDansPlaylist = async (playlistId: string) => {
    const estSelectionnee = idsPlaylistsSelectionnees.has(playlistId);
    const nouvelEnsemble = new Set(idsPlaylistsSelectionnees);

    if (estSelectionnee) {
      // Retirer la chanson de la playlist
      nouvelEnsemble.delete(playlistId);
      setIdsPlaylistsSelectionnees(nouvelEnsemble);
      await retirerChansonDePlaylist(playlistId, chanson.id);
    } else {
      // Ajouter la chanson à la playlist
      nouvelEnsemble.add(playlistId);
      setIdsPlaylistsSelectionnees(nouvelEnsemble);
      await ajouterChansonAPlaylist(playlistId, chanson.id);
    }
  };

  /** Rendu d'une ligne de playlist avec case à cocher */
  const renderLignePlaylist = ({item}: {item: Playlist}) => {
    const estCochee = idsPlaylistsSelectionnees.has(item.id);
    return (
      <TouchableOpacity
        style={styles.lignePlaylist}
        onPress={() => basculerChansonDansPlaylist(item.id)}>
        {estCochee ? (
          <Check color={COLORS.green} size={22} />
        ) : (
          <Square color={COLORS.lightGray} size={22} />
        )}
        <View style={styles.textePlaylist}>
          <Text style={styles.nomPlaylist} numberOfLines={1}>
            {item.nom}
          </Text>
          <Text style={styles.infoPlaylist}>{item.songIds.length} titres</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onFermer}>
      <View style={styles.fondSemiTransparent}>
        <View style={styles.conteneurModal}>
          {/* En-tête du modal */}
          <View style={styles.enteteModal}>
            <Text style={styles.titreModal}>Ajouter à une playlist</Text>
            <TouchableOpacity onPress={onFermer}>
              <X color={COLORS.white} size={24} />
            </TouchableOpacity>
          </View>

          {/* Info chanson sélectionnée */}
          <Text style={styles.infoChanson} numberOfLines={1}>
            {chanson.title} — {chanson.artist}
          </Text>

          {/* Bouton "Nouvelle playlist" */}
          <TouchableOpacity
            style={styles.boutonNouvellePlaylist}
            onPress={() => {
              onFermer();
              if (onCreerPlaylist) {
                onCreerPlaylist();
              }
            }}>
            <Plus color={COLORS.green} size={22} />
            <Text style={styles.texteNouvellePlaylist}>Nouvelle playlist</Text>
          </TouchableOpacity>

          {/* Message si non connecté */}
          {!utilisateur && (
            <View style={styles.zoneVide}>
              <ListMusic color={COLORS.lightGray} size={40} />
              <Text style={styles.texteVide}>
                Connectez-vous pour gérer vos playlists.
              </Text>
            </View>
          )}

          {/* Liste des playlists */}
          {utilisateur && estEnChargement && (
            <ActivityIndicator
              color={COLORS.green}
              style={styles.indicateurChargement}
            />
          )}

          {utilisateur && !estEnChargement && (
            <FlatList
              data={playlistsUtilisateur}
              keyExtractor={item => item.id}
              renderItem={renderLignePlaylist}
              contentContainerStyle={styles.listeContenu}
              ListEmptyComponent={
                <Text style={styles.texteVide}>
                  Aucune playlist. Créez-en une !
                </Text>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fondSemiTransparent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  conteneurModal: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    paddingBottom: SPACING.xl,
  },
  enteteModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  titreModal: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoChanson: {
    color: COLORS.lightGray,
    fontSize: 13,
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.s,
    paddingBottom: SPACING.m,
  },
  boutonNouvellePlaylist: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  texteNouvellePlaylist: {
    color: COLORS.green,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: SPACING.m,
  },
  lignePlaylist: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: 14,
  },
  textePlaylist: {marginLeft: SPACING.m, flex: 1},
  nomPlaylist: {color: COLORS.white, fontSize: 15, fontWeight: '500'},
  infoPlaylist: {color: COLORS.lightGray, fontSize: 12, marginTop: 2},
  listeContenu: {paddingBottom: SPACING.m},
  indicateurChargement: {marginTop: SPACING.l},
  zoneVide: {alignItems: 'center', paddingVertical: SPACING.xl},
  texteVide: {
    color: COLORS.lightGray,
    textAlign: 'center',
    marginTop: SPACING.m,
    fontSize: 14,
  },
});

export default ModalAjouterAPlaylist;
