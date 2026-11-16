import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { safeStorage } from '../utils/storage';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DEVICE_ID_KEY = 'skhy_device_id';
const TRUST_EXPIRY_MS_DEFAULT = 30 * 24 * 60 * 60 * 1000; // 30 days
const TRUST_EXPIRY_MS_ADMIN = 7 * 24 * 60 * 60 * 1000;   //  7 days (stricter for admin)

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface TrustRecord {
    deviceId: string;
    expiresAt: string; // ISO timestamp
}

interface UseDeviceOtpOptions {
    /** 'admin' uses a 7-day trust window; all others use 30 days */
    role?: 'admin' | 'user';
}

interface UseDeviceOtpReturn {
    /** Returns true if the current browser device is NOT yet trusted for this email */
    isNewDevice: (email: string) => boolean;
    /** Send an 8-digit OTP to the given email (uses Supabase signInWithOtp).
     *  Call this immediately after a successful password login on a new device. */
    sendDeviceOtp: (email: string) => Promise<{ error: any }>;
    /** Verify the 8-digit OTP the user entered.
     *  On success, marks the device as trusted in localStorage + Supabase. */
    verifyAndTrust: (
        email: string,
        token: string,
        userId: string
    ) => Promise<{ error: any }>;
}

// ─── DEVICE ID ────────────────────────────────────────────────────────────────
function getOrCreateDeviceId(): string {
    let deviceId = safeStorage.local.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        // Generate a stable random UUID for this browser
        deviceId = crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        safeStorage.local.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
}

function getTrustKey(email: string): string {
    return `skhy_trusted_${email.toLowerCase()}`;
}

function readTrustRecord(email: string): TrustRecord | null {
    try {
        const raw = safeStorage.local.getItem(getTrustKey(email));
        if (!raw) return null;
        return JSON.parse(raw) as TrustRecord;
    } catch {
        return null;
    }
}

function writeTrustRecord(email: string, deviceId: string, expiresAt: Date): void {
    safeStorage.local.setItem(
        getTrustKey(email),
        JSON.stringify({ deviceId, expiresAt: expiresAt.toISOString() })
    );
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────
/**
 * useDeviceOtp — step-up OTP verification for new/unrecognized devices.
 *
 * Flow:
 *   1. Password login succeeds.
 *   2. Caller checks isNewDevice(email) — if true, call sendDeviceOtp(email).
 *   3. Show OTP input inline.
 *   4. On submit call verifyAndTrust(email, token, userId).
 *   5. On success, caller navigates to dashboard.
 *   6. Next login from same device: isNewDevice returns false → skip OTP.
 */
export function useDeviceOtp({ role = 'user' }: UseDeviceOtpOptions = {}): UseDeviceOtpReturn {
    const expiryMs = role === 'admin' ? TRUST_EXPIRY_MS_ADMIN : TRUST_EXPIRY_MS_DEFAULT;
    const deviceIdRef = useRef<string>(getOrCreateDeviceId());

    const isNewDevice = useCallback((email: string): boolean => {
        const record = readTrustRecord(email);
        if (!record) return true;
        if (record.deviceId !== deviceIdRef.current) return true;
        if (new Date(record.expiresAt) < new Date()) {
            // Expired — clean up and treat as new
            safeStorage.local.removeItem(getTrustKey(email));
            return true;
        }
        return false;
    }, []);

    const sendDeviceOtp = useCallback(async (email: string): Promise<{ error: any }> => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // Device OTP is only for existing users — never create a new account
                shouldCreateUser: false,
            },
        });
        return { error };
    }, []);

    const verifyAndTrust = useCallback(
        async (email: string, token: string, userId: string): Promise<{ error: any }> => {
            // Verify the OTP with Supabase
            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email',
            });

            if (error) return { error };

            // ── Mark device as trusted ───────────────────────────────────────
            const expiresAt = new Date(Date.now() + expiryMs);
            const deviceId = deviceIdRef.current;

            // 1. Client-side (fast, for subsequent logins on this browser)
            writeTrustRecord(email, deviceId, expiresAt);

            // 2. Server-side audit log (best-effort, non-blocking)
            const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
            const deviceLabel = (() => {
                if (!userAgent) return 'Unknown device';
                const browser = userAgent.includes('Chrome')
                    ? 'Chrome'
                    : userAgent.includes('Firefox')
                    ? 'Firefox'
                    : userAgent.includes('Safari')
                    ? 'Safari'
                    : 'Browser';
                const os = userAgent.includes('Windows')
                    ? 'Windows'
                    : userAgent.includes('Mac')
                    ? 'macOS'
                    : userAgent.includes('Linux')
                    ? 'Linux'
                    : userAgent.includes('Android')
                    ? 'Android'
                    : userAgent.includes('iPhone') || userAgent.includes('iPad')
                    ? 'iOS'
                    : 'Unknown OS';
                return `${browser} on ${os}`;
            })();

            supabase
                .from('trusted_devices')
                .upsert(
                    {
                        user_id: userId,
                        device_id: deviceId,
                        device_label: deviceLabel,
                        expires_at: expiresAt.toISOString(),
                        last_seen_at: new Date().toISOString(),
                    },
                    { onConflict: 'user_id,device_id' }
                )
                .then(({ error: dbError }) => {
                    if (dbError) {
                        console.warn('[DeviceOtp] Could not write trusted_devices record:', dbError.message);
                    }
                });

            return { error: null };
        },
        [expiryMs]
    );

    return { isNewDevice, sendDeviceOtp, verifyAndTrust };
}
