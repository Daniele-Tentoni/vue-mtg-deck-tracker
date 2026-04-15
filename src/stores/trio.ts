import type { Decklist } from '@/services/cardService';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTrioStore = defineStore('trio', () => {
  const loading = ref(false);
  const urls = ref<string[]>([]);

  const saved = localStorage.getItem('trio-deck-urls');
  if (saved) {
    urls.value = JSON.parse(saved);
  }

  const decks = ref<Decklist[]>([]);

  async function downloadDeck(link: string) {
    const deckId = link.split('/').pop();
    const apiUrl = `https://api.moxfield.com/v2/decks/${deckId}`;
    try {
      loading.value = true;
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'PostmanRuntime/7.31.1',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Errore nel recupero del mazzo: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore nel recupero del mazzo:', error);
    } finally {
      loading.value = false;
    }
  }

  urls.value.forEach(async (url) => {
    const deck = await downloadDeck(url);
    decks.value.push({ main: deck.mainboard, side: deck.sideboard });
  });

  async function addUrl(url: string): Promise<Decklist | undefined> {
    if (!urls.value.includes(url)) {
      urls.value.push(url);
      const moxfieldDeck = await downloadDeck(url);
      const deck = { main: moxfieldDeck.mainboard, side: moxfieldDeck.sideboard };
      decks.value.push(deck);
      return deck;
    }
  }

  return { addUrl, decks };
});
