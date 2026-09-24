import { useState } from 'react';
import { Egg } from '../art/misc';
import { Micropet } from '../art/Micropet';
import { MICROPET_SPECIES, SPECIES_MAP } from '../data/micropets';
import { EGG_HATCH_COUNT, MICROPET_GROW_ADVENTURES } from '../game/constants';
import { useGame } from '../state/store';
import type { Micropet as Pet } from '../state/types';
import { Button, Card, Confirm, Field, Page, Progress, SectionTitle, Sheet, Toggle, cx, inputClass } from '../ui/kit';

function PetSheet({ pet, onClose }: { pet: Pet; onClose: () => void }) {
  const active = useGame((s) => s.birb.activeMicropet);
  const birbName = useGame((s) => s.birb.name);
  const a = useGame((s) => s.actions);
  const [name, setName] = useState(pet.name);
  const [confirm, setConfirm] = useState(false);
  const sp = SPECIES_MAP[pet.species];
  const grown = pet.growable && pet.adventures >= MICROPET_GROW_ADVENTURES;
  return (
    <Sheet open onClose={onClose} title={`${pet.name} the ${sp?.kind}`}>
      <Micropet species={pet.species} variant={pet.variant} grown={grown} className="w-40 h-40 mx-auto" />
      <p className="text-center text-sm text-muted">
        {pet.nature} · {grown ? 'Adult' : 'Baby'} · {pet.adventures} adventure{pet.adventures === 1 ? '' : 's'}
      </p>
      <Field label="Name">
        <div className="flex gap-2">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          <Button variant="soft" disabled={!name.trim() || name === pet.name} onClick={() => a.updateMicropet(pet.id, { name: name.trim() })}>
            Save
          </Button>
        </div>
      </Field>
      {!grown && (
        <Toggle
          checked={pet.growable}
          onChange={(growable) => a.updateMicropet(pet.id, { growable })}
          label="Can grow up"
          hint={pet.growable ? `Grows up after ${MICROPET_GROW_ADVENTURES} adventures as ${birbName}'s companion.` : 'Stays a baby forever.'}
        />
      )}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {active === pet.id ? (
          <Button variant="outline" onClick={() => a.setActiveMicropet(undefined)}>
            Stay home
          </Button>
        ) : (
          <Button onClick={() => { a.setActiveMicropet(pet.id); onClose(); }}>Bring along</Button>
        )}
        <Button variant="danger" onClick={() => setConfirm(true)}>
          Release
        </Button>
      </div>
      <Confirm
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          a.releaseMicropet(pet.id);
          onClose();
        }}
        title={`Release ${pet.name}?`}
        body="They'll return to the wild. You may hatch another one like them someday."
        confirmLabel="Release"
        danger
      />
    </Sheet>
  );
}

