import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import Stripe from 'stripe';

admin.initializeApp();
const db = admin.firestore();

const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

// Initialize Stripe helper (deferred to function call to ensure secret availability)
const getStripe = () => new Stripe(stripeSecretKey.value(), { apiVersion: '2023-10-16' });

/**
 * Create a Stripe Checkout Session for a subscription.
 * Call with: { priceId: string, successUrl: string, cancelUrl: string }
 */
export const createCheckoutSession = functions.runWith({ secrets: [stripeSecretKey] }).https.onCall(async (data, context) => {
    // 1. Authenticate User
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const { priceId, successUrl, cancelUrl } = data;

    if (!priceId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a priceId.');
    }

    // 2. Get User from Firestore
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found in database.');
    }
    const userData = userDoc.data();

    // 3. Get or Create Stripe Customer
    let customerId = userData?.stripeCustomerId;

    try {
        const stripe = getStripe();

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: context.auth.token.email,
                metadata: {
                    firebaseUID: uid
                }
            });
            customerId = customer.id;
            // Update user immediately with customer ID to avoid duplicates
            await userDocRef.update({ stripeCustomerId: customerId });
        }

        // 4. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            allow_promotion_codes: true,
            subscription_data: {
                metadata: {
                    firebaseUID: uid
                }
            }
        });

        return { url: session.url };

    } catch (error: any) {
        console.error("Error creating checkout session:", error);
        throw new functions.https.HttpsError('internal', error.message || 'Unable to create checkout session');
    }
});

/**
 * Create a Stripe Customer Portal Session for managing subscriptions.
 * Call with: { returnUrl: string }
 */
export const createCustomerPortal = functions.runWith({ secrets: [stripeSecretKey] }).https.onCall(async (data, context) => {
    // 1. Authenticate User
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const { returnUrl } = data;

    // 2. Get User from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    const customerId = userData?.stripeCustomerId;

    if (!customerId) {
        throw new functions.https.HttpsError('failed-precondition', 'No Stripe Customer ID found for this user.');
    }

    try {
        const stripe = getStripe();
        // 3. Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        return { url: session.url };

    } catch (error: any) {
        console.error("Error creating portal session:", error);
        throw new functions.https.HttpsError('internal', error.message || 'Unable to create portal session');
    }
});

/**
 * Manually verify a Checkout Session and update user status.
 * Call with: { sessionId: string }
 */
export const verifyCheckoutSession = functions.runWith({ secrets: [stripeSecretKey] }).https.onCall(async (data, context) => {
    // 1. Authenticate User
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;
    const { sessionId } = data;
    console.log(`[verifyCheckoutSession] Called by user ${uid} with sessionId ${sessionId}`);

    if (!sessionId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a sessionId.');
    }

    try {
        const stripe = getStripe();
        // 2. Retrieve Session
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription']
        });
        console.log(`[verifyCheckoutSession] Session retrieved: ${session.id}, status: ${session.payment_status}, mode: ${session.mode}`);

        // 3. Verify Session Status
        if (session.payment_status !== 'paid' && session.mode === 'payment') {
            console.warn(`[verifyCheckoutSession] Session not paid: ${session.payment_status}`);
            throw new functions.https.HttpsError('failed-precondition', 'Session not paid.');
        }

        // 4. Update User Subscription
        if (session.subscription && typeof session.subscription !== 'string') {
            const sub = session.subscription as Stripe.Subscription;
            console.log(`[verifyCheckoutSession] Updating subscription: ${sub.id}, status: ${sub.status}`);
            await updateUserSubscription(uid, session.customer as string, sub);
            return { success: true, status: 'subscription_updated' };
        }

        // Handle non-subscription payments if we had them, but for now we only do subs
        console.log(`[verifyCheckoutSession] Verified non-subscription session`);
        return { success: true, status: 'verified' };

    } catch (error: any) {
        console.error("[verifyCheckoutSession] Error verifying checkout session:", error);
        throw new functions.https.HttpsError('internal', error.message || 'Unable to verify session');
    }
});

