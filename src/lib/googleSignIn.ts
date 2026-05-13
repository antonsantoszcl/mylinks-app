// Google Identity Services (GIS) helper
// Requires the script https://accounts.google.com/gsi/client to be loaded.
// Uses renderButton + programmatic click (popup) instead of prompt() (One Tap).

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

      // Create temporary hidden container for the rendered button
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      let resolved = false;

      const cleanup = () => {
        try { document.body.removeChild(container); } catch { /* already removed */ }
      };

      const safeResolve = (result: GoogleSignInResult) => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(result);
        }
      };

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: CredentialResponse) => {
          if (response.credential) {
            safeResolve({ type: 'credential', token: response.credential });
          } else {
            safeResolve({ type: 'fallback' });
          }
        },
        cancel_on_tap_outside: false,
      });

      // Render the official Google button in the hidden container
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        size: 'large',
      });

      // Click the rendered button to trigger the Google popup
      setTimeout(() => {
        const btn = container.querySelector('div[role=button]') as HTMLElement | null;
        if (btn) {
          btn.click();
        } else {
          safeResolve({ type: 'fallback' });
        }
      }, 100);

      // Timeout: if no response in 60s, fallback
      setTimeout(() => {
        safeResolve({ type: 'fallback' });
      }, 60000);
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
