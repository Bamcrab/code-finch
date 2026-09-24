import { useNavigate } from 'react-router-dom';
import { Sheet } from '../../ui/kit';

const LINKS = [
  { to: '/goals', emoji: '🎯', label: 'My goals & areas' },
  { to: '/upkeep', emoji: '🧰', label: 'Home upkeep' },
  { to: '/challenges', emoji: '🏅', label: 'Challenges' },
  { to: '/mood', emoji: '😊', label: 'Log mood' },
  { to: '/journal', emoji: '📓', label: 'Journal' },
  { to: '/insights', emoji: '📈', label: 'Insights' },
  { to: '/history', emoji: '🗓️', label: 'History' },
  { to: '/care/firstaid', emoji: '🩹', label: 'First Aid Kit' },
  { to: '/birb/wardrobe', emoji: '👒', label: 'Wardrobe' },
  { to: '/birb/room', emoji: '🛋️', label: 'Decorate' },
  { to: '/birb/pets', emoji: '🐾', label: 'Micropets' },
  { to: '/settings', emoji: '⚙️', label: 'Settings' },
];

export function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  return (
    <Sheet open={open} onClose={onClose} title="Menu">
      <div className="grid grid-cols-3 gap-2">
        {LINKS.map((l) => (
          <button
            key={l.to}
            onClick={() => {
              onClose();
              nav(l.to);
            }}
            className="flex flex-col items-center justify-center gap-1 h-24 rounded-2xl bg-surface font-bold text-sm text-center px-2 active:scale-95 transition"
          >
            <span className="text-3xl">{l.emoji}</span>
            {l.label}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
