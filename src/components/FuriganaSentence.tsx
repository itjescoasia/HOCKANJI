import React, { useState, useEffect } from 'react';
import { FuriganaMode, KanjiCard } from '../types';
import {
  parseFurigana,
  stripFurigana,
  hasKanji,
  getFuriganaFromCache,
  generateLocalFurigana,
  fetchFuriganaWithGemini,
} from '../utils/furigana';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

interface FuriganaSentenceProps {
  sentence: string;
  furigana?: string;
  mode?: FuriganaMode;
  deck?: KanjiCard[];
  autoFetch?: boolean;
  className?: string;
  rtClassName?: string;
}

export const FuriganaSentence: React.FC<FuriganaSentenceProps> = ({
  sentence,
  furigana: explicitFurigana,
  mode = 'always',
  deck,
  autoFetch = true,
  className = '',
  rtClassName = '',
}) => {
  const cleanOriginal = stripFurigana(sentence || '');
  const [activeFurigana, setActiveFurigana] = useState<string>(() => {
    if (explicitFurigana) return explicitFurigana;
    if (sentence && sentence.includes('[') && sentence.includes(']')) return sentence;
    const cached = getFuriganaFromCache(cleanOriginal);
    if (cached) return cached;
    return generateLocalFurigana(cleanOriginal, deck);
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (explicitFurigana) {
      setActiveFurigana(explicitFurigana);
      return;
    }

    if (sentence && sentence.includes('[') && sentence.includes(']')) {
      setActiveFurigana(sentence);
      return;
    }

    const clean = stripFurigana(sentence || '');
    if (!clean || !hasKanji(clean)) {
      setActiveFurigana(clean);
      return;
    }

    const cached = getFuriganaFromCache(clean);
    if (cached) {
      setActiveFurigana(cached);
      return;
    }

    // Use local deck fallback immediately
    const localFallback = generateLocalFurigana(clean, deck);
    setActiveFurigana(localFallback);

    if (autoFetch && mode !== 'off') {
      setIsLoading(true);
      let isMounted = true;
      fetchFuriganaWithGemini(clean)
        .then((res) => {
          if (isMounted && res.furigana) {
            setActiveFurigana(res.furigana);
          }
        })
        .catch(() => {
          // Keep local fallback on error
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [sentence, explicitFurigana, mode, autoFetch, deck]);

  // If Furigana is turned off, render clean text without ruby
  if (mode === 'off' || !hasKanji(cleanOriginal)) {
    return <span className={className}>{cleanOriginal}</span>;
  }

  const tokens = parseFurigana(activeFurigana || cleanOriginal);

  return (
    <span
      className={`furigana-container inline-block ${
        mode === 'hover' ? 'group/furigana' : ''
      } ${className}`}
    >
      {tokens.map((token, i) => {
        if (!token.ruby) {
          return <React.Fragment key={i}>{token.text}</React.Fragment>;
        }

        return (
          <ruby
            key={i}
            className="mx-[0.5px] cursor-help transition-all"
            title={`${token.text} (${token.ruby})`}
          >
            {token.text}
            <rp>(</rp>
            <rt
              className={`select-none text-[0.5em] font-sans font-medium text-theme-accent tracking-tight leading-none ${
                mode === 'hover'
                  ? 'opacity-0 group-hover/furigana:opacity-100 group-focus/furigana:opacity-100 transition-opacity duration-150'
                  : 'opacity-90'
              } ${rtClassName}`}
            >
              {token.ruby}
            </rt>
            <rp>)</rp>
          </ruby>
        );
      })}
      {isLoading && (
        <span
          className="inline-block ml-1 opacity-40 animate-pulse text-[10px] align-super"
          title="Đang tải Furigana từ Gemini AI..."
        >
          ✨
        </span>
      )}
    </span>
  );
};

interface FuriganaToggleProps {
  mode: FuriganaMode;
  onChange: (mode: FuriganaMode) => void;
  className?: string;
}

export const FuriganaToggle: React.FC<FuriganaToggleProps> = ({
  mode,
  onChange,
  className = '',
}) => {
  const cycleMode = () => {
    if (mode === 'always') onChange('hover');
    else if (mode === 'hover') onChange('off');
    else onChange('always');
  };

  const getLabel = () => {
    switch (mode) {
      case 'always':
        return 'Furigana: Hiện';
      case 'hover':
        return 'Furigana: Hover';
      case 'off':
        return 'Furigana: Tắt';
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'always':
        return <Sparkles className="w-3.5 h-3.5 text-theme-accent" />;
      case 'hover':
        return <Eye className="w-3.5 h-3.5 text-theme-accent" />;
      case 'off':
        return <EyeOff className="w-3.5 h-3.5 text-theme-primary/40" />;
    }
  };

  return (
    <button
      type="button"
      onClick={cycleMode}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer shadow-xs ${
        mode === 'off'
          ? 'bg-theme-panel border-theme-subtle text-theme-primary/50 hover:text-theme-primary hover:border-theme-accent/40'
          : 'bg-theme-accent/10 border-theme-accent/30 text-theme-accent hover:bg-theme-accent/20'
      } ${className}`}
      title="Chuyển chế độ Furigana (Hiện luôn / Rê chuột để hiện / Tắt)"
    >
      {getIcon()}
      <span className="text-[11px] uppercase tracking-wider">{getLabel()}</span>
    </button>
  );
};
