import { BookOpen, HandHeart, Handshake, Heart, Leaf, Lifebuoy, PawPrint } from '@phosphor-icons/react';

// One icon per cause, and a muted tag colour from the warm brand family. Class names are written out in full
// so Tailwind keeps them in the build.
const STYLES = {
  environment: { Icon: Leaf, tag: 'bg-pandan-100 text-pandan-800' },
  education: { Icon: BookOpen, tag: 'bg-[#E3EBF0] text-[#2B4556]' },
  health: { Icon: Heart, tag: 'bg-sambal-100 text-sambal-800' },
  community: { Icon: Handshake, tag: 'bg-kaya-100 text-[#6E4A0E]' },
  animals: { Icon: PawPrint, tag: 'bg-[#F1E2D3] text-[#65391A]' },
  'disaster relief': { Icon: Lifebuoy, tag: 'bg-sand-200 text-kopi-800' },
};

const DEFAULT_STYLE = { Icon: HandHeart, tag: 'bg-sand-100 text-kopi-800' };

export const categoryStyle = (name) => STYLES[name?.toLowerCase()] || DEFAULT_STYLE;

// The cause's icon in Phosphor's duotone style (a Kopi outline with a light tint of the same colour).
export const CauseIcon = ({ name, className = 'w-5 h-5' }) => {
  const { Icon } = categoryStyle(name);
  return <Icon className={`${className} text-kopi-800`} weight="duotone" color="currentColor" aria-hidden="true" />;
};
