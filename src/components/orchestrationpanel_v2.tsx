// OrchestrationPanel V2 - Visual display of string orchestration
// Shows how notes are distributed across the 6-voice ensemble
// Enhanced with AiXEL Voicing Blueprints display
// by AxelFisch©2025/2026

import { useState, useEffect } from 'react';
import { Music, Sparkles, Send, Loader2, Volume2, VolumeX, Info } from 'lucide-react';
import { StringsEngine, getStringsEngine, OrchestratedVoice, OrchestrationResult } from '../utils/stringsengine_v2';
import { chordToMidiNotes, getChordSymbol } from '../utils/chordMapper';

interface OrchestrationPanelProps {
  selectedKey: string;
  selectedExtension: string;
  selectedBassInversion?: string;
  isForeignBass?: boolean;
  onGPTResponse?: (response: string) => void;
}

const VOICE_COLORS: Record<string, string> = {
  Violin1: '#F59E0B',    // Amber - Melody/Tensions
  Violin2: '#10B981',    // Emerald - Tensions
  Viola1: '#8B5CF6',     // Purple - 3rd/7th center
  Viola2: '#6366F1',     // Indigo - 3rd/7th center
  Cello: '#EC4899',      // Pink - Countermelody
  Contrabass: '#EF4444'  // Red - Bass foundation
};

const VOICE_LABELS: Record<string, string> = {
  Violin1: 'Vln 1 (Crown)',
  Violin2: 'Vln 2 (Tension)',
  Viola1: 'Vla 1 (7th)',
  Viola2: 'Vla 2 (3rd)',
  Cello: 'Cello (Counter)',
  Contrabass: 'Bass (Root)'
};

const ROLE_COLORS: Record<string, string> = {
  melody: '#F59E0B',
  tension: '#10B981',
  harmony: '#8B5CF6',
  countermelody: '#EC4899',
  bass: '#EF4444'
};

