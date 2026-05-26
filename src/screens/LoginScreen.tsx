/**
 * Écran de connexion (Login) - Version Premium.
 * Design immersif avec dégradé et logo officiel.
 */
import React, { useState } from 'react';
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
import { COLORS, SPACING } from '../theme/colors';
import { connecterUtilisateurAvecEmail } from '../services/auth';
import SpotifyLogo from '../components/SpotifyLogo';

const EcranDeConnexion = ({ navigation }: any) => {
  const [adresseEmail, setAdresseEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(false);

  const gererActionDeConnexion = async () => {
    if (!adresseEmail || !motDePasse) {
      Alert.alert('Champs vides', 'Veuillez saisir votre email et votre mot de passe');
      return;
    }
    setEstEnTrainDeCharger(true);
    try {
      await connecterUtilisateurAvecEmail(adresseEmail, motDePasse);
    } catch (erreur: any) {
      Alert.alert('Erreur de connexion', erreur.message);
    } finally {
      setEstEnTrainDeCharger(false);
    }
  };

  return (
    <View style={styles.conteneurGlobal}>
      <LinearGradient colors={['#222222', COLORS.black]} style={styles.degrade} />
      
      <SafeAreaView style={styles.zoneContenu}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.clavierVue}
        >
          <View style={styles.sectionLogo}>
            <SpotifyLogo size={80} />
            <Text style={styles.texteSlogan}>Des millions de titres.{"\n"}Gratuit sur Spotify.</Text>
          </View>

          <View style={styles.formulaire}>
            <View style={styles.blocChamp}>
              <Text style={styles.label}>E-mail ou nom d'utilisateur</Text>
              <TextInput
                style={styles.input}
                value={adresseEmail}
                onChangeText={setAdresseEmail}
                placeholder="Ex: etudiant@ict.com"
                placeholderTextColor="#777"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.blocChamp}>
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput
                style={styles.input}
                value={motDePasse}
                onChangeText={setMotDePasse}
                placeholder="Votre mot de passe"
                placeholderTextColor="#777"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.boutonConnexion, estEnTrainDeCharger && { opacity: 0.5 }]}
              onPress={gererActionDeConnexion}
              disabled={estEnTrainDeCharger}
            >
              <Text style={styles.texteBouton}>SE CONNECTER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.boutonInscription}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.texteInscription}>S'INSCRIRE GRATUITEMENT</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneurGlobal: { flex: 1, backgroundColor: COLORS.black },
  degrade: { ...StyleSheet.absoluteFillObject },
  zoneContenu: { flex: 1 },
  clavierVue: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'center' },
  sectionLogo: { alignItems: 'center', marginBottom: 60 },
  texteSlogan: { 
    color: COLORS.white, 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginTop: 20,
    lineHeight: 36 
  },
  formulaire: { width: '100%' },
  blocChamp: { marginBottom: 20 },
  label: { color: COLORS.white, fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  input: { 
    backgroundColor: '#333', 
    color: COLORS.white, 
    padding: 15, 
    borderRadius: 4, 
    fontSize: 16 
  },
  boutonConnexion: { 
    backgroundColor: COLORS.green, 
    padding: 16, 
    borderRadius: 30, 
    alignItems: 'center', 
    marginTop: 20 
  },
  texteBouton: { color: COLORS.black, fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
  boutonInscription: { 
    borderWidth: 1, 
    borderColor: '#777', 
    padding: 14, 
    borderRadius: 30, 
    alignItems: 'center', 
    marginTop: 15 
  },
  texteInscription: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
});

export default EcranDeConnexion;
