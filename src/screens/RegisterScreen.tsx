/**
 * Écran d'inscription (Register).
 * Permet à un nouvel utilisateur de créer son compte.
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
import { creerCompteUtilisateurAvecEmail } from '../services/auth';

const EcranDInscription = ({ navigation }: any) => {
  // États pour stocker les informations du nouvel utilisateur
  const [emailSaisi, setEmailSaisi] = useState('');
  const [motDePasseSaisi, setMotDePasseSaisi] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(false);

  // Fonction pour valider les données et créer le compte dans Firebase
  const gererActionDInscription = async () => {
    if (!emailSaisi || !motDePasseSaisi || !confirmationMotDePasse) {
      Alert.alert('Champs incomplets', 'Veuillez remplir tous les champs du formulaire');
      return;
    }

    if (motDePasseSaisi !== confirmationMotDePasse) {
      Alert.alert('Attention', 'Les deux mots de passe ne sont pas identiques');
      return;
    }

    setEstEnTrainDeCharger(true);
    try {
      // Appel au service pour créer le compte
      await creerCompteUtilisateurAvecEmail(emailSaisi, motDePasseSaisi);
      Alert.alert('Succès', 'Votre compte a été créé ! Connectez-vous maintenant.');
      navigation.navigate('Login');
    } catch (erreur: any) {
      Alert.alert("Échec de l'inscription", erreur.message);
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
        <View style={styles.entete}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.boutonRetour}>
            <Text style={styles.flecheRetour}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titrePage}>Créer un compte</Text>
        </View>

        <View style={styles.formulaire}>
          <Text style={styles.labelChamp}>Quel est votre e-mail ?</Text>
          <TextInput
            style={styles.champSaisie}
            value={emailSaisi}
            onChangeText={setEmailSaisi}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="etudiant@ict.com"
            placeholderTextColor={COLORS.lightGray}
          />

          <Text style={styles.labelChamp}>Créez un mot de passe</Text>
          <TextInput
            style={styles.champSaisie}
            value={motDePasseSaisi}
            onChangeText={setMotDePasseSaisi}
            secureTextEntry
            placeholder="Au moins 6 caractères"
            placeholderTextColor={COLORS.lightGray}
          />

          <Text style={styles.labelChamp}>Confirmez le mot de passe</Text>
          <TextInput
            style={styles.champSaisie}
            value={confirmationMotDePasse}
            onChangeText={setConfirmationMotDePasse}
            secureTextEntry
            placeholder="Répétez le mot de passe"
            placeholderTextColor={COLORS.lightGray}
          />

          <TouchableOpacity
            style={[styles.boutonInscriptionVert, estEnTrainDeCharger && { opacity: 0.7 }]}
            onPress={gererActionDInscription}
            disabled={estEnTrainDeCharger}
          >
            <Text style={styles.texteBoutonInscription}>
              {estEnTrainDeCharger ? 'Création en cours...' : "S'inscrire"}
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
  },
  entete: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  boutonRetour: {
    padding: 10,
    marginLeft: -10,
  },
  flecheRetour: {
    color: COLORS.white,
    fontSize: 28,
  },
  titrePage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 10,
  },
  formulaire: {
    flex: 1,
  },
  labelChamp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.s,
  },
  champSaisie: {
    backgroundColor: COLORS.cardBackground,
    color: COLORS.white,
    padding: SPACING.m,
    borderRadius: 5,
    marginBottom: SPACING.xl,
    fontSize: 16,
  },
  boutonInscriptionVert: {
    backgroundColor: COLORS.green,
    padding: SPACING.m,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  texteBoutonInscription: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EcranDInscription;
