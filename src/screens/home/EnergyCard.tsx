import { Birb } from '../../art/Birb';
import { Bolt, LocationScene } from '../../art/misc';
import { ADVENTURE_ACTIVITIES } from '../../data/dialogue';
import { LOCATION_MAP } from '../../data/locations';
import { MINUTES_PER_ENERGY } from '../../game/constants';
import { formatDuration } from '../../lib/date';
import { useDay, useNow, useStage, useToday } from '../../state/hooks';
import { useGame } from '../../state/store';
import { Progress } from '../../ui/kit';

export function EnergyCard() {
  const adventure = useGame((s) => s.adventure);
  const birb = useGame((s) => s.birb);
  const ticket = useGame((s) => s.travel.ticket);
  const location = useGame((s) => s.travel.location);
  const today = useToday();
  const day = useDay(today);
  const stage = useStage();
  const now = useNow(15_000);
  const need = stage.fullEnergy;
  const name = birb.name;

  if (adventure.status === 'adventuring' && adventure.startedAt && adventure.endsAt) {
    const total = adventure.endsAt - adventure.startedAt;
    const left = Math.max(0, adventure.endsAt - now);
    const done = total - left;
    const activity = ADVENTURE_ACTIVITIES[Math.floor(now / 1_800_000) % ADVENTURE_ACTIVITIES.length];
    const dest = adventure.destination ? LOCATION_MAP[adventure.destination] : undefined;
    return (
      <div className="rounded-3xl bg-surface shadow-card overflow-hidden">
        <div className="relative h-28">
          <LocationScene locationId={adventure.destination ?? location} className="absolute inset-0 w-full h-full" fill />
          <div className="absolute bottom-1 walk" style={{ left: `${8 + (done / total) * 70}%` }}>
            <Birb colors={birb.colors} outfit={{ ...birb.outfit, back: birb.outfit.back ?? 'backpack:green' }} scale={stage.scale} className="w-20 h-20" animate={false} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-black">{dest ? `✈️ Flying to ${dest.name}` : `🎒 ${name} is ${activity}`}</p>
            <span className="text-sm font-extrabold text-accent shrink-0">{formatDuration(left)} left</span>
          </div>
          <Progress value={done} max={total} className="mt-2 h-3.5" barClass="bg-accent" />
          <p className="text-xs text-muted mt-2">Every goal you finish brings {birb.pronouns.object} home sooner ({MINUTES_PER_ENERGY} min per ⚡).</p>
        </div>
      </div>
    );
  }

  if (adventure.status === 'home') {
    return (
      <div className="rounded-3xl bg-surface shadow-card p-4 flex items-center gap-3">
        <span className="text-3xl">🌟</span>
        <div className="flex-1">
          <p className="font-black">Today's adventure is complete!</p>
          <p className="text-sm text-muted">Goals still earn rainbow stones. Energy today: {day.energy} ⚡</p>
        </div>
      </div>
    );
  }

  const pct = Math.min(1, day.energy / need);
  return (
    <div className="rounded-3xl bg-surface shadow-card p-4">
      <div className="flex items-center justify-between">
        <p className="font-black flex items-center gap-1.5">
          <Bolt className="w-5 h-5" /> Energy
        </p>
        <p className="font-extrabold text-sm">
          {day.energy} / {need}
        </p>
      </div>
      <div className="mt-2 h-4 rounded-full bg-surface-3 overflow-hidden">
        <div className="h-full rounded-full shimmer transition-[width] duration-700" style={{ width: `${pct * 100}%` }} />
      </div>
      <p className="text-xs text-muted mt-2">
        {day.energy === 0
          ? `Complete goals to give ${name} energy. At full power, ${birb.pronouns.subject} ${birb.pronouns.subject === 'they' ? 'go' : 'goes'} on an adventure!`
          : `${need - day.energy} more energy until ${ticket ? `${name} flies to ${LOCATION_MAP[ticket]?.name}` : 'adventure time'}!`}
      </p>
    </div>
  );
}
