// Google Identity Services (GIS) helper
// Requires the script https://accounts.google.com/gsi/client to be loaded.

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
          cancel: () => void;
          renderButton: (parent: HTMLElement, options: ButtonOptions) => void;
        };
      };
    };
  }
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  cancel_on_tap_outside?: boolean;
  ux_mode?: 'popup' | 'redirect';
  auto_select?: boolean;
}

interface CredentialResponse {
  credential?: string;
  error?: string;
}

interface PromptMomentNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
}

interface ButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  width?: number;
}

// Result type: 'credential' means we got a token, 'fallback' means GIS failed and caller should use signInWithOAuth
export type GoogleSignInResult =
  | { type: 'credential'; token: string }
  | { type: 'fallback' };

export function signInWithGoogle(clientId: string): Promise<GoogleSignInResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ type: 'fallback' });
      return;
    }

    const tryInit = () => {
      if (!window.google?.accounts?.id) {
        resolve({ type: 'fallback' });
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: CredentialResponse) => {
          if (response.credential) {
            resolve({ type: 'credential', token: response.credential });
          } else {
            // Credential failed — fallback to OAuth redirect
            resolve({ type: 'fallback' });
          }
        },
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification: PromptMomentNotification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // One Tap not available — fallback to OAuth redirect
          resolve({ type: 'fallback' });
        }
      });
    };

    // GIS script may still be loading — retry up to 3s
    if (window.google?.accounts?.id) {
      tryInit();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          tryInit();
        } else if (attempts >= 30) {
          clearInterval(interval);
          // Script didn't load — fallback to OAuth redirect
          resolve({ type: 'fallback' });
        }
      }, 100);
    }
  });
}
