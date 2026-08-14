import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import CircularSelector from './components/CircularSelector';
import ChordDisplay from './components/ChordDisplay';
import ChordSequencer from './components/ChordSequencer';
import OrchestrationPanel from './components/orchestrationpanel_v2';
import {
  addChordToFirstAvailable,
  createEmptyMeasures,
  removeSequenceChord,
  SequenceChord,
  toggleMeasureSplit
} from './utils/sequencerModel';

function App() {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [selectedExtension, setSelectedExtension] = useState<string>('');
  const [selectedBassInversion, setSelectedBassInversion] = useState<string>('');
  const [isForeignBass, setIsForeignBass] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [measures, setMeasures] = useState(createEmptyMeasures);
  const [tempo, setTempo] = useState(120);
  const timeSignature = '4/4' as const;

  const handleSelectionChange = (key: string, extension: string, bassInversion?: string, isForeign?: boolean) => {
    setSelectedKey(key);
    setSelectedExtension(extension);
    setSelectedBassInversion(bassInversion || '');
    setIsForeignBass(isForeign || false);
  };

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
  };

  const handleAddChord = () => {
    if (selectedKey) {
      const newChord: SequenceChord = {
        id: `${Date.now()}-${Math.random()}`,
        key: selectedKey,
        extension: selectedExtension,
        bassInversion: selectedBassInversion,
        isForeignBass
      };
      setMeasures((current) => addChordToFirstAvailable(current, newChord));
    }
  };

  const handleRemoveChord = (id: string) => {
    setMeasures((current) => removeSequenceChord(current, id));
  };

  const handleClearSequence = () => {
    setMeasures(createEmptyMeasures());
  };

  return (
    <div className="min-h-screen bg-[#050B16] flex flex-col p-4 md:p-8 py-4 md:py-6 overflow-x-hidden">
      {/* Header */}
      <div className="text-center mb-4 md:mb-6 fade-in">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2">
          <h1 className="text-2xl md:text-4xl font-bold text-[#FFFFFF] tracking-tight ecm-fade">
            StringsOrchestrator
          </h1>
          <a
            href="https://chatgpt.com/g/g-67f62c947c608191a9c8dc1cd0101e08-aixel-music-orchestrator"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold text-xs md:text-sm rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-green-500/30"
            title="Open AiXEL Music Orchestrator GPT"
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            AiXEL GPT
          </a>
        </div>
        <p className="text-[#A9B4C8] text-xs md:text-sm mb-1">
          Circular chord selector — AiXEL style
        </p>
        <p className="text-[#566072] text-xs">
          by AxelFisch©2025/2026
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-4 md:gap-6 mb-4 md:mb-6 max-w-[2000px] mx-auto w-full items-start justify-center px-2">
        {/* Left: Circular Selector with Controls */}
        <div className="flex-shrink-0 mx-auto xl:mx-0">
          <CircularSelector
            onSelectionChange={handleSelectionChange}
            onStyleChange={handleStyleChange}
          />
        </div>

        {/* Center & Right: Info Panels */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 w-full xl:w-auto flex-grow max-w-[900px] mx-auto xl:mx-0">
          {/* Chord Display */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <ChordDisplay
              selectedKey={selectedKey}
              selectedExtension={selectedExtension}
              selectedBassInversion={selectedBassInversion}
              isForeignBass={isForeignBass}
              selectedStyle={selectedStyle}
              onAddChord={handleAddChord}
            />
          </div>

          {/* Orchestration Panel */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <OrchestrationPanel
              selectedKey={selectedKey}
              selectedExtension={selectedExtension}
              selectedBassInversion={selectedBassInversion}
              isForeignBass={isForeignBass}
              selectedStyle={selectedStyle}
              measures={measures}
              timeSignature={timeSignature}
              tempo={tempo}
              onApplyProposal={setMeasures}
            />
          </div>
        </div>
      </div>

      {/* Bottom: Sequence and Transport */}
      <div className="max-w-[1600px] mx-auto w-full px-2">
        <ChordSequencer
          timeSignature={timeSignature}
          measures={measures}
          selectedStyle={selectedStyle}
          tempo={tempo}
          onTempoChange={setTempo}
          onRemoveChord={handleRemoveChord}
          onClearSequence={handleClearSequence}
          onToggleMeasure={(measureIndex) => setMeasures((current) => toggleMeasureSplit(current, measureIndex))}
        />
      </div>
    </div>
  );
}

export default App;