/**
 * Stripe Webhook Handler
 * Handles: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
 */
export const stripeWebhook = functions.runWith({ secrets: [stripeSecretKey, stripeWebhookSecret] }).https.onRequest(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const stripe = getStripe();

    let event: Stripe.Event;

    try {
        // Verify signature
        if (!signature) {
            throw new Error("Missing signature");
        }
        event = stripe.webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecret.value());
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            if (session.mode === 'subscription') {
                // Find user by customerId or metadata
                // Best reliability: check metadata first if available, else query by stripeCustomerId
                // But we don't always get metadata in session object depending on expansion.
                // However, we added metadata to subscription.

                // Let's resolve the user
                let uid = session.metadata?.firebaseUID; // metadata on session

                // If not in session metadata, try queries
                if (!uid) {
                    const usersSnapshot = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
                    if (!usersSnapshot.empty) {
                        uid = usersSnapshot.docs[0].id;
                    }
                }

                if (uid && subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    await updateUserSubscription(uid, customerId, subscription);
                } else {
                    console.error("Could not find user for completed checkout session", session.id);
                }
            }
        }
        else if (event.type === 'customer.subscription.updated') {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            // Find user
            const usersSnapshot = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
            if (!usersSnapshot.empty) {
                const uid = usersSnapshot.docs[0].id;
                await updateUserSubscription(uid, customerId, subscription);
            }
        }
        else if (event.type === 'customer.subscription.deleted') {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            // Find user
            const usersSnapshot = await db.collection('users').where('stripeCustomerId', '==', customerId).limit(1).get();
            if (!usersSnapshot.empty) {
                const uid = usersSnapshot.docs[0].id;
                await db.collection('users').doc(uid).update({
                    subscription_status: 'expired',
                    stripeSubscriptionId: null,
                    stripePriceId: null,
                    stripeCurrentPeriodEnd: null
                });
                console.log(`Subscription deleted/expired for user ${uid}`);
            }
        }

        res.status(200).send({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).send("Webhook processing error");
    }
});

import { Timestamp } from 'firebase-admin/firestore';

// ... (existing imports)

// ...

/**
 * Helper to update user document with key subscription fields
 */
async function updateUserSubscription(uid: string, customerId: string, subscription: Stripe.Subscription) {
    const priceId = subscription.items.data[0].price.id;
    const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status;
    const currentPeriodEnd = Timestamp.fromMillis(subscription.current_period_end * 1000);

    await db.collection('users').doc(uid).update({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        subscription_status: status,
        stripeCurrentPeriodEnd: currentPeriodEnd,
        stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
        // If status is active, ensure we clear any old trial end overrides if needed?
        // Actually access logic handles priority.
    });

    console.log(`Updated subscription for user ${uid}: status=${status}`);
}

/**
 * Reactivate a subscription that is set to cancel at the end of the period.
 */
export const reactivateSubscription = functions.runWith({ secrets: [stripeSecretKey] }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;

    try {
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const subscriptionId = userData?.stripeSubscriptionId;

        if (!subscriptionId) {
            throw new functions.https.HttpsError('failed-precondition', 'No active subscription found to reactivate.');
        }

        const stripe = getStripe();
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false
        });

        await updateUserSubscription(uid, userData.stripeCustomerId, subscription);

        return { success: true };
    } catch (error: any) {
        console.error("Error reactivating subscription:", error);
        throw new functions.https.HttpsError('internal', error.message || 'Unable to reactivate subscription');
    }
});

/**
 * Manually sync subscription status (useful if webhooks are missed/local)
 */
