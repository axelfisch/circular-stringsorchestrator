import { useState, useEffect, useRef } from 'react';
import { Play, Square, SkipBack, Download, Split } from 'lucide-react';
import { ChordInSequence, BarConfig } from '../App';
import { AudioEngine } from '../utils/audioEngine';

interface ChordSequencerProps {
  timeSignature: string;
  sequence: ChordInSequence[];
  selectedStyle: string;
  barConfigs: BarConfig[];
  onRemoveChord: (id: string) => void;
  onClearSequence: () => void;
  onBarConfigChange: (configs: BarConfig[]) => void;
}

export default function ChordSequencer({ timeSignature, sequence, selectedStyle, barConfigs, onRemoveChord, onClearSequence, onBarConfigChange }: ChordSequencerProps) {
  const [tempo, setTempo] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [currentBar, setCurrentBar] = useState<number>(-1);
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const maxSlots = 8;

  useEffect(() => {
    audioEngineRef.current = new AudioEngine();

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setTempo(tempo);
    }
  }, [tempo]);

  const handlePlayPause = async () => {
    if (!audioEngineRef.current) return;

    if (sequence.length === 0) {
      return;
    }

    if (isPlaying) {
      audioEngineRef.current.pause();
      setIsPlaying(false);
    } else {
      audioEngineRef.current.scheduleSequence(
        sequence,
        barConfigs,
        tempo,
        loopEnabled,
        (barIndex) => {
          setCurrentBar(barIndex);
        }
      );
      await audioEngineRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (!audioEngineRef.current) return;

    audioEngineRef.current.stop();
    setIsPlaying(false);
    setCurrentBar(-1);
  };

  const handleLoopToggle = () => {
    setLoopEnabled(!loopEnabled);
    if (isPlaying && audioEngineRef.current) {
      audioEngineRef.current.stop();
      audioEngineRef.current.scheduleSequence(
        sequence,
        barConfigs,
        tempo,
        !loopEnabled,
        (barIndex) => setCurrentBar(barIndex)
      );
      audioEngineRef.current.play();
    }
  };
  return (
    <div className="space-y-4 w-full">
      {/* Chord Sequence */}
      <div className="bg-[#0F172A] rounded-2xl p-4 md:p-6 border border-[#1E293B] shadow-[0_24px_60px_rgba(15,23,42,0.75)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
          <div>
            <h3 className="text-xl font-bold text-[#F9FAFB]">Chord Sequence</h3>
            {selectedStyle && (
              <p className="text-sm text-[#F59E0B] mt-1">Genre: {selectedStyle}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#CBD5F5]">{timeSignature} — 8 measures</span>
            {sequence.length > 0 && (
              <button
                onClick={onClearSequence}
                className="text-xs text-[#64748B] hover:text-[#F87171] transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
          {Array.from({ length: maxSlots }).map((_, index) => {
            const barConfig = barConfigs[index];
            const chord = sequence[index];
            const isSplit = barConfig.chordCount === 2;

            const toggleBarSplit = (e: React.MouseEvent) => {
              e.stopPropagation();
              const newConfigs = [...barConfigs];
              newConfigs[index] = {
                ...barConfig,
                chordCount: barConfig.chordCount === 1 ? 2 : 1
              };
              onBarConfigChange(newConfigs);
            };

            return (
              <div key={index} className="relative">
                <button
                  onClick={toggleBarSplit}
                  className="absolute -top-2 -right-2 z-10 bg-[#334155] hover:bg-[#475569] rounded-full p-1 border border-[#64748B] transition-colors"
                  title={isSplit ? "Single chord per bar" : "Two chords per bar"}
                >
                  <Split className={`w-3 h-3 ${isSplit ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}`} />
                </button>

                {isSplit ? (
                  <div className="flex gap-1.5">
                    <div
                      className={`
                        flex-1 rounded-lg p-3 min-h-[100px] flex flex-col items-center justify-center
                        border transition-all duration-200
                        ${
                          chord
                            ? currentBar === index
                              ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706] border-[#FCD34D]/50 shadow-xl'
                              : 'bg-gradient-to-br from-[#16A34A] to-[#15803D] border-[#4ADE80]/30 shadow-lg hover:scale-105 cursor-pointer'
                            : 'bg-[#1E293B] border-[#334155] border-dashed'
                        }
                      `}
                      onClick={() => chord && onRemoveChord(chord.id)}
                    >
                      <div className="text-[10px] text-[#CBD5F5] mb-1">{index + 1}.1</div>
                      {chord ? (
                        <>
                          <div className="text-sm font-bold text-white text-center">
                            {chord.key}{chord.extension}
                          </div>
                          <div className="text-[10px] text-[#E5E7EB] mt-1">2 beats</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xl text-[#64748B]">—</div>
                          <div className="text-[10px] text-[#64748B] mt-1">2 beats</div>
                        </>
                      )}
                    </div>
                    <div
                      className="flex-1 rounded-lg p-3 min-h-[100px] flex flex-col items-center justify-center
                        bg-[#1E293B] border-[#334155] border-dashed border transition-all duration-200"
                    >
                      <div className="text-[10px] text-[#CBD5F5] mb-1">{index + 1}.2</div>
                      <div className="text-xl text-[#64748B]">—</div>
                      <div className="text-[10px] text-[#64748B] mt-1">2 beats</div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`
                      rounded-lg p-4 min-h-[100px] flex flex-col items-center justify-center
                      border transition-all duration-200
                      ${
                        chord
                          ? currentBar === index
                            ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706] border-[#FCD34D]/50 shadow-xl scale-110'
                            : 'bg-gradient-to-br from-[#16A34A] to-[#15803D] border-[#4ADE80]/30 shadow-lg hover:scale-105 cursor-pointer'
                          : 'bg-[#1E293B] border-[#334155] border-dashed'
                      }
                    `}
                    onClick={() => chord && onRemoveChord(chord.id)}
                  >
                    <div className="text-xs text-[#CBD5F5] mb-1">bar {index + 1}</div>
                    {chord ? (
                      <>
                        <div className="text-lg font-bold text-white text-center">
                          {chord.key}{chord.extension}
                        </div>
                        <div className="text-xs text-[#E5E7EB] mt-1">4 beats</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl text-[#64748B]">—</div>
                        <div className="text-xs text-[#64748B] mt-1">4 beats</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transport and Export */}
      <div className="bg-[#0F172A] rounded-xl p-4 md:p-5 border border-[#1E293B] shadow-[0_24px_60px_rgba(15,23,42,0.75)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {/* Left: Tempo Controls */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#CBD5F5] font-medium mb-1.5 block">
                Tempo (BPM)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="40"
                  max="260"
                  value={tempo}
                  onChange={(e) => setTempo(Number(e.target.value))}
                  className="flex-1 h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #16A34A 0%, #16A34A ${((tempo - 40) / 220) * 100}%, #1E293B ${((tempo - 40) / 220) * 100}%, #1E293B 100%)`
                  }}
                />
                <span className="text-base font-bold text-[#F9FAFB] min-w-[50px] text-center">
                  {tempo}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#CBD5F5] font-medium mb-1.5 block">
                Time Signature
              </label>
              <select
                value={timeSignature}
                className="w-full bg-[#1E293B] text-[#F9FAFB] text-sm rounded-lg px-3 py-2 border border-[#334155] focus:outline-none focus:border-[#16A34A]"
              >
                <option value="4/4">4/4</option>
                <option value="3/4">3/4</option>
                <option value="6/8">6/8</option>
              </select>
            </div>
          </div>

          {/* Center: Transport Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {}}
              className="p-2.5 rounded-full bg-transparent border border-[#1E293B] text-[#E5E7EB] hover:bg-[#1E293B] transition-all"
              title="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full bg-[#16A34A] text-white hover:bg-[#15803D] transition-all shadow-lg"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Square className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
            </button>
            <button
              onClick={handleStop}
              className="p-2.5 rounded-full bg-transparent border border-[#1E293B] text-[#E5E7EB] hover:bg-[#1E293B] transition-all"
              title="Stop"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Export Controls */}
          <div className="flex items-center justify-end gap-1.5 flex-wrap">
            <button
              onClick={handleLoopToggle}
              className={`
                px-3 py-1.5 rounded-full font-semibold text-xs transition-all
                ${
                  loopEnabled
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-transparent border border-[#1E293B] text-[#E5E7EB] hover:bg-[#1E293B]'
                }
              `}
            >
              LOOP
            </button>
            <button className="px-3 py-1.5 rounded-full font-semibold text-xs bg-transparent border border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white transition-all flex items-center gap-1.5">
              <Download className="w-3 h-3" />
              MIDI
            </button>
            <button className="px-3 py-1.5 rounded-full font-semibold text-xs bg-transparent border border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all flex items-center gap-1.5">
              <Download className="w-3 h-3" />
              XML
            </button>
            <button className="px-3 py-1.5 rounded-full font-semibold text-xs bg-transparent border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white transition-all flex items-center gap-1.5">
              <Download className="w-3 h-3" />
              PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
