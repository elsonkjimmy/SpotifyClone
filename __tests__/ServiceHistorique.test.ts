/* eslint-env jest */
/**
 * Tests unitaires pour le service d'historique d'écoute (ServiceHistorique.ts).
 */
import {
  ajouterAHistorique,
  recupererHistorique,
  viderHistorique,
} from '../src/services/ServiceHistorique';
import type {Chanson} from '../src/types';
import {describe, it, expect, beforeEach} from '@jest/globals';

describe('ServiceHistorique', () => {
  beforeEach(() => {
    viderHistorique();
  });

  const chansonA: Chanson = {
    id: 'chanson-a',
    title: 'Chanson A',
    artist: 'Artiste A',
    artwork: 'https://example.com/a.jpg',
    url: 'https://example.com/a.mp3',
  };

  const chansonB: Chanson = {
    id: 'chanson-b',
    title: 'Chanson B',
    artist: 'Artiste B',
    artwork: 'https://example.com/b.jpg',
    url: 'https://example.com/b.mp3',
  };

  it('devrait commencer avec un historique vide', () => {
    expect(recupererHistorique()).toEqual([]);
  });

  it("devrait ajouter une chanson à l'historique", () => {
    ajouterAHistorique(chansonA);
    const historique = recupererHistorique();
    expect(historique.length).toBe(1);
    expect(historique[0]).toEqual(chansonA);
  });

  it('devrait placer la chanson la plus récente en premier', () => {
    ajouterAHistorique(chansonA);
    ajouterAHistorique(chansonB);
    const historique = recupererHistorique();
    expect(historique.length).toBe(2);
    expect(historique[0]).toEqual(chansonB);
    expect(historique[1]).toEqual(chansonA);
  });

  it('devrait éviter les doublons en déplaçant la chanson existante au début', () => {
    ajouterAHistorique(chansonA);
    ajouterAHistorique(chansonB);
    ajouterAHistorique(chansonA); // Ré-écoute de A

    const historique = recupererHistorique();
    expect(historique.length).toBe(2); // Pas de doublon
    expect(historique[0]).toEqual(chansonA); // Devrait être repassée en premier
    expect(historique[1]).toEqual(chansonB);
  });

  it("devrait limiter l'historique à un maximum de 20 éléments", () => {
    // Ajouter 25 chansons différentes
    for (let i = 1; i <= 25; i++) {
      ajouterAHistorique({
        id: `chanson-${i}`,
        title: `Chanson ${i}`,
        artist: 'Artiste',
        artwork: 'artwork.jpg',
        url: 'url.mp3',
      });
    }

    const historique = recupererHistorique();
    expect(historique.length).toBe(20); // Limité à 20
    expect(historique[0].id).toBe('chanson-25'); // La dernière écoutée
    expect(historique[19].id).toBe('chanson-6'); // La plus ancienne conservée (1 à 5 supprimées)
  });

  it("devrait vider l'historique avec viderHistorique()", () => {
    ajouterAHistorique(chansonA);
    ajouterAHistorique(chansonB);
    expect(recupererHistorique().length).toBe(2);

    viderHistorique();
    expect(recupererHistorique()).toEqual([]);
  });
});