export const syncSubscription = functions.runWith({ secrets: [stripeSecretKey] }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const uid = context.auth.uid;

    try {
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const subscriptionId = userData?.stripeSubscriptionId;

        if (!subscriptionId) {
            // If we don't think we have one, try to find one by customer ID
            if (userData?.stripeCustomerId) {
                const stripe = getStripe();
                const subs = await stripe.subscriptions.list({ customer: userData.stripeCustomerId, limit: 1 });
                if (subs.data.length > 0) {
                    await updateUserSubscription(uid, userData.stripeCustomerId, subs.data[0]);
                    return { success: true, status: 'synced_found' };
                }
            }
            return { success: true, status: 'no_subscription' };
        }

        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await updateUserSubscription(uid, userData.stripeCustomerId, subscription);

        return { success: true, status: 'synced' };
    } catch (error: any) {
        console.error("Error syncing subscription:", error);
        throw new functions.https.HttpsError('internal', error.message || 'Unable to sync subscription');
    }
});

/**
 * Permanently delete a user account and all associated data.
 * Wrapper function callable from the client.
 */
export const deleteUserAccount = functions.runWith({
    secrets: [stripeSecretKey],
    timeoutSeconds: 300,
    memory: '512MB'
}).https.onCall(async (data, context) => {
    // 1. Security Check
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to delete your account.'
        );
    }
    const userId = context.auth.uid;
    await performUserDeletion(userId);
    return { success: true };
});

/**
 * Scheduled job to delete accounts that have been scheduled for deletion for > 30 days.
 * Runs every 24 hours.
 */
export const processScheduledDeletions = functions.runWith({
    secrets: [stripeSecretKey],
    timeoutSeconds: 540,
    memory: '512MB'
}).pubsub.schedule('every day 03:00').timeZone('America/New_York').onRun(async (context) => {
    console.log('[processScheduledDeletions] Starting daily check for expired accounts.');

    // 30 days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

    console.log(`[processScheduledDeletions] Cutoff time: ${cutoffDate.toISOString()}`);

    const usersRef = db.collection('users');
    const snapshot = await usersRef
        .where('scheduledForDeletionAt', '<=', cutoffTimestamp)
        .get();

    if (snapshot.empty) {
        console.log('[processScheduledDeletions] No accounts found to delete.');
        return;
    }

    console.log(`[processScheduledDeletions] Found ${snapshot.size} accounts to delete.`);

    for (const doc of snapshot.docs) {
        const userId = doc.id;
        try {
            console.log(`[processScheduledDeletions] Due for deletion: User ${userId}. Processing...`);
            await performUserDeletion(userId);
            console.log(`[processScheduledDeletions] Successfully deleted user ${userId}.`);
        } catch (error) {
            console.error(`[processScheduledDeletions] Failed to delete user ${userId}:`, error);
        }
    }

    console.log('[processScheduledDeletions] Completed daily check.');
});

/**
 * Shared logic to delete a user's data from Stripe, Storage, Firestore, and Auth.
 * Used by both the client-callable function and the scheduled cron job.
 */
