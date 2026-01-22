import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

export const SubscriptionService = {
    /**
     * Creates a Stripe Checkout Session for the user.
     * Redirects the user to the Stripe Checkout page.
     */
    createCheckoutSession: async (priceId: string, isYearly: boolean) => {
        // Determine success/cancel URLs based on current location, or defaults
        const baseUrl = window.location.origin;
        const successUrl = `${baseUrl}/settings?session_id={CHECKOUT_SESSION_ID}&success=true`;
        const cancelUrl = `${baseUrl}/#pricing`; // Re-open pricing modal on cancel

        const createSession = httpsCallable<{ priceId: string; successUrl: string; cancelUrl: string }, { url: string }>(
            functions,
            'createCheckoutSession'
        );

        try {
            const result = await createSession({
                priceId,
                successUrl,
                cancelUrl
            });

            // Redirect to Stripe
            if (result.data.url) {
                window.location.href = result.data.url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error) {
            console.error("Failed to create checkout session:", error);
            throw error;
        }
    },

    /**
     * Creates a Stripe Customer Portal session.
     * Redirects the user to the Portal.
     */
    createCustomerPortal: async () => {
        const returnUrl = `${window.location.origin}/settings`;

        const createPortal = httpsCallable<{ returnUrl: string }, { url: string }>(
            functions,
            'createCustomerPortal'
        );

        try {
            const result = await createPortal({ returnUrl });

            if (result.data.url) {
                window.location.href = result.data.url;
            } else {
                throw new Error("No portal URL returned");
            }
        } catch (error) {
            console.error("Failed to create portal session:", error);
            throw error;
        }
    },

    /**
     * Verifies a session manually (useful if webhooks are delayed or CLI not running locally).
     */
    verifySession: async (sessionId: string) => {
        console.log("SubscriptionService.verifySession called with:", sessionId);
        const verifyFn = httpsCallable<{ sessionId: string }, { success: boolean; status: string }>(
            functions,
            'verifyCheckoutSession'
        );
        try {
            const result = await verifyFn({ sessionId });
            console.log("SubscriptionService.verifySession result:", result.data);
            return result;
        } catch (error) {
            console.error("SubscriptionService.verifySession ERROR:", error);
            throw error;
        }
    },

    /**
     * Reactivates a subscription that is scheduled to cancel.
     */
    reactivateSubscription: async () => {
        const reactivateFn = httpsCallable<{}, { success: boolean }>(
            functions,
            'reactivateSubscription'
        );
        return reactivateFn();
    },

    /**
     * Forces a refresh of the subscription status from Stripe.
     */
    syncSubscription: async () => {
        const syncFn = httpsCallable<{}, { success: boolean; status: string }>(
            functions,
            'syncSubscription'
        );
        return syncFn();
    }
};
