/**
 * Écran Mon Compte (Account).
 * Affiche les informations de l'utilisateur ou propose de se connecter.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { User, ChevronRight, LogOut, ShieldCheck, HelpCircle, Bell } from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { deconnecterUtilisateur } from '../services/auth';
import auth from '@react-native-firebase/auth';
import SpotifyLogo from '../components/SpotifyLogo';

const EcranMonCompte = ({ navigation }: any) => {
  const utilisateurActuel = auth().currentUser;

  const RenduLigneOption = ({ icone: Icone, titre, action }: any) => (
    <TouchableOpacity style={styles.ligneOption} onPress={action}>
      <Icone color={COLORS.white} size={22} />
      <Text style={styles.texteOption}>{titre}</Text>
      <ChevronRight color={COLORS.lightGray} size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.conteneurPrincipal}>
      <ScrollView contentContainerStyle={styles.zoneScroll}>
        
        {/* En-tête de profil */}
        <View style={styles.sectionProfil}>
          <View style={styles.avatarCercle}>
            {utilisateurActuel ? (
              <Text style={styles.lettreAvatar}>
                {utilisateurActuel.email?.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <User color={COLORS.black} size={40} />
            )}
          </View>
          
          <View style={styles.infosUtilisateur}>
            <Text style={styles.nomUtilisateur}>
              {utilisateurActuel ? utilisateurActuel.email?.split('@')[0] : 'Invité'}
            </Text>
            <TouchableOpacity onPress={() => !utilisateurActuel && navigation.navigate('Login')}>
              <Text style={styles.lienProfil}>
                {utilisateurActuel ? 'Voir le profil' : 'Se connecter pour plus de fonctionnalités'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Compte */}
        <View style={styles.groupeOptions}>
          <Text style={styles.titreGroupe}>Compte</Text>
          <RenduLigneOption icone={Bell} titre="Notifications" />
          <RenduLigneOption icone={ShieldCheck} titre="Sécurité" />
          <RenduLigneOption icone={HelpCircle} titre="Aide" />
        </View>

        {/* Boutons d'Action */}
        <View style={styles.sectionActions}>
          {utilisateurActuel ? (
            <TouchableOpacity style={styles.boutonDeconnexion} onPress={() => deconnecterUtilisateur()}>
              <LogOut color={COLORS.white} size={20} style={{ marginRight: 10 }} />
              <Text style={styles.texteDeconnexion}>Se déconnecter</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.boutonConnexion} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.texteBoutonConnexion}>SE CONNECTER</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionLogoBas}>
          <SpotifyLogo size={30} showWordmark wordmarkColor={COLORS.lightGray} />
          <Text style={styles.versionApp}>Version 1.0.0 (TP Mobile)</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  zoneScroll: {
    padding: SPACING.l,
  },
  sectionProfil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  avatarCercle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lettreAvatar: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  infosUtilisateur: {
    marginLeft: SPACING.m,
  },
  nomUtilisateur: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  lienProfil: {
    color: COLORS.lightGray,
    fontSize: 13,
    marginTop: 4,
  },
  groupeOptions: {
    marginBottom: 40,
  },
  titreGroupe: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ligneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  texteOption: {
    color: COLORS.white,
    fontSize: 15,
    flex: 1,
    marginLeft: 15,
    fontWeight: '500',
  },
  sectionActions: {
    alignItems: 'center',
  },
  boutonDeconnexion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  texteDeconnexion: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  boutonConnexion: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  texteBoutonConnexion: {
    color: COLORS.black,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionLogoBas: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.5,
  },
  versionApp: {
    color: COLORS.lightGray,
    fontSize: 11,
    marginTop: 10,
  },
});

export default EcranMonCompte;
