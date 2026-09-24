import { useState } from 'react';
import { LocationScene } from '../art/misc';
import { LOCATIONS, type LocationDef } from '../data/locations';
import { formatDay } from '../lib/date';
import { useGame } from '../state/store';
import { Page, Progress, Sheet, cx } from '../ui/kit';

export default function Places() {
  const visited = useGame((s) => s.travel.visited);
  const current = useGame((s) => s.travel.location);
  const [open, setOpen] = useState<LocationDef | null>(null);
  const count = Object.keys(visited).length;
  return (
    <Page back title="Places" subtitle={`${count} of ${LOCATIONS.length} visited`}>
      <div className="grid grid-cols-2 gap-2">
        {LOCATIONS.map((l) => {
          const v = visited[l.id];
          const pct = v ? v.found.length / l.discoveries.length : 0;
          return (
            <button key={l.id} onClick={() => setOpen(l)} className={cx('rounded-3xl overflow-hidden shadow-card text-left bg-surface active:scale-[0.98] transition', !v && 'opacity-60')}>
              <div className={cx('h-20', !v && 'grayscale')}>
                <LocationScene locationId={l.id} className="w-full h-full" fill />
              </div>
              <div className="p-2.5">
                <p className="font-black text-sm truncate">
                  {current === l.id && '📍 '}
                  {v ? l.name : '???'}
                </p>
                <p className="text-[11px] text-muted truncate">{l.region}</p>
                {v && <Progress value={pct} max={1} className="h-1.5 mt-1.5" barClass={pct >= 1 ? 'bg-energy' : 'bg-accent'} />}
              </div>
            </button>
          );
        })}
      </div>
      {open && (
        <Sheet open onClose={() => setOpen(null)} title={`${open.emoji} ${visited[open.id] ? open.name : 'Undiscovered place'}`}>
          <div className={cx('rounded-3xl overflow-hidden', !visited[open.id] && 'grayscale')}>
            <LocationScene locationId={open.id} className="w-full" />
          </div>
          <p className="mt-3">{open.blurb}</p>
          {visited[open.id] && <p className="text-xs text-muted mt-1">First visited {formatDay(visited[open.id].firstDay, 'MMM d, yyyy')}</p>}
          <p className="font-black text-sm mt-4 mb-2">
            Special discoveries ({visited[open.id]?.found.length ?? 0}/{open.discoveries.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {open.discoveries.map((d) => {
              const found = visited[open.id]?.found.includes(d.id);
              return (
                <div key={d.id} className="rounded-2xl bg-surface p-2 text-center">
                  <span className={cx('text-3xl block', !found && 'brightness-0 opacity-20')}>{d.emoji}</span>
                  <span className="text-[10px] font-bold">{found ? d.name : '???'}</span>
                </div>
              );
            })}
          </div>
        </Sheet>
      )}
    </Page>
  );
}
