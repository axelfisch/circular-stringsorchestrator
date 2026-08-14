// OrchestrationPanel V2 - Visual display of string orchestration
// Shows how notes are distributed across the 6-voice ensemble
// Enhanced with AiXEL Voicing Blueprints display
// by AxelFisch©2025/2026

import { useState, useEffect, useRef } from 'react';
import { Music, Sparkles, Send, Loader2, Volume2, VolumeX, Info, Play, Check, X } from 'lucide-react';
import { StringsEngine, getStringsEngine, OrchestratedVoice, OrchestrationResult } from '../utils/stringsengine_v2';
import { chordToMidiNotes, getChordSymbol } from '../utils/chordMapper';
import { AudioEngine } from '../utils/audioEngine';
import {
  AiXELAssistantResponse,
  assistantMeasuresToSequence
} from '../utils/aixelAssistantContract';
import {
  AiXELAssistantClientError,
  buildAiXELAssistantRequest,
  requestAiXELAssistant
} from '../utils/aixelAssistantClient';
import { SequenceMeasure } from '../utils/sequencerModel';

interface OrchestrationPanelProps {
  selectedKey: string;
  selectedExtension: string;
  selectedBassInversion?: string;
  isForeignBass?: boolean;
  selectedStyle: string;
  measures: SequenceMeasure[];
  timeSignature: '4/4';
  tempo: number;
  onApplyProposal: (measures: SequenceMeasure[]) => void;
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
  selectedStyle,
  measures,
  timeSignature,
  tempo,
  onApplyProposal
}: OrchestrationPanelProps) {
  const [orchestration, setOrchestration] = useState<OrchestratedVoice[]>([]);
  const [orchestrationResult, setOrchestrationResult] = useState<OrchestrationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gptPrompt, setGptPrompt] = useState('');
  const [isLoadingGPT, setIsLoadingGPT] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState<AiXELAssistantResponse | null>(null);
  const [assistantError, setAssistantError] = useState('');
  const [isPlayingProposal, setIsPlayingProposal] = useState(false);
  const [proposalBar, setProposalBar] = useState(-1);
  const [stringsEngine, setStringsEngine] = useState<StringsEngine | null>(null);
  const [showBlueprintInfo, setShowBlueprintInfo] = useState(false);
  const proposalEngineRef = useRef<AudioEngine | null>(null);
  const assistantRequestRef = useRef<AbortController | null>(null);
  const assistantRequestSequenceRef = useRef(0);

  useEffect(() => {
    const engine = getStringsEngine();
    setStringsEngine(engine);
    
    // Initialize on mount
    engine.initialize().catch(console.error);
  }, []);

  useEffect(() => () => {
    assistantRequestSequenceRef.current += 1;
    assistantRequestRef.current?.abort();
    proposalEngineRef.current?.dispose();
  }, []);

  useEffect(() => {
    assistantRequestSequenceRef.current += 1;
    assistantRequestRef.current?.abort();
    assistantRequestRef.current = null;
    proposalEngineRef.current?.stop();
    setIsLoadingGPT(false);
    setAssistantResponse(null);
    setAssistantError('');
    setIsPlayingProposal(false);
    setProposalBar(-1);
  }, [selectedKey, selectedExtension, selectedBassInversion, isForeignBass, selectedStyle, timeSignature, tempo, measures]);

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
    if (!gptPrompt.trim() || isLoadingGPT) return;

    setIsLoadingGPT(true);
    setAssistantError('');
    setAssistantResponse(null);
    proposalEngineRef.current?.stop();
    setIsPlayingProposal(false);
    setProposalBar(-1);

    assistantRequestRef.current?.abort();
    const controller = new AbortController();
    assistantRequestRef.current = controller;
    const requestSequence = ++assistantRequestSequenceRef.current;

    try {
      const request = buildAiXELAssistantRequest({
        prompt: gptPrompt,
        selectedKey,
        selectedExtension,
        selectedBassInversion,
        isForeignBass,
        selectedStyle,
        timeSignature,
        tempo,
        measures
      });
      const response = await requestAiXELAssistant(request, { signal: controller.signal });
      if (requestSequence === assistantRequestSequenceRef.current) {
        setAssistantResponse(response);
      }
    } catch (error) {
      if (requestSequence === assistantRequestSequenceRef.current) {
        const isCancelled = error instanceof AiXELAssistantClientError && error.code === 'REQUEST_ABORTED';
        if (!isCancelled) {
          setAssistantError(
            error instanceof AiXELAssistantClientError
              ? error.message
              : 'AiXEL Assistant is temporarily unavailable.'
          );
        }
      }
    } finally {
      if (requestSequence === assistantRequestSequenceRef.current) {
        assistantRequestRef.current = null;
        setIsLoadingGPT(false);
      }
    }
  };

  const createLocalId = (prefix: string) => () => {
    const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
    return `${prefix}-${randomId}`;
  };

  const stopProposalPreview = () => {
    proposalEngineRef.current?.stop();
    setIsPlayingProposal(false);
    setProposalBar(-1);
  };

  const handleProposalPreview = async () => {
    const proposal = assistantResponse?.proposal;
    if (!proposal) return;
    if (isPlayingProposal) {
      stopProposalPreview();
      return;
    }

    const engine = proposalEngineRef.current ?? new AudioEngine();
    proposalEngineRef.current = engine;
    engine.stop();
    engine.scheduleSequence(
      assistantMeasuresToSequence(proposal.measures, createLocalId('preview')),
      tempo,
      false,
      (barIndex) => {
        setProposalBar(barIndex);
        if (barIndex === -1) setIsPlayingProposal(false);
      }
    );
    try {
      await engine.play();
      setIsPlayingProposal(true);
    } catch {
      stopProposalPreview();
      setAssistantError('The proposal preview could not start.');
    }
  };

  const handleApplyProposal = () => {
    const proposal = assistantResponse?.proposal;
    if (!proposal) return;
    stopProposalPreview();
    onApplyProposal(assistantMeasuresToSequence(proposal.measures, createLocalId('assistant')));
    setAssistantResponse(null);
    setGptPrompt('');
  };

  const handleCancelProposal = () => {
    stopProposalPreview();
    setAssistantResponse(null);
    setAssistantError('');
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
          <span className="text-sm font-semibold text-[#F9FAFB]">Ask AiXEL Assistant</span>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={gptPrompt}
            onChange={(e) => setGptPrompt(e.target.value)}
            maxLength={800}
            placeholder="e.g., Suggest a progression from this chord..."
            className="flex-1 bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#F9FAFB] placeholder-[#64748B] focus:outline-none focus:border-[#10B981]"
            onKeyDown={(e) => e.key === 'Enter' && handleSendToGPT()}
          />
          <button
            onClick={handleSendToGPT}
            disabled={isLoadingGPT || !gptPrompt.trim()}
            aria-label="Send to AiXEL Assistant"
            className="px-4 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
          >
            {isLoadingGPT ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {assistantError && (
          <div className="mt-3 p-3 bg-[#1E293B] rounded-lg text-sm text-[#FCA5A5]">
            {assistantError}
          </div>
        )}

        {assistantResponse && (
          <div className="mt-3 p-3 bg-[#1E293B] rounded-lg text-sm text-[#CBD5F5]">
            <p>{assistantResponse.message}</p>

            {assistantResponse.proposal && (
              <div className="mt-3 pt-3 border-t border-[#334155]">
                <p className="font-semibold text-[#F59E0B]">{assistantResponse.proposal.title}</p>
                <p className="mt-1 text-xs text-[#94A3B8]">{assistantResponse.proposal.rationale}</p>

                <div className="grid grid-cols-4 gap-1.5 mt-3">
                  {assistantResponse.proposal.measures.map((measure, index) => (
                    <div
                      key={measure.barNumber}
                      className={`rounded-md border px-1.5 py-2 text-center transition-colors ${
                        proposalBar === index
                          ? 'bg-[#F59E0B]/20 border-[#F59E0B]'
                          : 'bg-[#0F172A] border-[#334155]'
                      }`}
                    >
                      <div className="text-[9px] text-[#64748B]">bar {measure.barNumber}</div>
                      <div className="text-[10px] font-semibold text-[#F9FAFB] truncate">
                        {measure.slots.filter(Boolean).map((slot) =>
                          `${slot?.key}${slot?.extension}${slot?.bassInversion ? `/${slot.bassInversion}` : ''}`
                        ).join(' · ') || '—'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={handleProposalPreview}
                    className="px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {isPlayingProposal ? <VolumeX className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlayingProposal ? 'Stop' : 'Preview'}
                  </button>
                  <button
                    onClick={handleApplyProposal}
                    className="px-3 py-1.5 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Apply
                  </button>
                  <button
                    onClick={handleCancelProposal}
                    className="px-3 py-1.5 rounded-lg border border-[#475569] hover:bg-[#334155] text-[#CBD5F5] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