export default function Pets() {
  const egg = useGame((s) => s.egg);
  const pets = useGame((s) => s.micropets);
  const active = useGame((s) => s.birb.activeMicropet);
  const goals = useGame((s) => s.goals);
  const a = useGame((s) => s.actions);
  const [open, setOpen] = useState<Pet | null>(null);
  const [linking, setLinking] = useState(false);
  const linked = goals.find((g) => g.id === egg?.linkedGoalId);
  const repeatGoals = goals.filter((g) => g.status === 'active' && g.schedule.type !== 'once');
  const met = new Set(pets.map((p) => p.species));

  return (
    <Page back title="Micropets" subtitle={`${pets.length} friend${pets.length === 1 ? '' : 's'} · ${met.size}/${MICROPET_SPECIES.length} species`}>
      <Card className="bg-gradient-to-br from-energy-soft to-surface">
        <p className="text-xs font-black uppercase tracking-wide text-muted">🧪 Professor Oat's Lab</p>
        {egg ? (
          <div className="flex items-center gap-4 mt-2">
            <Egg color="#f3e3b5" progress={egg.progress} total={EGG_HATCH_COUNT} className="w-20 h-24 shrink-0" wobble />
            <div className="flex-1 min-w-0">
              {linked ? (
                <>
                  <p className="font-black leading-tight">
                    Linked to {linked.emoji} {linked.title}
                  </p>
                  <Progress value={egg.progress} max={EGG_HATCH_COUNT} className="mt-2" barClass="bg-warm" />
                  <p className="text-xs text-muted mt-1">
                    {EGG_HATCH_COUNT - egg.progress} more completion{EGG_HATCH_COUNT - egg.progress === 1 ? '' : 's'} to hatch
                  </p>
                  <Button size="sm" variant="ghost" className="mt-1 -ml-3" onClick={() => setLinking(true)}>
                    Change goal (resets progress)
                  </Button>
                </>
              ) : (
                <>
                  <p className="font-black">Your egg is waiting!</p>
                  <p className="text-sm text-muted">Link it to a goal. Complete that goal {EGG_HATCH_COUNT} times to hatch it.</p>
                  <Button size="sm" className="mt-2" onClick={() => setLinking(true)}>
                    Link a goal
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-2">
            <Egg color="#f3e3b5" className="w-16 h-20 shrink-0" />
            <div>
              <p className="font-black">"I have a fresh egg for you!"</p>
              <Button size="sm" className="mt-2" onClick={() => a.takeEgg()}>
                Take the egg
              </Button>
            </div>
          </div>
        )}
      </Card>

      <SectionTitle>Playland</SectionTitle>
      {pets.length ? (
        <div className="grid grid-cols-3 gap-2 rounded-[28px] bg-gradient-to-b from-sky-soft to-accent-soft p-3">
          {pets.map((p) => (
            <button key={p.id} onClick={() => setOpen(p)} className={cx('rounded-2xl p-1 text-center transition active:scale-95', active === p.id && 'bg-surface/70 ring-2 ring-accent')}>
              <Micropet species={p.species} variant={p.variant} grown={p.growable && p.adventures >= MICROPET_GROW_ADVENTURES} className="w-full aspect-square" />
              <p className="text-xs font-black truncate">
                {active === p.id && '⭐ '}
                {p.name}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted text-center py-6">No micropets yet. Hatch an egg to meet your first!</p>
      )}

      <SectionTitle>Micropedia</SectionTitle>
      <div className="grid grid-cols-5 gap-1.5">
        {MICROPET_SPECIES.map((sp) => (
          <div key={sp.id} className="rounded-2xl bg-surface p-1 text-center" title={met.has(sp.id) ? `${sp.name} the ${sp.kind}` : '???'}>
            <div className={cx(!met.has(sp.id) && 'brightness-0 opacity-20')}>
              <Micropet species={sp.id} bounce={false} className="w-full aspect-square" />
            </div>
            <p className="text-[9px] font-bold truncate">{met.has(sp.id) ? sp.kind : sp.eventOnly ? 'Event' : '???'}</p>
          </div>
        ))}
      </div>

      {open && <PetSheet pet={pets.find((p) => p.id === open.id) ?? open} onClose={() => setOpen(null)} />}
      <Sheet open={linking} onClose={() => setLinking(false)} title="Link egg to a goal">
        <p className="text-sm text-muted mb-3">Pick a repeating goal. Easy goals hatch faster; harder ones make the egg a fun motivator.</p>
        <div className="flex flex-col gap-2">
          {repeatGoals.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                a.linkEgg(g.id);
                setLinking(false);
              }}
              className={cx('flex items-center gap-3 rounded-2xl bg-surface px-3 h-14 text-left border-2', egg?.linkedGoalId === g.id ? 'border-accent' : 'border-transparent')}
            >
              <span className="text-2xl">{g.emoji}</span>
              <span className="font-bold truncate">{g.title}</span>
            </button>
          ))}
          {!repeatGoals.length && <p className="text-sm text-muted">Add a repeating goal first.</p>}
        </div>
      </Sheet>
    </Page>
  );
}
