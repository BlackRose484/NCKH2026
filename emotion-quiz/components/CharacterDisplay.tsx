import Image from 'next/image';

type CharacterType = 'boy' | 'girl' | 'man' | 'woman' | 'robot' | 'zombie' | 'mascot' | 'mascot_sad' | 'mascot_bad';

interface CharacterDisplayProps {
  character: CharacterType;
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function CharacterDisplay({ 
  character, 
  size = 200, 
  className = '',
  animate = true 
}: CharacterDisplayProps) {
  const imageSrc = `/` + character + '.svg';
  
  return (
    <div className={`relative ${animate ? 'animate-float' : ''} ${className}`}>
      <Image
        src={imageSrc}
        alt={character}
        width={size}
        height={size}
        priority
        className="drop-shadow-2xl"
      />
    </div>
  );
}
