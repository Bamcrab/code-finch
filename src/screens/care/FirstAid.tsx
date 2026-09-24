import { useNavigate } from 'react-router-dom';
import { Birb } from '../../art/Birb';
import { GROUNDING } from '../../data/grounding';
import { PROMPT_MAP } from '../../data/reflections';
import { useStage } from '../../state/hooks';
import { useGame } from '../../state/store';
import { Card, Page, SectionTitle } from '../../ui/kit';
import { HelplineCard } from './Quiz';

const PROMPTS = ['loved-one', 'triggers', 'healing', 'rant', 'grief', 'regroup', 'self-compassion'];

export default function FirstAid() {
  const nav = useNavigate();
  const birb = useGame((s) => s.birb);
  const stage = useStage();
  const Row = ({ emoji, title, sub, to }: { emoji: string; title: string; sub: string; to: string }) => (
    <Card onClick={() => nav(to)} className="flex items-center gap-3 p-3">
      <span className="text-3xl w-10 text-center">{emoji}</span>
      <span>
        <span className="font-black block">{title}</span>
        <span className="text-xs text-muted">{sub}</span>
      </span>
    </Card>
  );
  return (
    <Page back title="First Aid Kit" subtitle="Tools for hard moments">
      <div className="flex items-center gap-3 rounded-3xl bg-surface shadow-card p-3">
        <Birb colors={birb.colors} outfit={birb.outfit} scale={stage.scale} className="w-20 h-20 shrink-0" />
        <p className="font-bold">I'm right here with you. Let's take this one small step at a time. 💛</p>
      </div>
      <SectionTitle>Breathe</SectionTitle>
      <div className="flex flex-col gap-2">
        <Row emoji="🆘" title="Panic breathing" sub="Slow and steady. Follow the circle." to="/care/breathe/panic" />
        <Row emoji="🫧" title="Anxiety breathing" sub="Long exhales to settle your body." to="/care/breathe/anxiety" />
      </div>
      <SectionTitle>Ground yourself</SectionTitle>
      <div className="flex flex-col gap-2">
        {GROUNDING.map((g) => (
          <Row key={g.id} emoji={g.emoji} title={g.name} sub={g.blurb} to={`/care/grounding/${g.id}`} />
        ))}
        <Row emoji="🫶" title="Name your emotion" sub="Find the words for what you feel." to="/care/emotion" />
      </div>
      <SectionTitle>Write it out</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {PROMPTS.map((id) => (
          <button key={id} onClick={() => nav(`/care/reflect/${id}`)} className="rounded-2xl bg-surface shadow-card p-3 text-left font-bold text-sm">
            {PROMPT_MAP[id].emoji} {PROMPT_MAP[id].title}
          </button>
        ))}
      </div>
      <SectionTitle>Kind words</SectionTitle>
      <Row emoji="💬" title="Repeat an affirmation" sub="Say something kind to yourself." to="/care/affirmation" />
      <SectionTitle>Reach out</SectionTitle>
      <HelplineCard />
    </Page>
  );
}
