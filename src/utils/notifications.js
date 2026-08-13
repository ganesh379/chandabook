// Client-side goal milestone notifications.
// Note: this only fires while the app is open in a tab (uses the browser
// Notification API directly). True background push notifications (app
// closed) would require Firebase Cloud Messaging + a deployed Cloud
// Function on a paid Blaze plan, which is outside what can be provisioned
// from the client alone.

const MILESTONES = [25, 50, 75, 100];
const DISMISS_KEY = 'chandabook_notif_banner_dismissed';

export const isNotificationSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const getNotificationPermission = () => (isNotificationSupported() ? Notification.permission : 'unsupported');

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return 'denied';
  }
};

export const isNotificationBannerDismissed = () => localStorage.getItem(DISMISS_KEY) === '1';
export const dismissNotificationBanner = () => localStorage.setItem(DISMISS_KEY, '1');

const milestoneStorageKey = (groupId) => `chandabook_milestones_${groupId}`;

const getNotifiedMilestones = (groupId) => {
  try {
    return JSON.parse(localStorage.getItem(milestoneStorageKey(groupId)) || '[]');
  } catch (e) {
    return [];
  }
};

const markMilestoneNotified = (groupId, milestone) => {
  const current = getNotifiedMilestones(groupId);
  if (!current.includes(milestone)) {
    localStorage.setItem(milestoneStorageKey(groupId), JSON.stringify([...current, milestone]));
  }
};

// Checks totalCollected against the target goal and fires (at most) one
// notification per newly-crossed milestone. Returns the milestone crossed
// this call (or null) so the caller can also show an in-app toast/confetti.
export const checkAndNotifyMilestones = (group, financials) => {
  if (!group?.id) return null;
  const targetGoal = Number(group.targetGoal) || 0;
  if (targetGoal <= 0) return null;

  const percent = (Number(financials.totalCollected) / targetGoal) * 100;
  const notified = getNotifiedMilestones(group.id);

  const crossed = MILESTONES.filter(m => percent >= m && !notified.includes(m)).sort((a, b) => b - a);
  if (crossed.length === 0) return null;

  const milestone = crossed[0];
  markMilestoneNotified(group.id, milestone);
  // Mark any lower milestones skipped over (e.g. a big single donation) as notified too
  crossed.forEach(m => markMilestoneNotified(group.id, m));

  const title = milestone >= 100 ? `🎉 Goal Reached! ${group.name}` : `🎯 ${milestone}% of Goal Reached!`;
  const body = milestone >= 100
    ? `${group.name} has fully collected its target of ${group.currency || '₹'}${targetGoal.toLocaleString('en-IN')}!`
    : `${group.name} has crossed ${milestone}% of its ${group.currency || '₹'}${targetGoal.toLocaleString('en-IN')} target.`;

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/icon-192.png' });
    } catch (e) { /* ignore */ }
  }

  return { milestone, title, body };
};
