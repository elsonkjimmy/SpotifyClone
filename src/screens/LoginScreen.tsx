/**
 * Écran de connexion (Login).
 * Permet à l'utilisateur d'accéder à son compte Spotify Clone.
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
import { COLORS, SPACING } from '../theme/colors';
import { connecterUtilisateurAvecEmail } from '../services/auth';

const EcranDeConnexion = ({ navigation }: any) => {
  // États pour stocker les informations saisies par l'utilisateur
  const [adresseEmail, setAdresseEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(false);

  // Fonction déclenchée quand l'utilisateur appuie sur le bouton "Se connecter"
  const gererActionDeConnexion = async () => {
    if (!adresseEmail || !motDePasse) {
      Alert.alert('Champs vides', 'Veuillez saisir votre email et votre mot de passe');
      return;
    }

    setEstEnTrainDeCharger(true);
    try {
      // Appel au service Firebase pour vérifier les identifiants
      await connecterUtilisateurAvecEmail(adresseEmail, motDePasse);
    } catch (erreur: any) {
      Alert.alert('Erreur de connexion', erreur.message);
    } finally {
      setEstEnTrainDeCharger(false);
    }
  };

  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.conteneurInterne}
      >
        <View style={styles.sectionLogo}>
          <View style={styles.rondLogoVert}>
            <Text style={styles.iconeMusique}>🎵</Text>
          </View>
          <Text style={styles.texteSpotify}>Spotify</Text>
        </View>

        <View style={styles.sectionFormulaire}>
          <Text style={styles.labelChamp}>E-mail ou nom d'utilisateur</Text>
          <TextInput
            style={styles.champSaisie}
            value={adresseEmail}
            onChangeText={setAdresseEmail}
            placeholder="Ex: etudiant@ict.com"
            placeholderTextColor={COLORS.lightGray}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.labelChamp}>Mot de passe</Text>
          <TextInput
            style={styles.champSaisie}
            value={motDePasse}
            onChangeText={setMotDePasse}
            placeholder="Votre mot de passe"
            placeholderTextColor={COLORS.lightGray}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.boutonConnexionVert, estEnTrainDeCharger && { opacity: 0.7 }]}
            onPress={gererActionDeConnexion}
            disabled={estEnTrainDeCharger}
          >
            <Text style={styles.texteBoutonConnexion}>
              {estEnTrainDeCharger ? 'Vérification...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.lienVersInscription}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.texteLien}>
              Pas de compte ? <Text style={styles.texteSInscrire}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  conteneurInterne: {
    flex: 1,
    padding: SPACING.l,
    justifyContent: 'center',
  },
  sectionLogo: {
    alignItems: 'center',
    marginBottom: 50,
  },
  rondLogoVert: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconeMusique: {
    fontSize: 40,
  },
  texteSpotify: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  sectionFormulaire: {
    width: '100%',
  },
  labelChamp: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.s,
  },
  champSaisie: {
    backgroundColor: COLORS.cardBackground,
    color: COLORS.white,
    padding: SPACING.m,
    borderRadius: 5,
    marginBottom: SPACING.l,
    fontSize: 16,
  },
  boutonConnexionVert: {
    backgroundColor: COLORS.green,
    padding: SPACING.m,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: SPACING.m,
  },
  texteBoutonConnexion: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: 'bold',
  },
  lienVersInscription: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  texteLien: {
    color: COLORS.white,
    fontSize: 14,
  },
  texteSInscrire: {
    color: COLORS.green,
    fontWeight: 'bold',
  },
});

export default EcranDeConnexion;
