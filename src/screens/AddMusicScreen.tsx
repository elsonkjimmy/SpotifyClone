/**
 * Écran de téléversement (Upload).
 * Réservé à l'administrateur pour ajouter des musiques sur la plateforme.
 */
import React, {useState} from 'react';
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
import {launchImageLibrary} from 'react-native-image-picker';
import {
  Music,
  Image as ImageIcon,
  LogIn,
  ShieldAlert,
} from 'lucide-react-native';
import {COLORS, SPACING} from '../theme/colors';
import SpotifyLogo from '../components/SpotifyLogo';
import {useAuth} from '../context/AuthContext';
import {televerserVersCloudinary} from '../services/ServiceTeleversement';
import {enregistrerNouvelleMusiqueDansFirestore} from '../services/firestore';

const EcranAjouterMusique = ({navigation}: any) => {
  const {utilisateur, estAdmin} = useAuth();
  const [titreSaisi, setTitreSaisi] = useState('');
  const [artisteSaisi, setArtisteSaisi] = useState('');
  const [fichierAudio, setFichierAudio] = useState<any>(null);
  const [fichierImage, setFichierImage] = useState<any>(null);
  const [estEnTrainDeTeleverser, setEstEnTrainDeTeleverser] = useState(false);

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

  const choisirUneImagePochette = async () => {
    const resultat = await launchImageLibrary({mediaType: 'photo'});
    if (resultat.assets && resultat.assets.length > 0) {
      setFichierImage(resultat.assets[0]);
    }
  };

  const demarrerLeTeleversementFinal = async () => {
    if (!titreSaisi || !artisteSaisi || !fichierAudio || !fichierImage) {
      Alert.alert(
        'Champs incomplets',
        'Veuillez remplir toutes les informations et choisir les fichiers.',
      );
      return;
    }

    setEstEnTrainDeTeleverser(true);
    try {
      const urlImageFinale = await televerserVersCloudinary(
        fichierImage.uri,
        'image',
      );
      const urlAudioFinale = await televerserVersCloudinary(
        fichierAudio.uri,
        'video',
      );
      await enregistrerNouvelleMusiqueDansFirestore(
        titreSaisi,
        artisteSaisi,
        urlAudioFinale,
        urlImageFinale,
      );

      Alert.alert(
        'Succès !',
        'La musique a été ajoutée avec succès sur Spotify Clone.',
      );
      navigation.goBack();
    } catch (erreur) {
      Alert.alert(
        'Erreur',
        'Une erreur est survenue pendant le téléversement.',
      );
    } finally {
      setEstEnTrainDeTeleverser(false);
    }
  };

  if (!utilisateur) {
    return (
      <SafeAreaView style={styles.conteneurPrincipal}>
        <View style={styles.zoneProtegee}>
          <SpotifyLogo size={72} />
          <Text style={styles.titreVerrouille}>Connexion requise</Text>
          <Text style={styles.texteVerrouille}>
            L&apos;ajout de musique est réservé aux utilisateurs connectés.
          </Text>
          <TouchableOpacity
            style={styles.boutonPublier}
            onPress={() => navigation.navigate('Login')}>
            <View style={styles.contenuBoutonConnexion}>
              <LogIn color={COLORS.black} size={18} />
              <Text style={styles.texteBoutonConnexionProtege}>
                SE CONNECTER
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!estAdmin) {
    return (
      <SafeAreaView style={styles.conteneurPrincipal}>
        <View style={styles.zoneProtegee}>
          <ShieldAlert color={COLORS.green} size={64} />
          <Text style={styles.titreVerrouille}>Accès administrateur</Text>
          <Text style={styles.texteVerrouille}>
            Seul le compte admin@ict.com peut ajouter des musiques.
          </Text>
          <TouchableOpacity
            style={styles.boutonRetour}
            onPress={() => navigation.goBack()}>
            <Text style={styles.texteRetour}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      <ScrollView contentContainerStyle={styles.conteneurFormulaire}>
        <SpotifyLogo size={42} showWordmark />
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

        <TouchableOpacity
          style={styles.boutonSelection}
          onPress={choisirUnFichierAudio}>
          <Music color={fichierAudio ? COLORS.green : COLORS.white} size={24} />
          <Text
            style={[
              styles.texteBouton,
              fichierAudio && styles.texteBoutonActif,
            ]}>
            {fichierAudio ? 'Audio sélectionné' : 'Choisir le fichier MP3'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonSelection}
          onPress={choisirUneImagePochette}>
          <ImageIcon
            color={fichierImage ? COLORS.green : COLORS.white}
            size={24}
          />
          <Text
            style={[
              styles.texteBouton,
              fichierImage && styles.texteBoutonActif,
            ]}>
            {fichierImage ? 'Image sélectionnée' : 'Choisir la pochette'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.boutonPublier,
            estEnTrainDeTeleverser && styles.boutonPublierDesactive,
          ]}
          onPress={demarrerLeTeleversementFinal}
          disabled={estEnTrainDeTeleverser}>
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
  conteneurPrincipal: {flex: 1, backgroundColor: COLORS.black},
  conteneurFormulaire: {padding: SPACING.l},
  zoneProtegee: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.l,
  },
  titrePage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 30,
    marginTop: SPACING.m,
  },
  titreVerrouille: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: SPACING.l,
  },
  texteVerrouille: {
    color: COLORS.lightGray,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: SPACING.s,
    marginBottom: SPACING.l,
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
  texteBouton: {color: COLORS.white, marginLeft: SPACING.m, fontSize: 14},
  texteBoutonActif: {color: COLORS.green},
  boutonPublier: {
    backgroundColor: COLORS.green,
    padding: SPACING.l,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
  },
  boutonPublierDesactive: {backgroundColor: '#555'},
  texteBoutonPublier: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  contenuBoutonConnexion: {flexDirection: 'row', alignItems: 'center'},
  texteBoutonConnexionProtege: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
    marginLeft: SPACING.s,
  },
  boutonRetour: {padding: SPACING.m},
  texteRetour: {color: COLORS.white, fontSize: 16, fontWeight: '600'},
});

export default EcranAjouterMusique;
