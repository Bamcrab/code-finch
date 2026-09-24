import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Birb } from '../../art/Birb';
import { Micropet } from '../../art/Micropet';
import { DyeBottle } from '../../art/misc';
import { ITEMS, PART_LABELS } from '../../data/catalog';
import { CATEGORY_MAP, OPINION_LINES } from '../../data/discoveries';
import { LOCATION_MAP } from '../../data/locations';
import { SPECIES_MAP } from '../../data/micropets';
import { STAGES, stageFor } from '../../game/constants';
import { useGame } from '../../state/store';
import type { BodyPart, PendingReturn } from '../../state/types';
import { Button, cx, Sheet } from '../../ui/kit';
import { Confetti } from '../../ui/overlays';

type Step = 'hello' | 'discovery' | 'reply' | 'grow' | 'pet';

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function ReturnDialog({ ret, onClose }: { ret: PendingReturn; onClose: () => void }) {
  const nav = useNavigate();
  const birb = useGame((s) => s.birb);
  const discovery = useGame((s) => s.discoveries.find((d) => d.id === ret.discoveryId));
  const pet = useGame((s) => s.micropets.find((m) => m.id === ret.micropetGrew));
  const inventory = useGame((s) => s.inventory);
  const a = useGame((s) => s.actions);
  const [step, setStep] = useState<Step>('hello');
  const [answer, setAnswer] = useState<number | null>(null);
  const stage = stageFor(birb.adventures);
  const newStage = ret.stageUp ? STAGES.find((s) => s.id === ret.stageUp) : undefined;
  const [chosen, setChosen] = useState<Partial<Record<BodyPart, string>>>({});

  const colorOptions = useMemo(() => {
    const out: Partial<Record<BodyPart, string[]>> = {};
    for (const part of newStage?.unlocksParts ?? []) {
      const pool = ITEMS.filter((i) => i.kind === 'dye' && i.slot === part && !inventory[i.id]);
      out[part] = [...pool].sort(() => Math.random() - 0.5).slice(0, 3).map((i) => i.id);
    }
    return out;
  }, [newStage]); // eslint-disable-line react-hooks/exhaustive-deps

  const opinionLine = useMemo(() => (discovery ? pick(OPINION_LINES[discovery.opinion]) : ''), [discovery]);
  const intro = useMemo(() => (discovery ? pick(CATEGORY_MAP[discovery.category]?.intro ?? ['Look what I found!']) : ''), [discovery]);
  const loc = LOCATION_MAP[ret.traveledTo ?? ret.locationId];

  const finish = () => {
    for (const id of Object.values(chosen)) if (id) a.chooseStageColor(id);
    a.finishReturn(ret.id);
    onClose();
  };

  const afterReply = () => {
    if (newStage) setStep('grow');
    else if (pet) setStep('pet');
    else finish();
  };

  const previewColors = { ...birb.colors };
  for (const [part, id] of Object.entries(chosen)) {
    const it = ITEMS.find((i) => i.id === id);
    if (it) previewColors[part as BodyPart] = it.color;
  }

  return (
    <Sheet open onClose={finish}>
      {step === 'hello' && (
        <div className="text-center">
          <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression="happy" flap className="w-44 h-44 mx-auto" />
          <h2 className="text-2xl font-black">{ret.traveledTo ? `${birb.name} landed in ${loc?.name}! ${loc?.emoji}` : `${birb.name} is back!`}</h2>
          <p className="text-muted mt-1">{ret.traveledTo ? loc?.blurb : `${birb.pronouns.subject[0].toUpperCase() + birb.pronouns.subject.slice(1)} had a wonderful adventure${loc && loc.id !== 'forest' ? ` in ${loc.name}` : ''}.`}</p>
          <Button className="mt-6" block size="lg" onClick={() => setStep(discovery ? 'discovery' : 'reply')}>
            What did you find?
          </Button>
        </div>
      )}

      {step === 'discovery' && discovery && (
        <div className="text-center">
          <div className="text-7xl my-3 pop-in">{discovery.emoji}</div>
          <p className="text-muted font-bold">{intro}</p>
          <h2 className="text-2xl font-black mt-1">{discovery.name}</h2>
          <p className="mt-2">“{discovery.blurb}”</p>
          {discovery.locationSpecific && <p className="text-xs font-extrabold text-accent mt-2">📍 Special {loc?.name} discovery!</p>}
          <div className="flex flex-col gap-2 mt-6">
            {discovery.responses.map((r, i) => (
              <Button
                key={i}
                variant="outline"
                block
                onClick={() => {
                  setAnswer(i);
                  a.answerDiscovery(discovery.id, i);
                  setStep('reply');
                }}
              >
                {r.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {step === 'reply' && (
        <div className="text-center">
          <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} expression={discovery?.opinion === 'dislike' ? 'wink' : 'happy'} className="w-40 h-40 mx-auto" />
          {discovery ? (
            <>
              <p className="text-xl font-black">“{opinionLine}”</p>
              {answer !== null && <p className="text-sm text-muted mt-2">{birb.name} loved hearing that. It'll shape who {birb.pronouns.subject} {birb.pronouns.subject === 'they' ? 'become' : 'becomes'}.</p>}
              <p className="text-xs text-muted mt-3">
                {discovery.opinion === 'love' || discovery.opinion === 'like' ? '💙 Added to Likes' : discovery.opinion === 'dislike' ? '❤️‍🩹 Added to Dislikes' : '📗 Added to the logbook'}
              </p>
            </>
          ) : (
            <p className="text-xl font-black">“That was fun! Let's go again tomorrow!”</p>
          )}
          <div className="grid grid-cols-2 gap-2 mt-6">
            {discovery && (
              <Button
                variant="soft"
                onClick={() => {
                  a.finishReturn(ret.id);
                  for (const id of Object.values(chosen)) if (id) a.chooseStageColor(id);
                  onClose();
                  nav(`/care/reflect/free?discovery=${discovery.id}`);
                }}
              >
                📝 Reflect
              </Button>
            )}
            <Button className={cx(!discovery && 'col-span-2')} onClick={afterReply}>
              {newStage || pet ? 'Next' : 'Done'}
            </Button>
          </div>
        </div>
      )}

      {step === 'grow' && newStage && (
        <div className="text-center">
          <Confetti />
          <Birb colors={previewColors} outfit={birb.outfit} scale={newStage.scale} expression="happy" flap className="w-44 h-44 mx-auto" />
          <h2 className="text-2xl font-black">{birb.name} grew into {/^[aeiou]/i.test(newStage.label) ? 'an' : 'a'} {newStage.label}! 🎉</h2>
          <p className="text-muted mt-1">
            {newStage.id === 'child' && 'The Travel Agency is now open! '}
            {newStage.unlocksParts.length > 0 && `You can now color ${birb.pronouns.possessive} ${newStage.unlocksParts.map((p) => PART_LABELS[p].toLowerCase()).join(' and ')}. Pick a free color:`}
          </p>
          {newStage.unlocksParts.map((part) => (
            <div key={part} className="mt-4">
              <p className="font-black text-sm mb-2">{PART_LABELS[part]}</p>
              <div className="flex justify-center gap-3">
                {(colorOptions[part] ?? []).map((id) => {
                  const it = ITEMS.find((i) => i.id === id)!;
                  return (
                    <button key={id} onClick={() => setChosen({ ...chosen, [part]: id })} className={cx('w-16 h-16 rounded-2xl bg-surface p-1 border-2', chosen[part] === id ? 'border-accent' : 'border-transparent')} aria-label={it.name}>
                      <DyeBottle color={it.color} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <Button className="mt-6" block size="lg" onClick={() => (pet ? setStep('pet') : finish())}>
            {pet ? 'Next' : 'Wonderful!'}
          </Button>
        </div>
      )}

      {step === 'pet' && pet && (
        <div className="text-center">
          <Micropet species={pet.species} variant={pet.variant} grown className="w-36 h-36 mx-auto" />
          <h2 className="text-2xl font-black">{pet.name} grew up!</h2>
          <p className="text-muted mt-1">After {pet.adventures} adventures together, your {SPECIES_MAP[pet.species]?.kind.toLowerCase()} is all grown.</p>
          <Button className="mt-6" block size="lg" onClick={finish}>
            Aww!
          </Button>
        </div>
      )}
    </Sheet>
  );
}
