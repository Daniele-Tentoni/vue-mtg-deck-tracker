// src/composables/useChallonge.js
import { supabase } from '@/services/supabaseService';
import { ref } from 'vue';

const supaUrl = import.meta.env.VITE_SUPABASE_URL;

export type ChallongeResponse<T> = {
  data: ChallongeBaseModel<T>[];
};
export type ChallongeBaseModel<T> = {
  id: string;
  type: string;
  attributes: T;
};
export type ChallongeUser = {
  email: string;
  username: string;
  image_url: string;
};
export type ChallongeTournament = {
  tournament_type: string;
  url: string;
  name: string;
  state: string;
  private: boolean;
  description: string;
  game_name: string;
  full_challonge_url: string;
  live_image_url: string;
  sign_up_url?: string;
  participants_count: number;
  teams: boolean;
  // min_team_size: any;
  // max_team_size: any;
  progress_meter: number;
  decorated_tournament_type: string;
  starts_at?: string;
  // notifications: Notifications;
  // match_options: MatchOptions;
  registration_options: RegistrationOptions;
  // seeding_options: SeedingOptions;
  // swiss_options?: SwissOptions;
  // station_options: StationOptions;
  group_stage_enabled: boolean;
  // timestamps: Timestamps;
  // miles_from_zip: any;
  // kilometers_from_zip: any;
};
export interface RegistrationOptions {
  open_signup: boolean
  signup_cap?: number
  check_in_duration?: number
}

export function useChallonge() {
  const error = ref<Error | null>(null);
  const loading = ref(false);
  const challongeUser = ref<ChallongeBaseModel<ChallongeUser>>();

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
        scope: 'me tournaments:read tournaments:write',
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

  /**
   * Special function to call Challonge API via Supabase Edge Function proxy.
   *
   * @param path API path, es: /tournaments.json
   * @param init Custom parameters for fetch
   * @returns Object returned by Challonge API
   */
  async function call(path: string, init?: RequestInit) {
    error.value = null;

    const encoded = encodeURIComponent(path);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      alert('Utente non loggato');
      return;
    }

    try {
      loading.value = true;
      const res = await fetch(`${supaUrl}/functions/v1/challonge-proxy?path=${encoded}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } finally {
      loading.value = false;
    }
  }

  const fetchChallongeUser = async () => {
    const { data } = await call('/me.json');

    if (data) {
      challongeUser.value = data;
    } else {
      console.error("Errore nel recupero dell'utente Challonge");
      challongeUser.value = undefined;
    }
  };

  async function fetchTournaments() {
    try {
      loading.value = true;
      const { data }: { data: ChallongeBaseModel<ChallongeTournament>[] } =
        await call('/tournaments.json');
      return data;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    challongeUser,
    loginWithChallonge,
    handleChallongeCallback,
    fetchChallongeUser,
    fetchTournaments,
  };
}
