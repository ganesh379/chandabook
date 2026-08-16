// Push notifications for ChandaBook committee activity.
//
// ChandaBook stores collections and expenses as ARRAYS inside each group
// document rather than as subcollections, so there is no per-entry create
// trigger to hook. This function therefore watches the group document and
// diffs the before/after arrays by entry id to find what was actually added.
//
// Deploy with:  firebase deploy --only functions

const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions');
// firebase-admin v13+ dropped the `admin.firestore()` / `admin.messaging()`
// namespaced accessors — the modular subpath imports are the supported API.
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

const db = getFirestore();
const messaging = getMessaging();

// Must match the Firestore database location — this project's (default)
// database is the nam5 US multi-region, whose Eventarc triggers live in
// us-central1. Putting the function elsewhere (e.g. asia-south1, closer to the
// users) fails trigger validation AND would be slower, since everything this
// function does is read Firestore. Delivery latency to phones is FCM's job and
// is unaffected by the function's region.
const REGION = 'us-central1';

const rupees = (amount, currency) => {
  const symbol = currency || '₹';
  const n = Number(amount) || 0;
  return `${symbol}${n.toLocaleString('en-IN')}`;
};

// Entries added since the previous version of the document, matched by id.
// Falls back to a length comparison for legacy entries that predate ids.
const newEntries = (before = [], after = []) => {
  const seen = new Set((before || []).map((e) => e && e.id).filter(Boolean));
  const added = (after || []).filter((e) => e && e.id && !seen.has(e.id));
  if (added.length > 0) return added;

  const growth = (after || []).length - (before || []).length;
  return growth > 0 ? (after || []).slice(0, growth) : [];
};

// Every opted-in device for this group, minus the one belonging to whoever
// recorded the entry (no point buzzing the phone that just typed it in).
const tokensForGroup = async (groupId, excludeName) => {
  const snap = await db.collection('pushTokens').where('groupId', '==', groupId).get();
  if (snap.empty) return [];

  const normalised = (excludeName || '').trim().toLowerCase();
  const tokens = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    if (!data.token) return;
    const owner = (data.memberName || '').trim().toLowerCase();
    if (normalised && owner && owner === normalised) return;
    tokens.push(data.token);
  });
  return tokens;
};

// Data-only payload: the service worker builds the visible notification, which
// avoids Chrome rendering a second, duplicate one from a `notification` block.
const send = async (tokens, { title, body, tag }) => {
  if (tokens.length === 0) return { successCount: 0, staleTokens: [] };

  const response = await messaging.sendEachForMulticast({
    tokens,
    data: { title, body, tag, url: '/' },
    webpush: {
      headers: { Urgency: 'high' },
      fcmOptions: { link: '/' }
    }
  });

  // Tokens die when a user clears site data or uninstalls the PWA. Collect them
  // so they can be pruned instead of retried forever on every future write.
  const staleTokens = [];
  response.responses.forEach((res, i) => {
    const code = res.error && res.error.code;
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-registration-token' ||
      code === 'messaging/invalid-argument'
    ) {
      staleTokens.push(tokens[i]);
    }
  });

  return { successCount: response.successCount, staleTokens };
};

const pruneStaleTokens = async (tokens) => {
  // The token doubles as the document ID (see src/firebase.js); anything with
  // a '/' would resolve to a nested path, so skip it rather than delete blindly.
  const deletable = tokens.filter((t) => typeof t === 'string' && !t.includes('/'));
  if (deletable.length === 0) return;
  const batch = db.batch();
  deletable.forEach((token) => {
    batch.delete(db.collection('pushTokens').doc(token));
  });
  await batch.commit();
  logger.info(`Pruned ${deletable.length} stale push token(s).`);
};

exports.notifyCommitteeActivity = onDocumentUpdated(
  { document: 'groups/{groupId}', region: REGION },
  async (event) => {
    const before = event.data.before.data() || {};
    const after = event.data.after.data() || {};
    const groupId = event.params.groupId;

    const addedCollections = newEntries(before.collections, after.collections);
    const addedExpenses = newEntries(before.expenses, after.expenses);

    if (addedCollections.length === 0 && addedExpenses.length === 0) {
      return; // Some other field changed (settings, members, logo) — stay quiet.
    }

    const groupName = after.name || 'Committee';
    const currency = after.currency;
    const allStale = [];

    // A bulk import or a restored backup can add many rows in one write;
    // summarise instead of firing a notification per row.
    if (addedCollections.length > 0) {
      const total = addedCollections.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
      const actor = addedCollections.length === 1 ? addedCollections[0].collectedBy : null;

      const body = addedCollections.length === 1
        ? `${addedCollections[0].donorName || 'A donor'} donated ${rupees(addedCollections[0].amount, currency)}` +
          (addedCollections[0].collectedBy ? ` (collected by ${addedCollections[0].collectedBy})` : '')
        : `${addedCollections.length} new donations totalling ${rupees(total, currency)}`;

      const tokens = await tokensForGroup(groupId, actor);
      const { successCount, staleTokens } = await send(tokens, {
        title: `💰 New Chanda — ${groupName}`,
        body,
        tag: `collection-${groupId}`
      });
      allStale.push(...staleTokens);
      logger.info(`Collection notification: ${successCount}/${tokens.length} delivered.`);
    }

    if (addedExpenses.length > 0) {
      const total = addedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const actor = addedExpenses.length === 1 ? addedExpenses[0].spentBy : null;

      const body = addedExpenses.length === 1
        ? `${addedExpenses[0].title || 'Expense'} — ${rupees(addedExpenses[0].amount, currency)}` +
          (addedExpenses[0].spentBy ? ` (spent by ${addedExpenses[0].spentBy})` : '')
        : `${addedExpenses.length} new expenses totalling ${rupees(total, currency)}`;

      const tokens = await tokensForGroup(groupId, actor);
      const { successCount, staleTokens } = await send(tokens, {
        title: `🧾 New Expense — ${groupName}`,
        body,
        tag: `expense-${groupId}`
      });
      allStale.push(...staleTokens);
      logger.info(`Expense notification: ${successCount}/${tokens.length} delivered.`);
    }

    await pruneStaleTokens([...new Set(allStale)]);
  }
);
