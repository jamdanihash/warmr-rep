import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create Supabase client with retry wrapper
const createClientWithRetry = () => {
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey);

  // Handle auth state changes
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      // Successfully refreshed token
      console.debug('Auth token refreshed');
    } else if (event === 'SIGNED_OUT') {
      // Clear any cached data or state
      console.debug('User signed out');
    }
  });

  // Wrap auth operations with retry and error handling
  const originalAuthRequest = client.auth.request;
  client.auth.request = async (...args) => {
    let lastError;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const response = await originalAuthRequest.apply(client.auth, args);
        return response;
      } catch (error: any) {
        lastError = error;
        
        // Handle auth errors
        if (error?.status === 400 && error?.message?.includes('refresh_token_not_found')) {
          // Clear the invalid session
          await client.auth.signOut();
          // Redirect to sign in if needed
          if (window.location.pathname !== '/sign-in') {
            window.location.href = '/sign-in';
          }
          break;
        }
        
        if (i < MAX_RETRIES - 1) {
          await delay(RETRY_DELAY * Math.pow(2, i)); // Exponential backoff
        }
      }
    }
    throw lastError;
  };

  // Add retry logic to all database operations
  const wrapWithRetry = (operation: Function) => {
    return async (...args: any[]) => {
      let lastError;
      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          const result = await operation(...args);
          if (result.error) {
            // Handle 406 responses by returning null for single() queries
            if (result.error.status === 406) {
              return { data: null, error: null };
            }
            throw result.error;
          }
          return result;
        } catch (error: any) {
          lastError = error;
          
          // Handle auth errors in data operations
          if (error?.status === 401 || (error?.message && error.message.includes('JWT'))) {
            await client.auth.signOut();
            if (window.location.pathname !== '/sign-in') {
              window.location.href = '/sign-in';
            }
            break;
          }
          
          if (i < MAX_RETRIES - 1) {
            if (error instanceof Error && error.message.includes('Failed to fetch')) {
              await delay(RETRY_DELAY * Math.pow(2, i)); // Exponential backoff
              continue;
            }
          }
          return { data: null, error: lastError };
        }
      }
      return { data: null, error: lastError };
    };
  };

  // Wrap all database operations
  const originalFrom = client.from.bind(client);
  client.from = (table: string) => {
    const builder = originalFrom(table);
    const methods = ['select', 'insert', 'update', 'delete', 'upsert'];
    
    methods.forEach(method => {
      const original = builder[method].bind(builder);
      builder[method] = (...args: any[]) => {
        const result = original(...args);
        const originalThen = result.then.bind(result);
        result.then = wrapWithRetry(originalThen);
        return result;
      };
    });
    
    return builder;
  };

  return client;
};

export const supabase = createClientWithRetry();