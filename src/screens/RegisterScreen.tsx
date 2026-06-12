/**
 * Écran d'inscription (Register) - Version Premium.
 */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SPACING} from '../theme/colors';
import {creerCompteUtilisateurAvecEmail} from '../services/auth';
import SpotifyLogo from '../components/SpotifyLogo';

const EcranDInscription = ({navigation}: any) => {
  const [emailSaisi, setEmailSaisi] = useState('');
  const [motDePasseSaisi, setMotDePasseSaisi] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(false);

  const gererActionDInscription = async () => {
    if (!emailSaisi || !motDePasseSaisi || !confirmationMotDePasse) {
      Alert.alert('Champs incomplets', 'Veuillez remplir tous les champs');
      return;
    }
    if (motDePasseSaisi !== confirmationMotDePasse) {
      Alert.alert('Attention', 'Les mots de passe ne sont pas identiques');
      return;
    }
    setEstEnTrainDeCharger(true);
    try {
      await creerCompteUtilisateurAvecEmail(emailSaisi, motDePasseSaisi);
      navigation.goBack();
    } catch (erreur: any) {
      Alert.alert("Échec de l'inscription", erreur.message);
    } finally {
      setEstEnTrainDeCharger(false);
    }
  };

  return (
    <View style={styles.conteneurGlobal}>
      <LinearGradient
        colors={['#222222', COLORS.black]}
        style={styles.degrade}
      />

      <SafeAreaView style={styles.zoneContenu}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.clavierVue}>
          <View style={styles.sectionLogo}>
            <SpotifyLogo size={50} />
            <Text style={styles.titrePage}>Créer un compte</Text>
          </View>

          <View style={styles.formulaire}>
            <View style={styles.blocChamp}>
              <Text style={styles.label}>Quel est votre e-mail ?</Text>
              <TextInput
                style={styles.input}
                value={emailSaisi}
                onChangeText={setEmailSaisi}
                placeholder="etudiant@ict.com"
                placeholderTextColor="#777"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.blocChamp}>
              <Text style={styles.label}>Créez un mot de passe</Text>
              <TextInput
                style={styles.input}
                value={motDePasseSaisi}
                onChangeText={setMotDePasseSaisi}
                secureTextEntry
                placeholder="Au moins 6 caractères"
                placeholderTextColor="#777"
              />
            </View>

            <View style={styles.blocChamp}>
              <Text style={styles.label}>Confirmez le mot de passe</Text>
              <TextInput
                style={styles.input}
                value={confirmationMotDePasse}
                onChangeText={setConfirmationMotDePasse}
                secureTextEntry
                placeholder="Répétez le mot de passe"
                placeholderTextColor="#777"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.boutonInscription,
                estEnTrainDeCharger && {opacity: 0.5},
              ]}
              onPress={gererActionDInscription}
              disabled={estEnTrainDeCharger}>
              <Text style={styles.texteBouton}>CRÉER LE COMPTE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.boutonRetour}
              onPress={() => navigation.goBack()}>
              <Text style={styles.texteRetour}>
                Déjà un compte ? Se connecter
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneurGlobal: {flex: 1, backgroundColor: COLORS.black},
  degrade: {...StyleSheet.absoluteFillObject},
  zoneContenu: {flex: 1},
  clavierVue: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  sectionLogo: {alignItems: 'center', marginBottom: 40},
  titrePage: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  formulaire: {width: '100%'},
  blocChamp: {marginBottom: 20},
  label: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    color: COLORS.white,
    padding: 15,
    borderRadius: 4,
    fontSize: 16,
  },
  boutonInscription: {
    backgroundColor: COLORS.green,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  texteBouton: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  boutonRetour: {marginTop: 20, alignItems: 'center'},
  texteRetour: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default EcranDInscription;
