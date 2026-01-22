import { useMemo } from 'react';
import { Timestamp } from 'firebase/firestore';
import { User } from '../types';

export type AccessLevel = 'trial' | 'pro' | 'expired';

export interface UserAccess {
    accessLevel: AccessLevel;

    // Access & Subscription Fields
    trialStartAt?: Timestamp | null;
    trialEndAt?: Timestamp | null;
    subscriptionStatus?: string | null;
    hasWrittenFirstEntry?: boolean;
    proOverride?: boolean;

    // Stripe Fields
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    stripePriceId?: string | null;
    stripeCurrentPeriodEnd?: Timestamp | null;
    stripeCancelAtPeriodEnd?: boolean;
}

/**
 * Pure function to determine access level.
 * Separated for easier testing and usage outside of React context if needed.
 */
export const getUserAccess = (user: User | null | undefined): UserAccess => {
    // Default state for no user or missing data
    const defaultState: UserAccess = {
        accessLevel: 'expired', // Default to restricted if unknown
        trialStartAt: null,
        trialEndAt: null,
        subscriptionStatus: null,
        proOverride: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
    };

    if (!user) {
        return defaultState;
    }

    const {
        trial_start_at = null,
        trial_end_at = null,
        subscription_status = 'none',
        has_written_first_entry = false,
        pro_override = false,
        stripeCustomerId = null,
        stripeSubscriptionId = null,
        stripePriceId = null,
        stripeCurrentPeriodEnd = null,
    } = user;

    let accessLevel: AccessLevel = 'expired';

    // 1. Pro Override (Highest Priority)
    if (pro_override === true) {
        accessLevel = 'pro';
    }
    // 2. Active Subscription
    else if (subscription_status === 'active') {
        accessLevel = 'pro';
    }
    // 3. Trial
    else if (trial_start_at && trial_end_at) {
        const now = new Date();
        // Safely handle Firestore Timestamp conversion if needed
        const endDate = trial_end_at instanceof Timestamp ? trial_end_at.toDate() : new Date(0);

        if (now < endDate) {
            accessLevel = 'trial';
        } else {
            accessLevel = 'expired';
        }
    }
    // 4. Pre-Trial (Hasn't written first entry) -> Treat as Trial (Access allowed)
    else if (!has_written_first_entry) {
        accessLevel = 'trial';
    }
    // 5. Default -> Expired
    else {
        accessLevel = 'expired';
    }

    return {
        accessLevel,
        hasWrittenFirstEntry: has_written_first_entry,
        trialStartAt: trial_start_at,
        trialEndAt: trial_end_at,
        subscriptionStatus: subscription_status,
        proOverride: pro_override,
        stripeCustomerId,
        stripeSubscriptionId,
        stripePriceId,
        stripeCurrentPeriodEnd,
        stripeCancelAtPeriodEnd: user?.stripeCancelAtPeriodEnd,
    };
};

export const useUserAccess = (user: User | null | undefined): UserAccess => {
    const access = useMemo(() => getUserAccess(user), [user]);

    // --- Console Log for Verification (Dev Mode) ---
    useMemo(() => {
        if (process.env.NODE_ENV === 'development' && user) {
            console.group('User Access Debug'); // Expanded by default so user sees data immediately
            console.log('User Document:', user);
            console.log('Calculated Access:', access);
            console.groupEnd();
        }
    }, [user, access]);

    return access;
};
