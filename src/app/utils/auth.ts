import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { apiPost, apiPut } from './api';
import { UserProfile } from '../types/user';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

export const auth = {
  async signInWithGoogle() {
    try {
      const redirectTo = new URL(import.meta.env.BASE_URL, window.location.origin).toString();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  async signUp(email: string, password: string, username: string) {
    try {
      // Use Supabase's built-in signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) {
        throw error;
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data.session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  async getAccessToken() {
    const session = await this.getSession();
    return session?.access_token ?? null;
  },

  async getProfile(accessToken: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f7f41c6/profile`,
        {
          headers: {
            apikey: publicAnonKey,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  },

  async updateProfile(profile: UserProfile): Promise<UserProfile | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return null;
      }
      return apiPut<UserProfile>('/profile', profile, accessToken);
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  },

  async recordGamePlay(gameId: number, gameName: string): Promise<UserProfile | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return null;
      }
      return apiPost<UserProfile>('/profile/play', { gameId, gameName }, accessToken);
    } catch (error) {
      console.error('Record game play error:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
};
