import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDay } from '../lib/date';
import { requestNotificationPermission } from '../lib/reminders';
import { useStreak } from '../state/hooks';
import { listAutoBackups, readAutoBackup, useGame } from '../state/store';
import { Button, Card, Confirm, Field, Page, SectionTitle, Segmented, Sheet, Stepper, Toggle, cx, inputClass } from '../ui/kit';

function download(name: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Settings() {
  const nav = useNavigate();
  const settings = useGame((s) => s.settings);
  const pause = useGame((s) => s.pause);
  const streakState = useGame((s) => s.streak);
  const birbName = useGame((s) => s.birb.name);
  const a = useGame((s) => s.actions);
  const streak = useStreak();
  const set = a.updateSettings;
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [pauseDays, setPauseDays] = useState(3);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [reset, setReset] = useState(false);
  const [resetText, setResetText] = useState('');
  const notifSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [autoBackups, setAutoBackups] = useState<string[]>([]);
  useEffect(() => {
    void listAutoBackups().then(setAutoBackups);
  }, []);

  return (
    <Page back title="Settings">
      <SectionTitle>You</SectionTitle>
      <Card>
        <Field label="Your name">
          <input className={inputClass} value={settings.userName} onChange={(e) => set({ userName: e.target.value })} />
        </Field>
        <Button variant="outline" block onClick={() => nav('/birb')}>
          🐤 Edit {birbName}'s name & pronouns
        </Button>
      </Card>

      <SectionTitle>Daily rhythm</SectionTitle>
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <Field label="🌅 Wake up">
            <input type="time" className={cx(inputClass, 'px-2.5 text-sm')} value={settings.wakeTime} onChange={(e) => set({ wakeTime: e.target.value })} />
          </Field>
          <Field label="🌙 Bedtime">
            <input type="time" className={cx(inputClass, 'px-2.5 text-sm')} value={settings.bedTime} onChange={(e) => set({ bedTime: e.target.value })} />
          </Field>
        </div>
        <div className="flex items-center justify-between py-2">
          <span>
            <span className="font-bold block">New day starts at</span>
            <span className="text-sm text-muted">Night owls: late-night goals count for the previous day.</span>
          </span>
          <Stepper value={settings.dayStartHour} min={0} max={8} suffix=":00" onChange={(dayStartHour) => set({ dayStartHour })} />
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="font-bold">Week starts on</span>
          <Segmented
            className="w-32"
            value={settings.weekStartsOn}
            onChange={(weekStartsOn) => set({ weekStartsOn })}
            options={[
              { value: 0, label: 'Sun' },
              { value: 1, label: 'Mon' },
            ]}
          />
        </div>
      </Card>

      <SectionTitle>Experience</SectionTitle>
      <Card>
        <p className="font-bold mb-2">When you finish a goal</p>
        <Segmented
          value={settings.celebration}
          onChange={(celebration) => set({ celebration })}
          options={[
            { value: 'cheers', label: '🎉 Quick cheer' },
            { value: 'reflect', label: '📝 Prompt to reflect' },
            { value: 'quiet', label: '🤫 Quiet' },
          ]}
        />
        <div className="mt-3">
          <p className="font-bold mb-2">Theme</p>
          <Segmented
            value={settings.theme}
            onChange={(theme) => set({ theme })}
            options={[
              { value: 'system', label: 'Auto' },
              { value: 'light', label: '☀️ Light' },
              { value: 'dark', label: '🌙 Dark' },
            ]}
          />
        </div>
        <div className="mt-2">
          <Toggle checked={settings.sound} onChange={(sound) => set({ sound })} label="Sound effects" />
          <Toggle checked={settings.streaksEnabled} onChange={(streaksEnabled) => set({ streaksEnabled })} label="Show streaks" hint={`Current ${streak.current} · longest ${Math.max(streakState.longest, streak.current)} · ${streakState.repairs} repair${streakState.repairs === 1 ? '' : 's'} left`} />
          <Toggle checked={settings.autoTag} onChange={(autoTag) => set({ autoTag })} label="Auto-tag reflections" hint="Detect people, activities and feelings in your writing (on-device)." />
        </div>
      </Card>

      <SectionTitle>Reminders</SectionTitle>
      <Card>
        <Toggle
          checked={settings.notifications}
          onChange={async (on) => {
            if (on && !(await requestNotificationPermission())) {
              set({ notifications: false });
              return;
            }
            set({ notifications: on });
          }}
          label="Notifications"
          hint={notifSupported ? 'Morning check-in and goal reminders.' : 'Not supported in this browser.'}
        />
        <p className="text-xs text-muted mt-1">
          Reminders fire while the app is open (or installed and running in the background). Browsers can't wake a closed web app on their own. Set a reminder time on any goal from its edit screen.
        </p>
      </Card>

      <SectionTitle>Pause mode</SectionTitle>
      <Card>
        {pause ? (
          <>
            <p className="font-bold">⏸️ Paused until {formatDay(pause.until)}</p>
            <p className="text-sm text-muted">Your streak is protected.</p>
            <Button className="mt-3" onClick={() => a.endPause()}>
              End pause
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">Taking a break? Pause for up to 7 days and your streak stays safe.</p>
            <Button variant="soft" className="mt-3" onClick={() => setPauseOpen(true)}>
              Start a pause
            </Button>
          </>
        )}
      </Card>

      <SectionTitle>Your data</SectionTitle>
      <Card>
        <p className="text-sm text-muted mb-3">Everything is stored privately on this device. Export a backup regularly—especially before clearing browser data or switching phones.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="soft" onClick={() => download(`finch-backup-${new Date().toISOString().slice(0, 10)}.json`, a.exportData())}>
            ⬇️ Export backup
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            ⬆️ Import backup
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            setPendingImport(await f.text());
          }}
        />
        {importMsg && <p className="text-sm font-bold mt-3">{importMsg}</p>}
        {autoBackups.length > 0 && (
          <div className="mt-4">
            <p className="font-bold text-sm">Automatic daily snapshots</p>
            <p className="text-xs text-muted mb-2">Saved on this device at the start of each day (last 7 kept).</p>
            <div className="flex flex-wrap gap-1.5">
              {autoBackups.map((d) => (
                <button
                  key={d}
                  className="h-8 px-3 rounded-full bg-surface-2 text-xs font-bold"
                  onClick={async () => {
                    const json = await readAutoBackup(d);
                    if (json) setPendingImport(json);
                  }}
                >
                  ↩️ {formatDay(d, 'MMM d')}
                </button>
              ))}
            </div>
          </div>
        )}
        <Button variant="danger" block className="mt-4" onClick={() => setReset(true)}>
          Start over…
        </Button>
      </Card>

      <p className="text-center text-xs text-muted mt-8">
        A personal, subscription-free take on the Finch self-care pet.
        <br />
        No accounts, no ads, no tracking.
      </p>

      <Sheet open={pauseOpen} onClose={() => setPauseOpen(false)} title="Pause mode">
        <div className="flex items-center justify-between">
          <span className="font-bold">Pause for</span>
          <Stepper value={pauseDays} min={1} max={7} suffix=" days" onChange={setPauseDays} />
        </div>
        <Button
          block
          size="lg"
          className="mt-5"
          onClick={() => {
            a.startPause(pauseDays);
            setPauseOpen(false);
          }}
        >
          Pause
        </Button>
      </Sheet>

      <Confirm
        open={!!pendingImport}
        onClose={() => setPendingImport(null)}
        onConfirm={() => {
          const ok = pendingImport ? a.importData(pendingImport) : false;
          setImportMsg(ok ? '✅ Backup restored.' : "❌ That file doesn't look like a backup from this app.");
        }}
        title="Restore this backup?"
        body="This replaces everything currently in the app with the backup's contents."
        confirmLabel="Restore"
      />

      <Sheet open={reset} onClose={() => setReset(false)} title="Start over?">
        <p className="text-muted mb-3">This permanently erases your birb, goals, journal, and everything else on this device. Export a backup first if you might want it. Type RESET to confirm.</p>
        <input className={inputClass} value={resetText} onChange={(e) => setResetText(e.target.value)} placeholder="RESET" />
        <Button
          variant="danger"
          block
          size="lg"
          className="mt-4"
          disabled={resetText !== 'RESET'}
          onClick={() => {
            a.resetAll();
            setReset(false);
            nav('/');
          }}
        >
          Erase everything
        </Button>
      </Sheet>
    </Page>
  );
}