export default function OrchestrationPanel({
  selectedKey,
  selectedExtension,
  selectedBassInversion,
  isForeignBass,
  onGPTResponse
}: OrchestrationPanelProps) {
  const [orchestration, setOrchestration] = useState<OrchestratedVoice[]>([]);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gptPrompt, setGptPrompt] = useState('');
  const [isLoadingGPT, setIsLoadingGPT] = useState(false);
  const [gptResponse, setGptResponse] = useState<string>('');
  const [stringsEngine, setStringsEngine] = useState<StringsEngine | null>(null);
  const [showBlueprintInfo, setShowBlueprintInfo] = useState(false);

  useEffect(() => {
    const engine = getStringsEngine();
    setStringsEngine(engine);
    
    // Initialize on mount
    engine.initialize().catch(console.error);
  }, []);

  useEffect(() => {
    if (!stringsEngine || !selectedKey) return;

    // Get MIDI notes for current chord
    const midiNotes = chordToMidiNotes(
      selectedKey,
      selectedExtension,
      selectedBassInversion,
      isForeignBass
    );
    const chordSymbol = getChordSymbol(selectedKey, selectedExtension);

    // Get orchestration with blueprint info
    const result = stringsEngine.orchestrateChord(midiNotes, chordSymbol);
    setOrchestration(result.voices);
    setOrchestrationResult(result);
  }, [selectedKey, selectedExtension, selectedBassInversion, isForeignBass, stringsEngine]);

  const handlePlayPreview = async () => {
    if (!stringsEngine || isPlaying) return;

    setIsPlaying(true);
    try {
      const midiNotes = chordToMidiNotes(
        selectedKey,
        selectedExtension,
        selectedBassInversion,
        isForeignBass
      );
      const chordSymbol = getChordSymbol(selectedKey, selectedExtension);
      await stringsEngine.playChord(midiNotes, chordSymbol, 3);
    } catch (error) {
      console.error('Error playing preview:', error);
    }
    
    // Reset after duration
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleStopPreview = () => {
    if (stringsEngine) {
      stringsEngine.releaseAll();
      setIsPlaying(false);
    }
  };

  const handleSendToGPT = async () => {
    if (!gptPrompt.trim()) return;

    setIsLoadingGPT(true);
    
    // Build context about current orchestration
    const orchestrationContext = orchestration.map(v => 
      `${v.voice}: ${v.noteName} (${v.role})`
    ).join(', ');
    
    const fullPrompt = `
Current chord: ${selectedKey}${selectedExtension}${selectedBassInversion ? `/${selectedBassInversion}` : ''}
Orchestration: ${orchestrationContext}

User request: ${gptPrompt}
`;

    try {
      // Open GPT in new tab with pre-filled context
      const gptUrl = `https://chatgpt.com/g/g-67f62c947c608191a9c8dc1cd0101e08-aixel-music-orchestrator`;
      
      // Copy context to clipboard for user to paste
      await navigator.clipboard.writeText(fullPrompt);
      
      setGptResponse(`Context copied to clipboard! Opening AiXEL GPT...\n\nPaste your context when you arrive.`);
      
      // Open GPT
      window.open(gptUrl, '_blank');
      
      if (onGPTResponse) {
        onGPTResponse(fullPrompt);
      }
    } catch {
      setGptResponse('Error: Could not connect to GPT. Please try the direct link.');
    } finally {
      setIsLoadingGPT(false);
    }
  };

  // Sort voices from high to low for display
  const sortedVoices = [...orchestration].sort((a, b) => b.midiNote - a.midiNote);

  const chordSymbol = selectedKey + selectedExtension + 
    (selectedBassInversion ? `/${selectedBassInversion}` : '');

  return (
    <div className="bg-[#0F172A] rounded-2xl p-4 md:p-6 border border-[#1E293B] shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-lg font-bold text-[#F9FAFB]">String Orchestration</h3>
        </div>
        <button
          onClick={isPlaying ? handleStopPreview : handlePlayPreview}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold
            transition-all duration-200
            ${isPlaying 
              ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white' 
              : 'bg-[#16A34A] hover:bg-[#15803D] text-white'
            }
          `}
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-4 h-4" />
              Stop
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              Preview
            </>
          )}
        </button>
      </div>

      {/* Current Chord */}
      <div className="text-center mb-4 p-3 bg-[#1E293B] rounded-xl">
        <span className="text-2xl font-bold text-[#F59E0B]">{chordSymbol || '—'}</span>
      </div>

      {/* Voice Distribution */}
      <div className="space-y-2 mb-4">
        {sortedVoices.map((voice) => (
          <div
            key={voice.voice}
            className="voice-entry flex items-center gap-3 p-2 rounded-lg bg-[#1E293B]/50 hover:bg-[#1E293B] transition-all"
            style={{ borderLeft: `3px solid ${VOICE_COLORS[voice.voice]}` }}
          >
            <div className="w-28 text-xs font-medium text-[#94A3B8]">
              {VOICE_LABELS[voice.voice]}
            </div>
            <div 
              className="flex-1 h-7 rounded flex items-center justify-between px-2"
              style={{ backgroundColor: `${VOICE_COLORS[voice.voice]}20` }}
            >
              <span 
                className="text-sm font-bold"
                style={{ color: VOICE_COLORS[voice.voice] }}
              >
                {voice.noteName}
              </span>
              {voice.intervalName && (
                <span 
                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ 
                    backgroundColor: `${ROLE_COLORS[voice.role]}30`,
                    color: ROLE_COLORS[voice.role]
                  }}
                >
                  {voice.intervalName}
                </span>
              )}
            </div>
            <div 
              className="text-xs w-16 text-right font-medium"
              style={{ color: ROLE_COLORS[voice.role] }}
            >
              {voice.role}
            </div>
          </div>
        ))}
      </div>

      {/* Blueprint Info */}
      {orchestrationResult && (
        <div className="mb-4 p-3 bg-[#0B1120] rounded-lg border border-[#1E293B]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#F59E0B]">
              Voicing: {orchestrationResult.voicingType}
            </span>
            <button
              onClick={() => setShowBlueprintInfo(!showBlueprintInfo)}
              className="text-[#64748B] hover:text-[#F59E0B] transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          {showBlueprintInfo && (
            <p className="text-xs text-[#94A3B8]">
              {orchestrationResult.blueprint}
            </p>
          )}
        </div>
      )}

      {/* GPT Integration */}
      <div className="border-t border-[#334155] pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#10B981]" />
          <span className="text-sm font-semibold text-[#F9FAFB]">Ask AiXEL GPT</span>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={gptPrompt}
            onChange={(e) => setGptPrompt(e.target.value)}
            placeholder="e.g., Suggest a progression from this chord..."
            className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#F9FAFB] placeholder-[#64748B] focus:outline-none focus:border-[#10B981]"
            onKeyDown={(e) => e.key === 'Enter' && handleSendToGPT()}
          />
          <button
            onClick={handleSendToGPT}
            disabled={isLoadingGPT || !gptPrompt.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
          >
            {isLoadingGPT ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {gptResponse && (
          <div className="mt-3 p-3 bg-[#1E293B] rounded-lg text-sm text-[#CBD5F5] whitespace-pre-wrap">
            {gptResponse}
          </div>
        )}
      </div>

      {/* Orchestration Rules Summary */}
      <div className="mt-4 p-3 bg-[#0B1120] rounded-lg">
        <p className="text-xs text-[#64748B] mb-2 font-semibold">AiXEL Voicing Rules:</p>
        <ul className="text-xs text-[#94A3B8] space-y-1">
          <li>• <span className="text-[#F59E0B]">Vln1</span>: Crown - tensions 9/#11/13</li>
          <li>• <span className="text-[#8B5CF6]">Violas</span>: Center - 3rd & 7th</li>
          <li>• <span className="text-[#EC4899]">Cello</span>: Countermelody (5th/root)</li>
          <li>• <span className="text-[#EF4444]">Bass</span>: Foundation (root -2 oct)</li>
          <li>• Spacing: min 3rd, max 10th</li>
        </ul>
      </div>
    </div>
  );
}