async function performUserDeletion(userId: string) {
    console.log(`[performUserDeletion] Starting deletion for user: ${userId}`);

    const userDocRef = db.collection('users').doc(userId);
    const storage = admin.storage();

    try {
        // Fetch user data to get Stripe Customer ID
        const userSnapshot = await userDocRef.get();
        const userData = userSnapshot.data();

        let email: string | undefined;

        // Try to get email from Auth for Stripe fallback if needed
        try {
            const userRecord = await admin.auth().getUser(userId);
            email = userRecord.email;
        } catch (e) {
            console.log(`[performUserDeletion] Could not fetch Auth user (maybe already deleted):`, e);
        }

        if (!userData && !email) {
            console.warn(`[performUserDeletion] User document AND Auth record not found for ${userId}. Proceeding with best-effort cleanup.`);
        } else {
            console.log(`[performUserDeletion] User data found. Stripe Customer ID: ${userData?.stripeCustomerId || 'None'}`);
        }

        // ---------------------------------------------------------
        // 1. Stripe Cancellation
        // ---------------------------------------------------------
        const stripe = getStripe();
        const customerIdsToCheck = new Set<string>();

        if (userData?.stripeCustomerId) {
            customerIdsToCheck.add(userData.stripeCustomerId);
        }

        // Fallback: Check for customers by email to ensure robustness
        if (email) {
            try {
                const customersByEmail = await stripe.customers.list({
                    email: email,
                    limit: 3
                });
                customersByEmail.data.forEach(c => customerIdsToCheck.add(c.id));
            } catch (err: any) {
                console.warn("[performUserDeletion] Error listing customers by email:", err.message);
            }
        }

        if (customerIdsToCheck.size === 0) {
            console.log("[performUserDeletion] No Stripe Customer ID found and no customers found by email. Skipping cancellation.");
        } else {
            console.log(`[performUserDeletion] Checking subscriptions for ${customerIdsToCheck.size} customer IDs:`, Array.from(customerIdsToCheck));

            for (const customerId of Array.from(customerIdsToCheck)) {
                try {
                    console.log(`[performUserDeletion] Fetching active subscriptions for customer ${customerId}`);
                    const subscriptions = await stripe.subscriptions.list({
                        customer: customerId,
                        status: 'active',
                    });

                    console.log(`[performUserDeletion] Found ${subscriptions.data.length} active subscriptions for ${customerId}.`);

                    for (const sub of subscriptions.data) {
                        try {
                            await stripe.subscriptions.cancel(sub.id);
                            console.log(`[performUserDeletion] Cancelled subscription: ${sub.id}`);
                        } catch (cancelErr: any) {
                            console.error(`[performUserDeletion] Failed to cancel subscription ${sub.id}:`, cancelErr.message);
                        }
                    }
                } catch (error) {
                    console.error(`[performUserDeletion] Error processing customer ${customerId}:`, error);
                }
            }
        }

        // ---------------------------------------------------------
        // 2. Delete Storage Files (Images & Stickers)
        // ---------------------------------------------------------
        const bucket = storage.bucket();

        // A. Delete 'stickers/{userId}' folder
        console.log(`[performUserDeletion] Deleting stickers folder: stickers/${userId}/`);
        try {
            await bucket.deleteFiles({ prefix: `stickers/${userId}/` });
        } catch (err: any) {
            console.log('[performUserDeletion] Storage: Error deleting stickers folder (might be empty):', err.message);
        }

        // B. Delete 'entries/{userId}' folder (User's entry images)
        console.log(`[performUserDeletion] Deleting entries folder: entries/${userId}/`);
        try {
            await bucket.deleteFiles({ prefix: `entries/${userId}/` });
        } catch (err: any) {
            console.log('[performUserDeletion] Storage: Error deleting entries folder (might be empty):', err.message);
        }

        // B. Find and Delete Entry Images from 'entries' collection
        console.log(`[performUserDeletion] Scanning entries for images...`);
        const entriesRef = db.collection('entries');
        const entriesQuery = entriesRef.where('userId', '==', userId);
        const entriesSnapshot = await entriesQuery.get();
        console.log(`[performUserDeletion] Found ${entriesSnapshot.size} entries to scan for images.`);

        const deleteFilePromises: Promise<any>[] = [];

        entriesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.image_urls && Array.isArray(data.image_urls)) {
                data.image_urls.forEach((url: string) => {
                    if (url.includes('firebasestorage')) {
                        try {
                            const path = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
                            deleteFilePromises.push(bucket.file(path).delete().catch(() => { }));
                        } catch (e) {
                            console.warn("[performUserDeletion] Could not parse file path from URL", url);
                        }
                    }
                });
            }
        });

        if (deleteFilePromises.length > 0) {
            console.log(`[performUserDeletion] Deleting ${deleteFilePromises.length} images...`);
            await Promise.all(deleteFilePromises);
        }

        // ---------------------------------------------------------
        // 3. Delete Firestore Data (Handling Batches)
        // ---------------------------------------------------------
        const batchSize = 500;
        const query = entriesQuery.orderBy('__name__').limit(batchSize);

        const deleteQueryBatch = async (query: FirebaseFirestore.Query) => {
            const snapshot = await query.get();
            const batchSize = snapshot.size;
            if (batchSize === 0) return;

            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`[performUserDeletion] Deleted batch of ${batchSize} entries.`);

            if (batchSize >= 500) {
                await deleteQueryBatch(query);
            }
        };

        await deleteQueryBatch(query);
        await userDocRef.delete();
        console.log(`[performUserDeletion] Firestore User Document deleted.`);

        // ---------------------------------------------------------
        // 4. Delete Firebase Auth User
        // ---------------------------------------------------------
        try {
            await admin.auth().deleteUser(userId);
            console.log(`[performUserDeletion] Auth user deleted.`);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`[performUserDeletion] Auth user already deleted.`);
            } else {
                // If it's a critical auth error, we might log it but not fail the whole process if others succeeded?
                // But generally we want to throw to signal issues.
                throw error;
            }
        }

        return { success: true };

    } catch (error: any) {
        console.error('[performUserDeletion] Account deletion failed with fatal error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to delete account.', error);
    }
}

