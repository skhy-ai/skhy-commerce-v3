export const safeStorage = {
    local: {
        getItem: (key: string): string | null => {
            try {
                return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
            } catch (e) {
                console.warn(`[safeStorage] Failed to access localStorage getItem for key: ${key}`, e);
                return null;
            }
        },
        setItem: (key: string, value: string): void => {
            try {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, value);
                }
            } catch (e) {
                console.warn(`[safeStorage] Failed to access localStorage setItem for key: ${key}`, e);
            }
        },
        removeItem: (key: string): void => {
            try {
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem(key);
                }
            } catch (e) {
                console.warn(`[safeStorage] Failed to access localStorage removeItem for key: ${key}`, e);
            }
        }
    },
    session: {
        getItem: (key: string): string | null => {
            try {
                return typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
            } catch (e) {
                console.warn(`[safeStorage] Failed to access sessionStorage getItem for key: ${key}`, e);
                return null;
            }
        },
        setItem: (key: string, value: string): void => {
            try {
                if (typeof window !== 'undefined') {
                    window.sessionStorage.setItem(key, value);
                }
            } catch (e) {
                console.warn(`[safeStorage] Failed to access sessionStorage setItem for key: ${key}`, e);
            }
        },
        removeItem: (key: string): void => {
            try {
                if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem(key);
                }
            } catch (e) {
                console.warn(`[safeStorage] Failed to access sessionStorage removeItem for key: ${key}`, e);
            }
        }
    }
};
