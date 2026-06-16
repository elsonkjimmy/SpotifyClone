/**
 * Écran Mon Compte (Account).
 * Affiche les informations de l'utilisateur ou propose de se connecter.
 */
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import {
  User,
  ChevronRight,
  LogOut,
  ShieldCheck,
  HelpCircle,
  Bell,
  Music,
  Sliders,
  Compass,
} from 'lucide-react-native';
import {useFocusEffect} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SPACING} from '../theme/colors';
import {deconnecterUtilisateur} from '../services/auth';
import SpotifyLogo from '../components/SpotifyLogo';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';
import {recupererHistorique} from '../services/ServiceHistorique';
import {
  recupererToutesLesChansons,
  recupererToutesLesPlaylists,
} from '../services/firestore';
import {
  obtenirModeHorsLigne,
  activerModeHorsLigne,
} from '../services/ServiceTelechargement';

const RenduLigneOption = ({icone: Icone, titre, action}: any) => (
  <TouchableOpacity style={styles.ligneOption} onPress={action}>
    <Icone color={COLORS.white} size={22} />
    <Text style={styles.texteOption}>{titre}</Text>
    <ChevronRight color={COLORS.lightGray} size={20} />
  </TouchableOpacity>
);

const EcranMonCompte = ({navigation}: any) => {
  const {utilisateur, estAdmin} = useAuth();
  const {showToast} = useToast();
  const [modeHorsLigne, setModeHorsLigne] = useState(obtenirModeHorsLigne());
  const [statistiques, setStatistiques] = useState({
    totalEcoutes: 0,
    artistePrefere: 'Aucun',
    genrePrefere: 'Aucun',
  });
  const [statsAdmin, setStatsAdmin] = useState({
    totalChansons: 0,
    totalPlaylists: 0,
    totalCreateurs: 0,
  });

  const chargerLesStatistiques = useCallback(() => {
    const historique = recupererHistorique();
    if (historique.length === 0) {
      setStatistiques({
        totalEcoutes: 0,
        artistePrefere: 'Aucun',
        genrePrefere: 'Aucun',
      });
      return;
    }

    const artistesFreq: {[key: string]: number} = {};
    const genresFreq: {[key: string]: number} = {};

    historique.forEach(chanson => {
      artistesFreq[chanson.artist] = (artistesFreq[chanson.artist] || 0) + 1;
      if (chanson.genre) {
        genresFreq[chanson.genre] = (genresFreq[chanson.genre] || 0) + 1;
      }
    });

    const artistePrefere = Object.keys(artistesFreq).reduce((a, b) =>
      artistesFreq[a] > artistesFreq[b] ? a : b,
    );

    const genrePrefere =
      Object.keys(genresFreq).length > 0
        ? Object.keys(genresFreq).reduce((a, b) =>
            genresFreq[a] > genresFreq[b] ? a : b,
          )
        : 'Varié';

    setStatistiques({
      totalEcoutes: historique.length,
      artistePrefere,
      genrePrefere,
    });
  }, []);

  const chargerLesStatistiquesAdmin = useCallback(async () => {
    try {
      const chansons = await recupererToutesLesChansons();
      const playlists = await recupererToutesLesPlaylists();

      const userIdsUniques = new Set<string>();
      playlists.forEach(p => {
        if (p.userId) {
          userIdsUniques.add(p.userId);
        }
      });

      setStatsAdmin({
        totalChansons: chansons.length,
        totalPlaylists: playlists.length,
        totalCreateurs: userIdsUniques.size,
      });
    } catch (erreur) {
      console.log('Erreur stats admin:', erreur);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      chargerLesStatistiques();
      if (estAdmin) {
        chargerLesStatistiquesAdmin();
      }
      setModeHorsLigne(obtenirModeHorsLigne());
    }, [chargerLesStatistiques, chargerLesStatistiquesAdmin, estAdmin]),
  );

  const gererBasculeHorsLigne = (valeur: boolean) => {
    activerModeHorsLigne(valeur);
    setModeHorsLigne(valeur);
    showToast(valeur ? 'Mode hors-ligne activé' : 'Mode en ligne activé', 'success');
  };

  return (
    <View style={styles.conteneurPrincipal}>
      <LinearGradient
        colors={['#2c0c1e', '#12040c', COLORS.black]}
        style={styles.degradeFond}
      />
      <SafeAreaView style={styles.zoneSafe}>
        <View style={styles.entetePremium}>
          <View style={styles.ligneUtilisateur}>
            <View style={styles.avatarCercleSmall}>
              <Text style={styles.texteAvatarSmall}>
                {utilisateur?.email?.charAt(0).toUpperCase() || 'G'}
              </Text>
            </View>
            <Text style={styles.titrePagePremium}>Mon compte</Text>
            
            <View style={styles.iconesAction}>
              <TouchableOpacity 
                style={styles.boutonIcone}
                onPress={() => showToast('Aucune nouvelle notification')}
              >
                <Bell color={COLORS.white} size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.boutonIcone} onPress={() => deconnecterUtilisateur()}>
                <LogOut color={COLORS.white} size={22} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.zoneScroll}>
          <View style={styles.sectionProfil}>
            <View style={styles.infosUtilisateur}>
              <Text style={styles.nomUtilisateur}>
                {utilisateur ? utilisateur.email?.split('@')[0] : 'Invité'}
              </Text>
              {estAdmin && (
                <Text style={styles.badgeAdmin}>Administrateur</Text>
              )}
              <TouchableOpacity
                onPress={() => !utilisateur && navigation.navigate('Login')}>
                <Text style={styles.lienProfil}>
                  {utilisateur
                    ? 'Compte connecté'
                    : 'Se connecter pour plus de fonctionnalités'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rétrospective / Statistiques de Session (Spotify Wrapped) */}
          {utilisateur && (
            <View style={styles.carteWrapped}>
              <LinearGradient
                colors={[
                  'rgba(132, 32, 230, 0.45)',
                  'rgba(81, 12, 156, 0.25)',
                  'rgba(18, 18, 18, 0.75)',
                ]}
                style={styles.degradeWrapped}>
                <Text style={styles.titreWrapped}>Votre Rétrospective ⚡</Text>
                <Text style={styles.descriptionWrapped}>
                  Statistiques d'écoute calculées pour la session en cours.
                </Text>

                {statistiques.totalEcoutes > 0 ? (
                  <View style={styles.grilleStats}>
                    <View style={styles.caseStat}>
                      <Music color={COLORS.green} size={22} />
                      <Text style={styles.valeurStat}>
                        {statistiques.totalEcoutes}
                      </Text>
                      <Text style={styles.labelStat}>Morceaux</Text>
                    </View>
                    <View style={styles.caseStat}>
                      <User color={COLORS.green} size={22} />
                      <Text style={styles.valeurStat} numberOfLines={1}>
                        {statistiques.artistePrefere}
                      </Text>
                      <Text style={styles.labelStat}>Top Artiste</Text>
                    </View>
                    <View style={styles.caseStat}>
                      <Compass color={COLORS.green} size={22} />
                      <Text style={styles.valeurStat} numberOfLines={1}>
                        {statistiques.genrePrefere}
                      </Text>
                      <Text style={styles.labelStat}>Top Genre</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.texteVideWrapped}>
                    Écoutez des morceaux pour générer votre premier Wrapped de
                    session !
                  </Text>
                )}
              </LinearGradient>
            </View>
          )}

          {/* Tableau de bord Administrateur (Admin uniquement) */}
          {estAdmin && (
            <View style={styles.carteAdminDashboard}>
              <LinearGradient
                colors={[
                  'rgba(12, 128, 64, 0.45)',
                  'rgba(6, 80, 32, 0.25)',
                  'rgba(18, 18, 18, 0.75)',
                ]}
                style={styles.degradeWrapped}>
                <Text style={styles.titreWrapped}>
                  Console Administrateur ⚙️
                </Text>
                <Text style={styles.descriptionWrapped}>
                  Statistiques globales de la base de données Firestore.
                </Text>

                <View style={styles.grilleStats}>
                  <View style={styles.caseStat}>
                    <Music color={COLORS.green} size={22} />
                    <Text style={styles.valeurStat}>
                      {statsAdmin.totalChansons}
                    </Text>
                    <Text style={styles.labelStat}>Titres En Ligne</Text>
                  </View>
                  <View style={styles.caseStat}>
                    <Sliders color={COLORS.green} size={22} />
                    <Text style={styles.valeurStat}>
                      {statsAdmin.totalPlaylists}
                    </Text>
                    <Text style={styles.labelStat}>Playlists</Text>
                  </View>
                  <View style={styles.caseStat}>
                    <User color={COLORS.green} size={22} />
                    <Text style={styles.valeurStat}>
                      {statsAdmin.totalCreateurs}
                    </Text>
                    <Text style={styles.labelStat}>Actifs</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          <View style={styles.groupeOptions}>
            <Text style={styles.titreGroupe}>Compte</Text>
            <View style={styles.ligneOption}>
              <Compass color={COLORS.white} size={22} />
              <Text style={styles.texteOption}>Mode Hors-ligne</Text>
              <Switch
                value={modeHorsLigne}
                onValueChange={gererBasculeHorsLigne}
                trackColor={{false: '#767577', true: COLORS.green}}
                thumbColor={modeHorsLigne ? COLORS.white : '#f4f3f4'}
              />
            </View>
            <RenduLigneOption 
              icone={Bell} 
              titre="Notifications" 
              action={() => showToast('Gérez vos notifications')} 
            />
            <RenduLigneOption 
              icone={ShieldCheck} 
              titre="Sécurité" 
              action={() => showToast('Paramètres de sécurité')} 
            />
            <RenduLigneOption 
              icone={HelpCircle} 
              titre="Aide" 
              action={() => showToast('Centre d\'assistance')} 
            />
          </View>

          <View style={styles.groupeOptions}>
            <Text style={styles.titreGroupe}>À propos</Text>
            <View style={styles.carteAPropos}>
              <Text style={styles.texteAPropos}>
                Spotify Clone est un projet pédagogique réalisé dans le cadre du
                TP Mobile ICTL2. Il utilise React Native, Firebase et une
                architecture moderne pour simuler une expérience de streaming
                musicale complète.
              </Text>
              <Text style={styles.devTag}>Développé avec ❤️ par Groupe 4</Text>
            </View>
            <RenduLigneOption 
              icone={ShieldCheck} 
              titre="Conditions d'utilisation" 
              action={() => showToast('Mentions légales')} 
            />
            <RenduLigneOption 
              icone={Sliders} 
              titre="Paramètres de confidentialité" 
              action={() => showToast('Données personnelles')} 
            />
          </View>

          <View style={styles.sectionActions}>
            {utilisateur ? (
              <TouchableOpacity
                style={styles.boutonDeconnexion}
                onPress={() => deconnecterUtilisateur()}>
                <LogOut
                  color={COLORS.white}
                  size={20}
                  style={styles.iconeDeconnexion}
                />
                <Text style={styles.texteDeconnexion}>Se déconnecter</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.boutonConnexion}
                onPress={() => navigation.navigate('Login')}>
                <Text style={styles.texteBoutonConnexion}>SE CONNECTER</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.sectionLogoBas}>
            <SpotifyLogo
              size={30}
              showWordmark
              wordmarkColor={COLORS.lightGray}
            />
            <Text style={styles.versionApp}>Version 1.0.0 (TP Mobile)</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: {flex: 1, backgroundColor: COLORS.black},
  zoneSafe: {flex: 1},
  degradeFond: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  entetePremium: {
    paddingTop: SPACING.m,
    paddingHorizontal: SPACING.m,
    marginBottom: 0,
  },
  ligneUtilisateur: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarCercleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F57C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  texteAvatarSmall: {color: COLORS.black, fontWeight: 'bold', fontSize: 14},
  titrePagePremium: {fontSize: 22, fontWeight: 'bold', color: COLORS.white, flex: 1},
  iconesAction: {flexDirection: 'row', alignItems: 'center'},
  boutonIcone: {marginLeft: 20},
  zoneScroll: {padding: SPACING.l},
  sectionProfil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 30,
    paddingHorizontal: SPACING.s,
  },
  infosUtilisateur: {marginLeft: 0},
  nomUtilisateur: {color: COLORS.white, fontSize: 24, fontWeight: 'bold'},
  badgeAdmin: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  lienProfil: {color: COLORS.lightGray, fontSize: 13, marginTop: 4},
  groupeOptions: {marginBottom: 40},
  titreGroupe: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ligneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Aspect capsule vitrée
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 10,
  },
  texteOption: {
    color: COLORS.white,
    fontSize: 15,
    flex: 1,
    marginLeft: 15,
    fontWeight: '500',
  },
  sectionActions: {alignItems: 'center'},
  boutonDeconnexion: {flexDirection: 'row', alignItems: 'center', padding: 15},
  iconeDeconnexion: {marginRight: 10},
  texteDeconnexion: {color: COLORS.white, fontWeight: 'bold', fontSize: 14},
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
  sectionLogoBas: {alignItems: 'center', marginTop: 60, opacity: 0.5},
  versionApp: {color: COLORS.lightGray, fontSize: 11, marginTop: 10},
  carteWrapped: {
    marginHorizontal: SPACING.m,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Bordure effet verre
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  degradeWrapped: {
    padding: SPACING.l,
  },
  titreWrapped: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  descriptionWrapped: {
    color: COLORS.lightGray,
    fontSize: 12,
    marginBottom: 20,
  },
  grilleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  caseStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  valeurStat: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    width: '100%',
  },
  labelStat: {
    color: COLORS.lightGray,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  texteVideWrapped: {
    color: COLORS.lightGray,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  carteAdminDashboard: {
    marginHorizontal: SPACING.m,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Bordure effet verre
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  carteAPropos: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  texteAPropos: {
    color: COLORS.lightGray,
    fontSize: 13,
    lineHeight: 20,
  },
  devTag: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'right',
  },
});

export default EcranMonCompte;
