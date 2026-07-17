import React from 'react';
import { channelTone } from './styles';
import { sourceIcon } from './glyphs';

/* Spójny tag źródła rezerwacji: ikona liniowa + nazwa + ton marki (X15).
   createElement zamiast <Ic/> — ikona jest wybierana per nazwa źródła. */
export function SourceTag({ source, style }) {
  if (!source) return null;
  return (
    <span className={`wpd-tag wpd-tag--${channelTone(source)}`} style={style}>
      {React.createElement(sourceIcon(source), { style: { width: 11, height: 11 } })} {source}
    </span>
  );
}
