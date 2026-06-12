/**
 * Écran de création d'une nouvelle playlist utilisateur.
 * Affiché en modal, il permet à un utilisateur connecté
 * de saisir un nom et de créer instantanément sa playlist.
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {ChevronLeft, LogIn, ListMusic} from 'lucide-react-native';
import {COLORS, SPACING} from '../theme/colors';
import {useAuth} from '../context/AuthContext';
import {creerNouvellePlaylist} from '../services/firestore';

const EcranCreerPlaylist = ({navigation}: any) => {
  const {utilisateur} = useAuth();
  const [nomSaisi, setNomSaisi] = useState('');
  const [estEnCours, setEstEnCours] = useState(false);

  /** Lance la création de la playlist et revient en arrière */
  const lancerLaCreation = async () => {
    const nomNettoye = nomSaisi.trim();
    if (!nomNettoye) {
      Alert.alert('Nom requis', 'Veuillez saisir un nom pour votre playlist.');
      return;
    }

    if (!utilisateur) {
      return;
    }

    setEstEnCours(true);
    try {
      await creerNouvellePlaylist(utilisateur.uid, nomNettoye);
      Alert.alert('Succès', `La playlist "${nomNettoye}" a été créée !`);
      navigation.goBack();
    } catch (erreur) {
      Alert.alert(
        'Erreur',
        'Impossible de créer la playlist. Réessayez plus tard.',
      );
    } finally {
      setEstEnCours(false);
    }
  };

  // --- Écran si l'utilisateur n'est pas connecté ---
  if (!utilisateur) {
    return (
      <SafeAreaView style={styles.conteneurPrincipal}>
        <View style={styles.zoneProtegee}>
          <ListMusic color={COLORS.green} size={64} />
          <Text style={styles.titreVerrouille}>Connexion requise</Text>
          <Text style={styles.texteVerrouille}>
            Connectez-vous pour créer vos propres playlists.
          </Text>
          <TouchableOpacity
            style={styles.boutonCreer}
            onPress={() => navigation.navigate('Login')}>
            <View style={styles.contenuBoutonConnexion}>
              <LogIn color={COLORS.black} size={18} />
              <Text style={styles.texteBoutonConnexion}>SE CONNECTER</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Écran principal de création ---
  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      {/* Barre supérieure avec bouton retour */}
      <View style={styles.barreNavigation}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color={COLORS.white} size={30} />
        </TouchableOpacity>
        <Text style={styles.titreNavigation}>Nouvelle playlist</Text>
        <View style={styles.espaceVide} />
      </View>

      <View style={styles.conteneurFormulaire}>
        <ListMusic color={COLORS.green} size={80} />
        <Text style={styles.titrePage}>Donne un nom à ta playlist</Text>

        <TextInput
          style={styles.champSaisie}
          value={nomSaisi}
          onChangeText={setNomSaisi}
          placeholder="Ma playlist"
          placeholderTextColor={COLORS.lightGray}
          autoFocus
          maxLength={50}
        />

        <TouchableOpacity
          style={[styles.boutonCreer, estEnCours && styles.boutonDesactive]}
          onPress={lancerLaCreation}
          disabled={estEnCours}>
          {estEnCours ? (
            <ActivityIndicator color={COLORS.black} />
          ) : (
            <Text style={styles.texteBoutonCreer}>CRÉER</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boutonAnnuler}
          onPress={() => navigation.goBack()}>
          <Text style={styles.texteAnnuler}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {flex: 1, backgroundColor: COLORS.black},
  barreNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
  },
  titreNavigation: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  espaceVide: {width: 30},
  conteneurFormulaire: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.l,
  },
  titrePage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.l,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  champSaisie: {
    backgroundColor: COLORS.cardBackground,
    color: COLORS.white,
    padding: SPACING.m,
    borderRadius: 8,
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
    marginBottom: SPACING.l,
  },
  boutonCreer: {
    backgroundColor: COLORS.green,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginTop: SPACING.s,
  },
  boutonDesactive: {backgroundColor: '#555'},
  texteBoutonCreer: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  boutonAnnuler: {marginTop: SPACING.m, padding: SPACING.s},
  texteAnnuler: {color: COLORS.lightGray, fontSize: 15, fontWeight: '500'},
  zoneProtegee: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.l,
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
  contenuBoutonConnexion: {flexDirection: 'row', alignItems: 'center'},
  texteBoutonConnexion: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
    marginLeft: SPACING.s,
  },
});

export default EcranCreerPlaylist;
