import { useEffect } from 'react';
import { dayKey, hmToMinutes, minutesNow } from './date';
import { isVisibleOn } from '../game/schedule';
import { useGame } from '../state/store';
import { useUi } from '../state/ui';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

async function notify(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) {
        await reg.showNotification(title, { body, icon: './pwa-192.png', badge: './pwa-192.png', tag: title });
        return;
      }
      new Notification(title, { body, icon: './pwa-192.png' });
      return;
    } catch {
      // fall through to in-app toast
    }
  }
  useUi.getState().pushNotices([{ kind: 'info', emoji: '⏰', text: `${title}: ${body}` }]);
}

/**
 * While the app is open, fire reminders for today's goals with a reminder time,
 * plus a gentle check-in at wake time. (Browsers can't schedule local notifications
 * reliably when the app is fully closed without a push server.)
 */
export function useReminders() {
  const goals = useGame((s) => s.goals);
  const days = useGame((s) => s.days);
  const settings = useGame((s) => s.settings);
  const birbName = useGame((s) => s.birb.name);
  const onboarded = useGame((s) => s.onboarded);

  useEffect(() => {
    if (!onboarded) return;
    const timers: number[] = [];
    const now = Date.now();
    const today = dayKey(now, settings.dayStartHour);
    const nowMin = minutesNow(now);
    const ctx = { days, weekStartsOn: settings.weekStartsOn };
    const schedule = (hm: string, fn: () => void) => {
      const delta = hmToMinutes(hm) - nowMin;
      if (delta <= 0 || delta > 24 * 60) return;
      timers.push(window.setTimeout(fn, delta * 60_000 - (now % 60_000)));
    };
    for (const g of goals) {
      if (!g.reminder || g.status !== 'active') continue;
      if (!isVisibleOn(g, today, ctx)) continue;
      if ((days[today]?.goals[g.id]?.count ?? 0) >= g.timesPerDay) continue;
      schedule(g.reminder, () => void notify(`${g.emoji} ${g.title}`, `${birbName} is cheering you on!`));
    }
    if (settings.notifications) {
      schedule(settings.wakeTime, () => void notify(`Good morning from ${birbName}!`, 'Ready to check in and set up your day?'));
    }
    return () => timers.forEach(clearTimeout);
  }, [goals, days, settings, birbName, onboarded]);
}
