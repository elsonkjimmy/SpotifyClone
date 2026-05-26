/**
 * Écran d'accueil principal de l'application.
 * Affiche les différentes sections de musiques et de playlists.
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING } from '../theme/colors';
import SectionHeader from '../components/SectionHeader';
import ComposantCarteMusique from '../components/ComposantCarteMusique';
import SpotifyLogo from '../components/SpotifyLogo';
import { chargerEtJouerUneListeDeMusiques } from '../services/ServiceLecteurAudio';
import { recupererToutesLesChansons } from '../services/firestore';

const EcranAccueil = ({ navigation }: any) => {
  const [listeDesMusiques, setListeDesMusiques] = useState<any[]>([]);
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(true);
  const animationPulsation = useState(new Animated.Value(0.3))[0];

  useEffect(() => {
    if (estEnTrainDeCharger) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animationPulsation, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(animationPulsation, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [estEnTrainDeCharger]);

  const chargerLesDonneesDepuisFirebase = async () => {
    try {
      const resultat = await recupererToutesLesChansons();
      const musiquesRecuperees = resultat.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setListeDesMusiques(musiquesRecuperees);
    } catch (erreur) {
      console.log('Erreur lors du chargement des musiques:', erreur);
      setListeDesMusiques([
        { id: 's1', title: 'Blinding Lights', artist: 'The Weeknd', artwork: 'https://i.scdn.co/image/ab67616d0000b273b3c3c7e3f8476a66a152331a', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { id: 's2', title: 'Starboy', artist: 'The Weeknd', artwork: 'https://i.scdn.co/image/ab67616d0000b2734718e5b124f7979288e1467a', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
        { id: 's3', title: 'One Dance', artist: 'Drake', artwork: 'https://i.scdn.co/image/ab67616d0000b2739418edfa6d914569485b00c5', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
      ]);
    } finally {
      setTimeout(() => setEstEnTrainDeCharger(false), 1000); // On laisse un peu de temps pour voir l'effet
    }
  };

  useEffect(() => {
    chargerLesDonneesDepuisFirebase();
  }, []);

  const gererLectureMusique = async (musiqueSelectionnee: any) => {
    await chargerEtJouerUneListeDeMusiques([musiqueSelectionnee, ...listeDesMusiques.filter(m => m.id !== musiqueSelectionnee.id)]);
  };

  // Squelette de chargement Premium
  const RenduSqueletteChargement = () => (
    <SafeAreaView style={styles.conteneurPrincipal}>
      <ScrollView padding={SPACING.m}>
        <View style={styles.enteteSquelette}>
          <SpotifyLogo size={40} />
          <View style={styles.ligneFiltresSquelette}>
            {[1, 2, 3].map(i => (
              <Animated.View key={i} style={[styles.piluleSquelette, { opacity: animationPulsation }]} />
            ))}
          </View>
        </View>
        <View style={styles.grilleSquelette}>
          {[1, 2, 3, 4].map(i => (
            <Animated.View key={i} style={[styles.carteRaccourciSquelette, { opacity: animationPulsation }]} />
          ))}
        </View>
        <View style={{ marginTop: 30 }}>
          <Animated.View style={[styles.titreSquelette, { opacity: animationPulsation }]} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map(i => (
              <Animated.View key={i} style={[styles.carteMusiqueSquelette, { opacity: animationPulsation }]} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (estEnTrainDeCharger) return <RenduSqueletteChargement />;

  const RenduRaccourci = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.carteRaccourci} 
      onPress={() => navigation.navigate('PlaylistDetail', { 
        playlist: { nom: item.title, image: item.artwork, createur: 'Playlist • ' + item.artist } 
      })}
    >
      <Image source={{ uri: item.artwork }} style={styles.imageRaccourci} />
      <Text style={styles.titreRaccourci} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.conteneurPrincipal}>
      <LinearGradient colors={['#333333', COLORS.black]} style={styles.degradeFond} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.sectionEnTete}>
            <View style={styles.ligneFiltres}>
              <TouchableOpacity style={styles.piluleActive}><Text style={styles.textePiluleActive}>Tout</Text></TouchableOpacity>
              <TouchableOpacity style={styles.pilule}><Text style={styles.textePilule}>Musique</Text></TouchableOpacity>
              <TouchableOpacity style={styles.pilule}><Text style={styles.textePilule}>Podcasts</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionRaccourcis}>
            <FlatList
              data={listeDesMusiques.slice(0, 6)}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={(item) => 'raccourci-' + item.id}
              renderItem={({ item }) => <RenduRaccourci item={item} />}
            />
          </View>

          <SectionHeader title="Écoutés récemment" />
          <FlatList
            data={listeDesMusiques}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => 'recent-' + item.id}
            contentContainerStyle={styles.listeHorizontale}
            renderItem={({ item }) => (
              <ComposantCarteMusique
                titre={item.title}
                artiste={item.artist}
                urlImage={item.artwork}
                actionAuClic={() => gererLectureMusique(item)}
              />
            )}
          />

          <SectionHeader title="Fait pour vous" />
          <FlatList
            data={[...listeDesMusiques].reverse()}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => 'recommandé-' + item.id}
            contentContainerStyle={styles.listeHorizontale}
            renderItem={({ item }) => (
              <ComposantCarteMusique
                titre={item.title}
                artiste={item.artist}
                urlImage={item.artwork}
                actionAuClic={() => gererLectureMusique(item)}
              />
            )}
          />
          <View style={{ height: 120 }} /> 
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  conteneurPrincipal: { flex: 1, backgroundColor: COLORS.black },
  degradeFond: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  sectionEnTete: { paddingHorizontal: SPACING.m, paddingTop: SPACING.m, marginBottom: SPACING.l },
  ligneFiltres: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  piluleActive: { backgroundColor: COLORS.green, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  textePiluleActive: { color: COLORS.black, fontSize: 13, fontWeight: 'bold' },
  pilule: { backgroundColor: '#2A2A2A', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10 },
  textePilule: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  sectionRaccourcis: { paddingHorizontal: SPACING.m - 4, marginBottom: SPACING.m },
  carteRaccourci: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, margin: 4, height: 56, overflow: 'hidden' },
  imageRaccourci: { width: 56, height: 56 },
  titreRaccourci: { flex: 1, color: COLORS.white, fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8 },
  listeHorizontale: { paddingLeft: SPACING.m },
  // Styles Squelette
  enteteSquelette: { marginBottom: 30 },
  ligneFiltresSquelette: { flexDirection: 'row', marginTop: 20 },
  piluleSquelette: { width: 80, height: 35, borderRadius: 20, backgroundColor: '#333', marginRight: 10 },
  grilleSquelette: { flexDirection: 'row', flexWrap: 'wrap' },
  carteRaccourciSquelette: { width: '47%', height: 56, backgroundColor: '#222', borderRadius: 4, margin: '1.5%' },
  titreSquelette: { width: 150, height: 20, backgroundColor: '#333', borderRadius: 4, marginBottom: 20 },
  carteMusiqueSquelette: { width: 150, height: 150, backgroundColor: '#222', borderRadius: 8, marginRight: 15 },
});

export default EcranAccueil;
