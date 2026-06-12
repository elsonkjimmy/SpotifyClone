/**
 * Écran de connexion (Login) - Version Premium.
 * Design immersif avec dégradé et logo officiel.
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
import {
  connecterUtilisateurAvecEmail,
  connecterUtilisateurAvecGitHub,
  connecterUtilisateurAvecGoogle,
} from '../services/auth';
import SpotifyLogo from '../components/SpotifyLogo';
import Svg, {Path} from 'react-native-svg';

// Icône GitHub personnalisée dessinée en SVG
const IconeGitHubCustom = ({
  color,
  size,
  style,
}: {
  color: string;
  size: number;
  style?: any;
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}>
    <Path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </Svg>
);

// Icône Google personnalisée dessinée en SVG aux couleurs officielles
const IconeGoogleCustom = ({size, style}: {size: number; style?: any}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

const EcranDeConnexion = ({navigation}: any) => {
  const [adresseEmail, setAdresseEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(false);

  const gererActionDeConnexion = async () => {
    if (!adresseEmail || !motDePasse) {
      Alert.alert(
        'Champs vides',
        'Veuillez saisir votre email et votre mot de passe',
      );
      return;
    }
    setEstEnTrainDeCharger(true);
    try {
      await connecterUtilisateurAvecEmail(adresseEmail, motDePasse);
      navigation.goBack();
    } catch (erreur: any) {
      Alert.alert('Erreur de connexion', erreur.message);
    } finally {
      setEstEnTrainDeCharger(false);
    }
  };

  const gererConnexionGitHub = async () => {
    setEstEnTrainDeCharger(true);
    try {
      await connecterUtilisateurAvecGitHub();
      navigation.goBack();
    } catch (erreur: any) {
      Alert.alert('Erreur de connexion GitHub', erreur.message);
    } finally {
      setEstEnTrainDeCharger(false);
    }
  };

  const gererConnexionGoogle = async () => {
    setEstEnTrainDeCharger(true);
    try {
      await connecterUtilisateurAvecGoogle();
      navigation.goBack();
    } catch (erreur: any) {
      Alert.alert('Erreur de connexion Google', erreur.message);
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
            <SpotifyLogo size={80} />
            <Text style={styles.texteSlogan}>
              Des millions de titres.{'\n'}Gratuit sur Spotify.
            </Text>
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
              style={[
                styles.boutonConnexion,
                estEnTrainDeCharger && styles.boutonDesactive,
              ]}
              onPress={gererActionDeConnexion}
              disabled={estEnTrainDeCharger}>
              <Text style={styles.texteBouton}>SE CONNECTER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.boutonGitHub,
                estEnTrainDeCharger && styles.boutonDesactive,
              ]}
              onPress={gererConnexionGitHub}
              disabled={estEnTrainDeCharger}>
              <IconeGitHubCustom
                color={COLORS.white}
                size={20}
                style={styles.iconeGitHub}
              />
              <Text style={styles.texteBoutonGitHub}>
                CONTINUER AVEC GITHUB
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.boutonGoogle,
                estEnTrainDeCharger && styles.boutonDesactive,
              ]}
              onPress={gererConnexionGoogle}
              disabled={estEnTrainDeCharger}>
              <IconeGoogleCustom size={20} style={styles.iconeGoogle} />
              <Text style={styles.texteBoutonGoogle}>
                CONTINUER AVEC GOOGLE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.boutonInscription}
              onPress={() => navigation.navigate('Register')}>
              <Text style={styles.texteInscription}>
                S'INSCRIRE GRATUITEMENT
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
  sectionLogo: {alignItems: 'center', marginBottom: 60},
  texteSlogan: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 36,
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
  boutonConnexion: {
    backgroundColor: COLORS.green,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  boutonDesactive: {
    opacity: 0.5,
  },
  texteBouton: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  boutonGitHub: {
    flexDirection: 'row',
    backgroundColor: '#24292e',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  texteBoutonGitHub: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  iconeGitHub: {
    marginRight: 10,
  },
  boutonGoogle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  texteBoutonGoogle: {
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  iconeGoogle: {
    marginRight: 10,
  },
  boutonInscription: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15,
  },
  texteInscription: {color: COLORS.white, fontWeight: 'bold', fontSize: 13},
});

export default EcranDeConnexion;