/**
 * Trigger: On User Update
 * Detects changes to `scheduledForDeletionAt` to manage Stripe subscriptions.
 */
export const onUserUpdate = functions.runWith({ secrets: [stripeSecretKey] }).firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const previousData = change.before.data();
        const userId = context.params.userId;

        const wasScheduled = previousData.scheduledForDeletionAt;
        const isScheduled = newData.scheduledForDeletionAt;

        // Condition 1: User JUST scheduled deletion
        if (!wasScheduled && isScheduled) {
            console.log(`[onUserUpdate] User ${userId} scheduled for deletion. Checking Stripe subscription.`);

            if (newData.stripeSubscriptionId) {
                try {
                    const stripe = getStripe();
                    // Update subscription to cancel at period end
                    const subscription = await stripe.subscriptions.update(newData.stripeSubscriptionId, {
                        cancel_at_period_end: true
                    });

                    console.log(`[onUserUpdate] Subscription ${subscription.id} set to cancel at period end.`);

                    // Reflect this in Firestore to keep UI in sync
                    // Note: We use update directly to avoid infinite loops if we are careful with fields,
                    // but calling update here WILL trigger onUpdate again. 
                    // However, we only act if (!wasScheduled && isScheduled), so the recursive call won't re-trigger this block 
                    // because active/previous will both be scheduled.
                    await change.after.ref.update({
                        stripeCancelAtPeriodEnd: true
                    });

                } catch (error: any) {
                    console.error(`[onUserUpdate] Error cancelling subscription for ${userId}:`, error);
                }
            }
        }

        // Condition 2: User restored account (JUST unscheduled)
        // Logic: active subscription might have been set to cancel. We should undo that.
        if (wasScheduled && !isScheduled) {
            console.log(`[onUserUpdate] User ${userId} restored account. Checking Stripe subscription.`);

            if (newData.stripeSubscriptionId) {
                try {
                    const stripe = getStripe();

                    // We only want to reactivate if it was set to cancel
                    // And potentially check if it is still valid/active (not already fully cancelled/expired)
                    // The 'stripeCancelAtPeriodEnd' field might be our best local hint, but let's query Stripe or assume we try to un-cancel.

                    const subscription = await stripe.subscriptions.retrieve(newData.stripeSubscriptionId);

                    // Only reactivate if it's currently set to cancel at period end and is active/trialing
                    if (subscription.cancel_at_period_end && (subscription.status === 'active' || subscription.status === 'trialing')) {
                        const updatedSub = await stripe.subscriptions.update(newData.stripeSubscriptionId, {
                            cancel_at_period_end: false
                        });
                        console.log(`[onUserUpdate] Subscription ${updatedSub.id} reactivated (cancel_at_period_end: false).`);

                        await change.after.ref.update({
                            stripeCancelAtPeriodEnd: false
                        });
                    }

                } catch (error: any) {
                    console.error(`[onUserUpdate] Error reactivating subscription for ${userId}:`, error);
                }
            }
        }

        return null;
    });
