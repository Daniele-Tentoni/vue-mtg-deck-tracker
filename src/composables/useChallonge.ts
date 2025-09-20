// src/composables/useChallonge.js
import { supabase } from '@/services/supabaseService';
import { ref } from 'vue';

const user = ref(null);
const challongeUser = ref(null);
const supaUrl = import.meta.env.VITE_SUPABASE_URL;

export function useChallonge() {
  async function loginWithChallonge() {
    const state = crypto.randomUUID();
    localStorage.setItem('state', state);

    const redirectUri = import.meta.env.VITE_CHALLONGE_REDIRECT_URI;
    const clientId = import.meta.env.VITE_CHALLONGE_CLIENT_ID;

    // Link per OAuth2 Challonge
    const authUrl =
      `https://challonge.com/oauth/authorize?` +
      new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'me',
        state,
      });

    window.location.href = authUrl;
  }

  const handleChallongeCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) {
      console.info('No code to verify');
      return;
    }

    const state = params.get('state');
    const localState = localStorage.getItem('state');
    if (!localState || state !== localState) {
      alert("Can't get state from local storage");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      alert('Utente non loggato');
      return;
    }

    console.log('Ready to call supabase');

    try {
      const params = new URLSearchParams();
      params.set('code', code);
      params.set('state', state);
      const res = await fetch(`${supaUrl}/functions/v1/challonge-auth?${params}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const { success, mail, state: returnState } = await res.json();
      if (returnState !== state) {
        console.error('State mismatch');
      }

      if (success) {
        console.log('OK');
        console.log('EMAIL', mail);
      }

      // Rimuovo il code dall’URL
      window.history.replaceState({}, document.title, '/');
    } catch (ex) {
      console.error('Whatt', ex);
    }
  };

  const fetchChallongeUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      alert('Utente non loggato');
      return;
    }

    const enc = encodeURIComponent('/me.json');
    const res = await fetch(`${supaUrl}/functions/v1/challonge-proxy?path=${enc}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();

    if (data) {
      challongeUser.value = data;
    } else {
      console.error("Errore nel recupero dell'utente Challonge:", res);
      challongeUser.value = null;
    }
  };

  return {
    user,
    challongeUser,
    loginWithChallonge,
    handleChallongeCallback,
    fetchChallongeUser,
  };
}
