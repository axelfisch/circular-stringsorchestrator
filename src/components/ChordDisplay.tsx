import { Music } from 'lucide-react';
import { buildFullChord } from '../utils/bassInversion';

interface ChordDisplayProps {
  selectedKey: string;
  selectedExtension: string;
  selectedBassInversion: string;
  isForeignBass: boolean;
  selectedStyle: string;
  onAddChord: () => void;
}

export default function ChordDisplay({
  selectedKey,
  selectedExtension,
  selectedBassInversion,
  isForeignBass,
  selectedStyle,
  onAddChord
}: ChordDisplayProps) {
  const bassInversions: Record<string, string> = {
    'b2': 'm2', '2': 'M2', 'b3': 'm3',
    '3': 'M3', '4': 'P4', '#4': 'A4', '5': 'P5',
    'b6': 'm6', '6': 'M6', 'b7': 'm7', '7': 'M7'
  };

  const getChordName = () => {
    if (!selectedKey) return '—';

    if (isForeignBass && selectedBassInversion) {
      return `${selectedKey}${selectedExtension}/${selectedBassInversion}`;
    }

    const interval = selectedBassInversion ? bassInversions[selectedBassInversion] : undefined;
    return buildFullChord(selectedKey, selectedExtension, selectedBassInversion, interval);
  };

  return (
    <div className="bg-[#0F172A] rounded-xl p-4 md:p-6 border border-[#1E293B] shadow-[0_24px_60px_rgba(15,23,42,0.75)] min-w-[280px] max-w-[90vw] w-full sm:w-auto">
      <div className="flex items-center gap-2 mb-5">
        <Music className="w-5 h-5 text-[#4ADE80]" />
        <h2 className="text-lg font-bold text-[#F9FAFB]">
          Selection
        </h2>
      </div>

      <div className="space-y-3 mb-5">
        <div className="space-y-1.5 fade-in">
          <label className="text-xs text-[#CBD5F5] font-medium">Genre</label>
          <div className="bg-[#1E293B] rounded-lg p-3 border border-[#334155] transition-all hover:border-[#F59E0B]/50">
            <p className="text-base font-bold text-[#F59E0B]">
              {selectedStyle || '—'}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 fade-in">
          <label className="text-xs text-[#CBD5F5] font-medium">Key</label>
          <div className="bg-[#1E293B] rounded-lg p-3 border border-[#334155] transition-all hover:border-[#4ADE80]/50">
            <p className="text-xl font-bold text-[#4ADE80]">
              {selectedKey || '—'}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 fade-in">
          <label className="text-xs text-[#CBD5F5] font-medium">Extension</label>
          <div className="bg-[#1E293B] rounded-lg p-3 border border-[#334155] transition-all hover:border-[#A855F7]/50">
            <p className="text-xl font-bold text-[#A855F7]">
              {selectedExtension || '—'}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 fade-in">
          <label className="text-xs text-[#CBD5F5] font-medium">
            {isForeignBass ? 'Foreign Bass' : 'Bass Inversion'}
          </label>
          <div className={`bg-[#1E293B] rounded-lg p-3 border border-[#334155] transition-all ${isForeignBass ? 'hover:border-[#F59E0B]/50' : 'hover:border-[#10B981]/50'}`}>
            <p className={`text-xl font-bold ${isForeignBass ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
              {selectedBassInversion || '—'}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 fade-in">
          <label className="text-xs text-[#CBD5F5] font-medium">Full Chord</label>
          <div className="bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-lg p-4 border border-[#4ADE80]/30 shadow-lg transition-all hover:scale-105 active-glow">
            <p className="text-2xl font-bold text-white text-center">
              {getChordName()}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#64748B] text-center mb-3">
        Select Key and Extension to create your chord
      </p>

      <button
        onClick={onAddChord}
        disabled={!selectedKey}
        className={`
          w-full py-2.5 px-4 rounded-full font-semibold text-sm text-white
          flex items-center justify-center gap-2
          transition-all duration-200 play-button
          ${selectedKey
            ? 'bg-[#16A34A] hover:bg-[#15803D] active:scale-95 shadow-lg hover:shadow-xl hover:shadow-green-500/30 active-glow'
            : 'bg-[#334155] cursor-not-allowed opacity-50'
          }
        `}
      >
        Add to Sequence
      </button>
    </div>
  );
}
