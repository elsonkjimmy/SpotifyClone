/**
 * Modal d'édition des informations d'une musique.
 * Permet à l'administrateur de corriger le titre ou l'artiste d'un morceau.
 */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {X, Edit3} from 'lucide-react-native';
import {COLORS, SPACING} from '../theme/colors';
import {modifierMusiqueDansFirestore} from '../services/firestore';
import type {Chanson} from '../types';

interface ProprietesModalModifierMusique {
  visible: boolean;
  chanson: Chanson | null;
  onFermer: () => void;
  onModifier: () => void;
}

const ModalModifierMusique = ({
  visible,
  chanson,
  onFermer,
  onModifier,
}: ProprietesModalModifierMusique) => {
  const [titreSaisi, setTitreSaisi] = useState('');
  const [artisteSaisi, setArtisteSaisi] = useState('');
  const [estEnCours, setEstEnCours] = useState(false);

  useEffect(() => {
    if (visible && chanson) {
      setTitreSaisi(chanson.title);
      setArtisteSaisi(chanson.artist);
    }
  }, [visible, chanson]);

  const enregistrerModifications = async () => {
    const titreNettoye = titreSaisi.trim();
    const artisteNettoye = artisteSaisi.trim();

    if (!titreNettoye || !artisteNettoye) {
      Alert.alert('Champs requis', 'Veuillez saisir un titre et un artiste.');
      return;
    }

    if (!chanson) {
      return;
    }

    setEstEnCours(true);
    try {
      const majServeurReussie = await modifierMusiqueDansFirestore(
        chanson.id,
        titreNettoye,
        artisteNettoye,
      );
      Alert.alert(
        'Terminé',
        majServeurReussie
          ? 'Le morceau a été mis à jour sur le serveur.'
          : 'Le morceau a été mis à jour localement (hors-ligne / serveur indisponible).',
      );
      onModifier();
      onFermer();
    } catch (erreur) {
      Alert.alert('Erreur', 'Impossible de modifier la musique.');
    } finally {
      setEstEnCours(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onFermer}>
      <View style={styles.fondSemiTransparent}>
        <View style={styles.conteneurModal}>
          {/* En-tête du modal */}
          <View style={styles.enteteModal}>
            <View style={styles.ligneTitre}>
              <Edit3 color={COLORS.green} size={20} />
              <Text style={styles.titreModal}>Modifier le titre</Text>
            </View>
            <TouchableOpacity onPress={onFermer}>
              <X color={COLORS.white} size={24} />
            </TouchableOpacity>
          </View>

          {/* Formulaire */}
          <View style={styles.formulaire}>
            <Text style={styles.labelInput}>Titre du morceau</Text>
            <TextInput
              style={styles.champSaisie}
              value={titreSaisi}
              onChangeText={setTitreSaisi}
              placeholder="Titre"
              placeholderTextColor={COLORS.lightGray}
            />

            <Text style={styles.labelInput}>Nom de l'artiste</Text>
            <TextInput
              style={styles.champSaisie}
              value={artisteSaisi}
              onChangeText={setArtisteSaisi}
              placeholder="Artiste"
              placeholderTextColor={COLORS.lightGray}
            />

            {/* Bouton d'action */}
            <TouchableOpacity
              style={[
                styles.boutonEnregistrer,
                estEnCours && styles.boutonDesactive,
              ]}
              onPress={enregistrerModifications}
              disabled={estEnCours}>
              {estEnCours ? (
                <ActivityIndicator color={COLORS.black} />
              ) : (
                <Text style={styles.texteBouton}>METTRE À JOUR</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fondSemiTransparent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.l,
  },
  conteneurModal: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  enteteModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  ligneTitre: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titreModal: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.s,
  },
  formulaire: {
    padding: SPACING.m,
  },
  labelInput: {
    color: COLORS.lightGray,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.s,
    textTransform: 'uppercase',
  },
  champSaisie: {
    backgroundColor: '#2A2A2A',
    color: COLORS.white,
    paddingHorizontal: SPACING.m,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 15,
    marginBottom: SPACING.m,
  },
  boutonEnregistrer: {
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: SPACING.s,
  },
  boutonDesactive: {
    backgroundColor: '#555',
  },
  texteBouton: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default ModalModifierMusique;
