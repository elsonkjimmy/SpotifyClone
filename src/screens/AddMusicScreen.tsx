/**
 * Écran de téléversement (Upload).
 * Réservé à l'administrateur pour ajouter des musiques sur la plateforme.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { Music, Image as ImageIcon, CheckCircle } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { televerserVersCloudinary } from '../services/ServiceTeleversement';
import { enregistrerNouvelleMusiqueDansFirestore } from '../services/firestore';

const EcranAjouterMusique = ({ navigation }: any) => {
  const [titreSaisi, setTitreSaisi] = useState('');
  const [artisteSaisi, setArtisteSaisi] = useState('');
  const [fichierAudio, setFichierAudio] = useState<any>(null);
  const [fichierImage, setFichierImage] = useState<any>(null);
  const [estEnTrainDeTeleverser, setEstEnTrainDeTeleverser] = useState(false);

  // Fonction pour choisir un fichier MP3 sur le téléphone
  const choisirUnFichierAudio = async () => {
    try {
      const resultat = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.audio],
      });
      setFichierAudio(resultat);
    } catch (erreur) {
      if (!DocumentPicker.isCancel(erreur)) {
        console.error(erreur);
      }
    }
  };

  // Fonction pour choisir une image de couverture
  const choisirUneImagePochette = async () => {
    const resultat = await launchImageLibrary({ mediaType: 'photo' });
    if (resultat.assets && resultat.assets.length > 0) {
      setFichierImage(resultat.assets[0]);
    }
  };

  // Action finale : Envoyer vers Cloudinary puis vers Firestore
  const demarrerLeTeleversementFinal = async () => {
    if (!titreSaisi || !artisteSaisi || !fichierAudio || !fichierImage) {
      Alert.alert('Champs incomplets', 'Veuillez remplir toutes les informations et choisir les fichiers.');
      return;
    }

    setEstEnTrainDeTeleverser(true);
    try {
      // 1. Envoyer l'image sur Cloudinary
      const urlImageFinale = await televerserVersCloudinary(fichierImage.uri, 'image');
      
      // 2. Envoyer le MP3 sur Cloudinary (On utilise 'video' car Cloudinary traite l'audio dans cette catégorie)
      const urlAudioFinale = await televerserVersCloudinary(fichierAudio.uri, 'video');

      // 3. Enregistrer les liens dans Firestore
      await enregistrerNouvelleMusiqueDansFirestore(titreSaisi, artisteSaisi, urlAudioFinale, urlImageFinale);

      Alert.alert('Succès !', 'La musique a été ajoutée avec succès sur Spotify Clone.');
      navigation.goBack();
    } catch (erreur) {
      Alert.alert('Erreur', 'Une erreur est survenue pendant le téléversement.');
    } finally {
      setEstEnTrainDeTeleverser(false);
    }
  };

  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      <ScrollView contentContainerStyle={styles.conteneurFormulaire}>
        <Text style={styles.titrePage}>Ajouter une musique</Text>

        <Text style={styles.label}>Titre de la chanson</Text>
        <TextInput
          style={styles.champSaisie}
          value={titreSaisi}
          onChangeText={setTitreSaisi}
          placeholder="Ex: Afro Heat"
          placeholderTextColor={COLORS.lightGray}
        />

        <Text style={styles.label}>Artiste</Text>
        <TextInput
          style={styles.champSaisie}
          value={artisteSaisi}
          onChangeText={setArtisteSaisi}
          placeholder="Ex: Burna Boy"
          placeholderTextColor={COLORS.lightGray}
        />

        {/* Bouton pour l'audio */}
        <TouchableOpacity style={styles.boutonSelection} onPress={choisirUnFichierAudio}>
          <Music color={fichierAudio ? COLORS.green : COLORS.white} size={24} />
          <Text style={[styles.texteBouton, fichierAudio && { color: COLORS.green }]}>
            {fichierAudio ? 'Audio sélectionné' : 'Choisir le fichier MP3'}
          </Text>
        </TouchableOpacity>

        {/* Bouton pour l'image */}
        <TouchableOpacity style={styles.boutonSelection} onPress={choisirUneImagePochette}>
          <ImageIcon color={fichierImage ? COLORS.green : COLORS.white} size={24} />
          <Text style={[styles.texteBouton, fichierImage && { color: COLORS.green }]}>
            {fichierImage ? 'Image sélectionnée' : 'Choisir la pochette'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.boutonPublier, estEnTrainDeTeleverser && { backgroundColor: '#555' }]} 
          onPress={demarrerLeTeleversementFinal}
          disabled={estEnTrainDeTeleverser}
        >
          {estEnTrainDeTeleverser ? (
            <ActivityIndicator color={COLORS.black} />
          ) : (
            <Text style={styles.texteBoutonPublier}>PUBLIER SUR SPOTIFY</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  conteneurFormulaire: {
    padding: SPACING.l,
  },
  titrePage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 30,
  },
  label: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.s,
  },
  champSaisie: {
    backgroundColor: COLORS.cardBackground,
    color: COLORS.white,
    padding: SPACING.m,
    borderRadius: 8,
    marginBottom: SPACING.l,
  },
  boutonSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    padding: SPACING.m,
    borderRadius: 8,
    marginBottom: SPACING.m,
    borderStyle: 'dashed',
  },
  texteBouton: {
    color: COLORS.white,
    marginLeft: SPACING.m,
    fontSize: 14,
  },
  boutonPublier: {
    backgroundColor: COLORS.green,
    padding: SPACING.l,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
  },
  texteBoutonPublier: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default EcranAjouterMusique;
