import React from 'react';
import { LEVEL_STEPS } from '../initialData';
import { Gender } from '../types';

interface AvatarOfProgressProps {
  gender: Gender;
  level: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  // Personalizations
  skinColor?: string;
  hairColor?: string;
  clothingColor?: string;
  eyeStyle?: 'calm' | 'open' | 'happy';
  hairStyle?: 'short' | 'long' | 'curly' | 'bald' | 'braids';
  hasBeard?: boolean;
  hasGlasses?: boolean;
}

export default function AvatarOfProgress({
  gender,
  level,
  size = 'md',
  skinColor,
  hairColor,
  clothingColor,
  eyeStyle = 'calm',
  hairStyle,
  hasBeard = false,
  hasGlasses = false,
}: AvatarOfProgressProps) {
  const currentStep = LEVEL_STEPS.find(s => s.level === level) || LEVEL_STEPS[0];

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  };

  // Level themed gradients and styling
  const levelColors = [
    { base: '#004b87', accent: '#3b82f6' }, // Level 1 - Blue
    { base: '#059669', accent: '#34d399' }, // Level 2 - Emerald
    { base: '#b45309', accent: '#fbbf24' }, // Level 3 - Amber
    { base: '#6d28d9', accent: '#a78bfa' }, // Level 4 - Purple
    { base: '#991b1b', accent: '#fca5a5' }, // Level 5 - Crimson
    { base: '#c29f5f', accent: '#fef08a' }  // Level 6 - Gold Wisdom
  ][Math.min(level - 1, 5)];

  // Defaults based on gender / level if customizations aren't defined
  const isMale = gender === 'masculino';
  const finalSkin = skinColor || '#FED7AA'; // Peach/Beige default skin tone matching perfect vector palettes
  const finalSkinShadow = adjustColor(finalSkin, -15);
  const finalHairColor = hairColor || '#1e293b'; // standard image style black hair
  const finalHairShadow = adjustColor(finalHairColor, -10);
  const finalClothingColor = clothingColor || '#ea580c'; // custom default beautiful orange/terracotta top
  const finalClothingShadow = adjustColor(finalClothingColor, -15);
  const finalHairStyle = hairStyle || (isMale ? 'short' : 'long');
  const finalHasBeard = hasBeard || false; 

  return (
    <div className={`relative flex flex-col items-center justify-center ${sizeClasses[size]} select-none transition-transform duration-500`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full drop-shadow-[0_6px_16px_rgba(30,58,138,0.12)] overflow-visible"
        aria-label={`Avatar Personalizado de Nível ${level}`}
      >
        <defs>
          <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={levelColors.accent} stopOpacity="0.4" />
            <stop offset="100%" stopColor={levelColors.accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={finalSkin} />
            <stop offset="100%" stopColor={adjustColor(finalSkin, -15)} />
          </linearGradient>
          <linearGradient id="clothingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={finalClothingColor} />
            <stop offset="100%" stopColor={adjustColor(finalClothingColor, -25)} />
          </linearGradient>
        </defs>

        {/* Standardized flat vector layout of character matching members exactly */}

        {/* Premium Flat Vector Character Illustration matching attachment exactly */}
        {isMale ? (
          <g id="male-vector-avatar">
            {/* Hair behind head */}
            {finalHairStyle !== 'bald' && (
              <path
                d={
                  finalHairStyle === 'long'
                    ? "M 37,34 C 36,24 84,24 83,34 Q 85,55 83,72 Q 60,70 37,72 Q 35,55 37,34 Z"
                    : finalHairStyle === 'curly'
                    ? "M 36,36 C 34,22 86,22 84,36 Z"
                    : "M 40,36 C 38,24 82,24 80,36 Z" // short
                }
                fill={finalHairColor}
              />
            )}

            {/* Symmetrical ears peeking on sides with split-shadowing */}
            <circle cx="41" cy="46" r="4.5" fill={finalSkin} />
            <circle cx="79" cy="46" r="4.5" fill={finalSkinShadow} />

            {/* Split-shaded neck */}
            <rect x="54" y="60" width="6" height="18" rx="1" fill={finalSkin} />
            <rect x="60" y="60" width="6" height="18" rx="1" fill={finalSkinShadow} />

            {/* Split-shaded head base (No eyes/nose/mouth) */}
            <path d="M 60,24 C 45,24 43,36 43,48 C 43,60 48,64 60,64 Z" fill={finalSkin} />
            <path d="M 60,24 C 75,24 77,36 77,48 C 77,60 72,64 60,64 Z" fill={finalSkinShadow} />

            {/* Comb cropped male front styled hair */}
            {finalHairStyle !== 'bald' && (
              <path
                d={
                  finalHairStyle === 'long'
                    ? "M 40,33 C 39,22 50,14 60,20 C 70,14 81,22 80,33 C 74,23 68,22 60,26 C 52,22 46,23 40,33 Z"
                    : finalHairStyle === 'curly'
                    ? "M 41,33 C 37,27 38,18 45,15 C 48,11 54,9 60,11 C 66,9 72,11 75,15 C 82,18 83,27 79,33 C 71,24 68,23 60,26 C 52,23 49,24 41,33 Z"
                    : "M 40,36 C 39,22 46,14 60,14 C 74,14 80,20 80,32 C 75,22 70,20 60,24 C 50,20 45,22 40,36 Z" // short
                }
                fill={finalHairColor}
              />
            )}

            {/* Modern Crew-neck shirt split shaded */}
            <path d="M 24,108 C 24,88 34,74 50,74 C 55,74 58,76 60,78 L 60,108 Z" fill={finalClothingColor} />
            <path d="M 96,108 C 96,88 86,74 70,74 C 65,74 62,76 60,78 L 60,108 Z" fill={finalClothingShadow} />
          </g>
        ) : (
          <g id="female-vector-avatar">
            {/* Flowing bob haircut behind */}
            {finalHairStyle !== 'bald' && (
              <path
                d={
                  finalHairStyle === 'long'
                    ? "M 35,32 C 34,14 86,14 85,32 Q 91,56 86,76 Q 60,72 34,76 Q 29,56 35,32 Z"
                    : finalHairStyle === 'curly'
                    ? "M 34,36 C 30,20 90,20 86,36 Q 92,54 86,68 Q 60,63 34,68 Q 28,54 34,36 Z"
                    : "M 60,16 C 36,16 30,34 30,55 C 30,69 42,71 46,62 Q 48,56 48,46 C 48,42 60,42 60,42 C 60,42 72,42 72,46 Q 72,56 74,62 C 78,71 90,69 90,55 C 90,34 84,16 60,16 Z" // short/bob
                }
                fill={finalHairColor}
              />
            )}

            {/* Symmetrical ears peeking through side bangs */}
            <circle cx="41" cy="46" r="4.5" fill={finalSkin} />
            <circle cx="79" cy="46" r="4.5" fill={finalSkinShadow} />

            {/* Split-shaded neck */}
            <rect x="54" y="60" width="6" height="18" rx="1" fill={finalSkin} />
            <rect x="60" y="60" width="6" height="18" rx="1" fill={finalSkinShadow} />

            {/* Split-shaded head base (No eyes/nose/mouth) */}
            <path d="M 60,24 C 45,24 43,36 43,48 C 43,60 48,64 60,64 Z" fill={finalSkin} />
            <path d="M 60,24 C 75,24 77,36 77,48 C 77,60 72,64 60,64 Z" fill={finalSkinShadow} />

            {/* Side-swept female bangs */}
            {finalHairStyle !== 'bald' && (
              <path
                d={
                  finalHairStyle === 'long'
                    ? "M 41,33 C 44,20 54,18 60,24 C 66,18 76,20 79,33 C 75,23 66,23 60,27 C 54,23 45,23 41,33 Z"
                    : finalHairStyle === 'curly'
                    ? "M 40,33 C 36,25 38,15 45,13 C 49,9 54,8 60,10 C 66,8 71,9 75,13 C 82,15 84,25 80,33 C 74,25 67,24 60,27 Q 52,24 40,33 Z"
                    : "M 43,36 C 47,26 55,24 60,28 C 65,24 73,26 77,36 C 75,20 45,20 43,36 Z" // short/bob
                }
                fill={finalHairColor}
              />
            )}

            {/* Beautiful scoop-neck clothing split shaded */}
            <path d="M 24,108 C 24,88 34,76 48,76 C 52,76 56,80 60,84 L 60,108 Z" fill={finalClothingColor} />
            <path d="M 96,108 C 96,88 86,76 72,76 C 68,76 64,80 60,84 L 60,108 Z" fill={finalClothingShadow} />
          </g>
        )}

        {/* Optional accessory toggles layered perfectly on standard coordinates */}
        {finalHasBeard && (
          <g id="groomed-beard" fill={finalHairColor}>
            {/* The main beard wrapping around the chin and cheeks, perfectly adjusted */}
            <path
              d="M 42.5,45 C 42.5,58 48,65.5 60,65.5 C 72,65.5 77.5,58 77.5,45 C 74,48 70,49 60,51 C 50,49 46,48 42.5,45 Z"
            />
            {/* Split shadow for depth on-beard */}
            <path
              d="M 60,51 C 65,49 74,48 77.5,45 C 77.5,58 72,65.5 60,65.5 Z"
              fill={finalHairShadow}
              opacity="0.15"
            />
            {/* A matching classy modern mustache */}
            <path
              d="M 50,51 C 54,49 58,49 60,51 C 62,49 66,49 70,51 C 66,51 62,51 60,51.5 C 58,51 54,51 50,51 Z"
              stroke={finalHairColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {hasGlasses && (
          <g stroke="#1d2939" strokeWidth="2" fill="none" opacity="0.9">
            <rect x="44" y="42" width="11" height="8" rx="2" />
            <rect x="65" y="42" width="11" height="8" rx="2" />
            <path d="M 55,46 L 65,46" />
          </g>
        )}

      </svg>

      {/* Ribbon Level Title */}
      <span className="absolute bottom-[-9px] bg-white border border-[#D4AF37]/50 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase font-mono text-[#b48a30] shadow-sm whitespace-nowrap">
        NÍV {level} • {currentStep.title}
      </span>
    </div>
  );
}

// Complex color darkening/lightening utility since package dependencies doesn't include tinycolor
function adjustColor(col: string, amt: number): string {
  let usePound = false;
  if (col[0] === "#") {
    col = col.slice(1);
    usePound = true;
  }
  let num = parseInt(col, 16);
  let r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00FF) + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  let g = (num & 0x0000FF) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}
