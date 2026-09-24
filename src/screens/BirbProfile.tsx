import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInCalendarDays } from 'date-fns';
import { Birb } from '../art/Birb';
import { Micropet } from '../art/Micropet';
import { CHALLENGE_MAP } from '../data/challenges';
import { LOCATION_MAP } from '../data/locations';
import { FRIENDSHIP_LEVELS, MICROPET_GROW_ADVENTURES, PRONOUN_PRESETS, STAGES, TRAITS, friendshipLevel, nextFriendshipLevel, nextStage } from '../game/constants';
import { useStage } from '../state/hooks';
import { useGame } from '../state/store';
import type { Pronouns } from '../state/types';
import { Button, Card, Field, Page, Progress, SectionTitle, Sheet, cx, inputClass } from '../ui/kit';

function EditSheet({ onClose }: { onClose: () => void }) {
  const birb = useGame((s) => s.birb);
  const updateBirb = useGame((s) => s.actions.updateBirb);
  const [name, setName] = useState(birb.name);
  const [pronouns, setPronouns] = useState<Pronouns>(birb.pronouns);
  return (
    <Sheet open onClose={onClose} title="Edit birb">
      <Field label="Name">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Pronouns">
        <div className="flex flex-wrap gap-2 mb-2">
          {PRONOUN_PRESETS.map((p) => (
            <button key={p.subject} onClick={() => setPronouns(p)} className={cx('px-4 h-10 rounded-full font-bold border', pronouns.subject === p.subject ? 'bg-accent text-accent-ink border-accent' : 'bg-surface border-line')}>
              {p.subject}/{p.object}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['subject', 'object', 'possessive'] as const).map((k) => (
            <input key={k} className={cx(inputClass, 'h-10 text-sm px-3')} placeholder={k} value={pronouns[k]} onChange={(e) => setPronouns({ ...pronouns, [k]: e.target.value })} />
          ))}
        </div>
      </Field>
      <Button
        block
        size="lg"
        disabled={!name.trim()}
        onClick={() => {
          updateBirb({ name: name.trim(), pronouns });
          onClose();
        }}
      >
        Save
      </Button>
    </Sheet>
  );
}

export default function BirbProfile() {
  const nav = useNavigate();
  const birb = useGame((s) => s.birb);
  const friendship = useGame((s) => s.friendship);
  const discoveries = useGame((s) => s.discoveries);
  const visited = useGame((s) => s.travel.visited);
  const location = useGame((s) => s.travel.location);
  const micropets = useGame((s) => s.micropets);
  const challenges = useGame((s) => s.challenges);
  const inventory = useGame((s) => s.inventory);
  const stage = useStage();
  const [editing, setEditing] = useState(false);
  const next = nextStage(birb.adventures);
  const level = friendshipLevel(friendship.points);
  const nextLevel = nextFriendshipLevel(friendship.points);
  const age = differenceInCalendarDays(Date.now(), birb.hatchedAt) + 1;
  const pet = micropets.find((m) => m.id === birb.activeMicropet);
  const traits = useMemo(() => [...TRAITS].map((t) => ({ ...t, v: birb.traits[t.id] ?? 0 })).sort((a, b) => b.v - a.v), [birb.traits]);
  const maxTrait = Math.max(1, ...traits.map((t) => t.v));
  const finished = challenges.filter((c) => c.finishedDay);
  const likes = discoveries.filter((d) => d.opinion === 'love' || d.opinion === 'like').length;
  const clothes = Object.keys(inventory).filter((id) => !id.startsWith('dye:')).length;

  return (
    <Page title={birb.name} subtitle={`${birb.pronouns.subject}/${birb.pronouns.object} · ${age} day${age === 1 ? '' : 's'} old`} right={<Button size="sm" variant="ghost" onClick={() => setEditing(true)}>✏️</Button>}>
      <div className="relative rounded-[28px] bg-gradient-to-b from-sky-soft to-accent-soft shadow-card pt-2 pb-4 text-center">
        <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} className="w-52 h-52 mx-auto" />
        {pet && (
          <div className="absolute left-4 bottom-12">
            <Micropet species={pet.species} variant={pet.variant} grown={pet.growable && pet.adventures >= MICROPET_GROW_ADVENTURES} className="w-16 h-16" />
          </div>
        )}
        <p className="font-black text-lg">
          {stage.label} · {LOCATION_MAP[location]?.emoji} {LOCATION_MAP[location]?.name}
        </p>
        <div className="grid grid-cols-3 gap-2 px-4 mt-3">
          <button onClick={() => nav('/birb/wardrobe')} className="rounded-2xl bg-surface/80 h-16 font-bold text-sm flex flex-col items-center justify-center">
            <span className="text-2xl leading-none">👒</span>
            Wardrobe
          </button>
          <button onClick={() => nav('/birb/room')} className="rounded-2xl bg-surface/80 h-16 font-bold text-sm flex flex-col items-center justify-center">
            <span className="text-2xl leading-none">🛋️</span>
            Decorate
          </button>
          <button onClick={() => nav('/birb/pets')} className="rounded-2xl bg-surface/80 h-16 font-bold text-sm flex flex-col items-center justify-center">
            <span className="text-2xl leading-none">🐾</span>
            Micropets
          </button>
        </div>
      </div>

      <SectionTitle>Growing up</SectionTitle>
      <Card>
        <div className="flex justify-between text-xs font-bold text-muted">
          {STAGES.map((s) => (
            <span key={s.id} className={cx(stage.id === s.id && 'text-accent font-black')}>
              {s.label}
            </span>
          ))}
        </div>
        <Progress value={birb.adventures} max={STAGES[STAGES.length - 1].startsAt} className="mt-2" />
        <p className="text-sm mt-2">
          {birb.adventures} adventure{birb.adventures === 1 ? '' : 's'}.{' '}
          {next ? `${next.startsAt - birb.adventures} more until ${birb.pronouns.subject} ${birb.pronouns.subject === 'they' ? 'become' : 'becomes'} ${/^[aeiou]/i.test(next.label) ? 'an' : 'a'} ${next.label.toLowerCase()}.` : 'Fully grown! 🎓'}
        </p>
      </Card>

      <SectionTitle>Friendship</SectionTitle>
      <Card>
        <div className="flex items-center justify-between">
          <p className="font-black">
            {level ? `${level.heart} ${level.name}` : '🤍 Just met'} <span className="text-xs text-muted">Lv {level?.level ?? 0}/{FRIENDSHIP_LEVELS.length}</span>
          </p>
          <p className="text-sm font-bold text-muted">{friendship.points} pts</p>
        </div>
        {nextLevel && <Progress value={friendship.points - (level?.points ?? 0)} max={nextLevel.points - (level?.points ?? 0)} className="mt-2" barClass="bg-[#f29bb5]" />}
        <p className="text-xs text-muted mt-2">
          Stroke {birb.name} on the home screen to pet {birb.pronouns.object}. Adventures build friendship too. {level && `Each adventure earns +${level.bonus} bonus stones.`}
        </p>
      </Card>

      <SectionTitle>Personality</SectionTitle>
      <Card>
        <div className="flex flex-col gap-2">
          {traits.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <span className="w-28 text-sm font-bold">
                {t.emoji} {t.label}
              </span>
              <Progress value={t.v} max={maxTrait} className="flex-1 h-2.5" barClass="bg-warm" />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">Shaped by how you respond to {birb.pronouns.possessive} discoveries.</p>
      </Card>

      <SectionTitle>Collections</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <Card onClick={() => nav('/birb/logbook')} className="p-3">
          <p className="text-2xl">📗</p>
          <p className="font-black">Logbook</p>
          <p className="text-xs text-muted">
            {discoveries.length} discover{discoveries.length === 1 ? 'y' : 'ies'} · {likes} like{likes === 1 ? '' : 's'}
          </p>
        </Card>
        <Card onClick={() => nav('/birb/places')} className="p-3">
          <p className="text-2xl">🗺️</p>
          <p className="font-black">Places</p>
          <p className="text-xs text-muted">{Object.keys(visited).length} visited</p>
        </Card>
        <Card onClick={() => nav('/birb/pets')} className="p-3">
          <p className="text-2xl">🐾</p>
          <p className="font-black">Micropets</p>
          <p className="text-xs text-muted">{micropets.length} friends</p>
        </Card>
        <Card onClick={() => nav('/birb/wardrobe')} className="p-3">
          <p className="text-2xl">🧺</p>
          <p className="font-black">Bag</p>
          <p className="text-xs text-muted">{clothes} items</p>
        </Card>
      </div>

      {finished.length > 0 && (
        <>
          <SectionTitle>Challenge awards</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {finished.map((c) => (
              <span key={c.id} className="rounded-full bg-surface shadow-card px-3 h-9 inline-flex items-center gap-1.5 font-bold text-sm">
                {CHALLENGE_MAP[c.id]?.emoji} {CHALLENGE_MAP[c.id]?.name}
              </span>
            ))}
          </div>
        </>
      )}
      {editing && <EditSheet onClose={() => setEditing(false)} />}
    </Page>
  );
}
