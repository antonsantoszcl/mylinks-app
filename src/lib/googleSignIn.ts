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
        };
      };
    };
  }
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: CredentialResponse) => void;
  cancel_on_tap_outside?: boolean;
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

export function signInWithGoogle(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Ambiente não suportado.'));
      return;
    }

    const tryInit = () => {
      if (!window.google?.accounts?.id) {
        reject(new Error('Google Identity Services não carregado.'));
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: CredentialResponse) => {
          if (response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error(response.error ?? 'Erro no Google Sign-In'));
          }
        },
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.prompt((notification: PromptMomentNotification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          reject(
            new Error(
              `Google Sign-In não pôde ser exibido: ${
                notification.isNotDisplayed()
                  ? notification.getNotDisplayedReason()
                  : notification.getSkippedReason()
              }`
            )
          );
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
          reject(new Error('Timeout aguardando Google Identity Services.'));
        }
      }, 100);
    }
  });
}
