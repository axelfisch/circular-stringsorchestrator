import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import chordData from '../data/AiXEL_20Chords_in12Keys.json';

interface CircularSelectorProps {
  onSelectionChange: (key: string, extension: string, bassInversion?: string, isForeignBass?: boolean) => void;
  onStyleChange?: (style: string) => void;
}

const keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const bassInversions = [
  { label: 'b2', interval: 'm2' },
  { label: '2', interval: 'M2' },
  { label: 'b3', interval: 'm3' },
  { label: '3', interval: 'M3' },
  { label: '4', interval: 'P4' },
  { label: '#4', interval: 'A4' },
  { label: '5', interval: 'P5' },
  { label: 'b6', interval: 'm6' },
  { label: '6', interval: 'M6' },
  { label: 'b7', interval: 'm7' },
  { label: '7', interval: 'M7' }
];

const foreignBassNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

const musicStyles = [
  'Bossa Nova',
  'Jazz Fusion',
  'Waltz Jazz',
  'Lo-fi Chill',
  'Cinematic Strings',
  'Modern Pop-Jazz',
  'Swing Mid-tempo',
  'Afro 6/8',
  'Soul / R&B Slow',
  'Funk Ballad',
  'Ballad Jazz'
];

export default function CircularSelector({ onSelectionChange, onStyleChange }: CircularSelectorProps) {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [selectedExtension, setSelectedExtension] = useState<string>('');
  const [selectedBassInversion, setSelectedBassInversion] = useState<string>('');
  const [isForeignBass, setIsForeignBass] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [styleRotation, setStyleRotation] = useState<number>(0);
  const [keyRotation, setKeyRotation] = useState<number>(0);
  const [extensionRotation, setExtensionRotation] = useState<number>(0);
  const [bassRotation, setBassRotation] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getExtensionsForKey = (key: string): string[] => {
    return (chordData as Record<string, string[]>)[key] || [];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 800;
    const styleOuterRadius = 380 * scale;
    const styleInnerRadius = 330 * scale;
    const outerRadius = 320 * scale;
    const keyRadius = 270 * scale;
    const extensionRadius = 180 * scale;
    const bassInversionRadius = 145 * scale;
    const centerRadius = 120 * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const extensions = getExtensionsForKey(selectedKey);

    // Draw outermost ring - Music Styles
    musicStyles.forEach((style, index) => {
      const startAngle = (index / musicStyles.length) * 2 * Math.PI - Math.PI / 2 + styleRotation;
      const endAngle = ((index + 1) / musicStyles.length) * 2 * Math.PI - Math.PI / 2 + styleRotation;
      const isSelected = selectedStyle === style;

      ctx.beginPath();
      ctx.arc(centerX, centerY, styleOuterRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, styleInnerRadius, endAngle, startAngle, true);
      ctx.closePath();

      // Create gradient for selected state
      if (isSelected) {
        const gradient = ctx.createRadialGradient(centerX, centerY, styleInnerRadius, centerX, centerY, styleOuterRadius);
        gradient.addColorStop(0, '#0EA5E9');
        gradient.addColorStop(1, '#3B82F6');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = '#0F172A';
      }
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.stroke();

      const textAngle = (startAngle + endAngle) / 2;
      const textRadius = (styleOuterRadius + styleInnerRadius) / 2;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);

      // Shining blue/white text with stronger glow
      ctx.fillStyle = isSelected ? '#FFFFFF' : '#60A5FA';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Add strong glow effect for styles
      if (isSelected) {
        ctx.shadowColor = '#3B82F6';
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 15;
      }

      const displayText = style.length > 15 ? style.substring(0, 14) + '...' : style;

      // Draw text multiple times for stronger glow
      ctx.fillText(displayText, 0, 0);
      ctx.fillText(displayText, 0, 0);
      ctx.fillText(displayText, 0, 0);

      // Reset shadow
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Draw second ring - Keys
    keys.forEach((key, index) => {
      const startAngle = (index / keys.length) * 2 * Math.PI - Math.PI / 2 + keyRotation;
      const endAngle = ((index + 1) / keys.length) * 2 * Math.PI - Math.PI / 2 + keyRotation;
      const isSelected = selectedKey === key;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, keyRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = isSelected ? '#4ADE80' : '#1E293B';
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();

      const textAngle = (startAngle + endAngle) / 2;
      const textRadius = (outerRadius + keyRadius) / 2;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = isSelected ? '#000' : '#F9FAFB';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(key, 0, 0);
      ctx.restore();
    });

    // Draw inner ring - Extensions
    if (extensions.length > 0) {
      extensions.forEach((ext, index) => {
        const extName = ext.replace(selectedKey, '');
        const startAngle = (index / extensions.length) * 2 * Math.PI - Math.PI / 2 + extensionRotation;
        const endAngle = ((index + 1) / extensions.length) * 2 * Math.PI - Math.PI / 2 + extensionRotation;
        const isSelected = selectedExtension === extName;

        ctx.beginPath();
        ctx.arc(centerX, centerY, keyRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, extensionRadius, endAngle, startAngle, true);
        ctx.closePath();

        ctx.fillStyle = isSelected ? '#A855F7' : '#0F172A';
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.stroke();

        const textAngle = (startAngle + endAngle) / 2;
        const textRadius = (keyRadius + extensionRadius) / 2;
        const textX = centerX + Math.cos(textAngle) * textRadius;
        const textY = centerY + Math.sin(textAngle) * textRadius;

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.fillStyle = isSelected ? '#FFF' : '#CBD5F5';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const displayText = extName.length > 10 ? extName.substring(0, 9) + '...' : extName;
        ctx.fillText(displayText, 0, 0);
        ctx.restore();
      });
    }

    // Draw bass inversion ring
    const bassOptions = isForeignBass ? foreignBassNotes : bassInversions;
    bassOptions.forEach((option, index) => {
      const startAngle = (index / bassOptions.length) * 2 * Math.PI - Math.PI / 2 + bassRotation;
      const endAngle = ((index + 1) / bassOptions.length) * 2 * Math.PI - Math.PI / 2 + bassRotation;
      const label = isForeignBass ? option : (option as {label: string, interval: string}).label;
      const isSelected = selectedBassInversion === label;

      ctx.beginPath();
      ctx.arc(centerX, centerY, extensionRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, bassInversionRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = isSelected ? (isForeignBass ? '#F59E0B' : '#10B981') : '#0F172A';
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.stroke();

      const textAngle = (startAngle + endAngle) / 2;
      const textRadius = (extensionRadius + bassInversionRadius) / 2;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = isSelected ? '#FFF' : (isForeignBass ? '#F59E0B' : '#10B981');
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });

    // Draw center display
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, 2 * Math.PI);
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
    centerGradient.addColorStop(0, '#1E293B');
    centerGradient.addColorStop(1, '#0F172A');
    ctx.fillStyle = centerGradient;
    ctx.fill();
    ctx.strokeStyle = '#4ADE80';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center text - KEY label
    ctx.fillStyle = '#4ADE80';
    ctx.font = `bold ${24 * scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('KEY', centerX, centerY - 30 * scale);

    // Center text - Selected key
    ctx.fillStyle = '#F9FAFB';
    ctx.font = `bold ${42 * scale}px sans-serif`;
    ctx.fillText(selectedKey, centerX, centerY + 10 * scale);

    // Extension if selected
    if (selectedExtension) {
      ctx.fillStyle = '#A855F7';
      ctx.font = `bold ${18 * scale}px sans-serif`;
      ctx.fillText(selectedExtension, centerX, centerY + 40 * scale);
    }

    // Bass inversion if selected
    if (selectedBassInversion) {
      ctx.fillStyle = isForeignBass ? '#F59E0B' : '#10B981';
      ctx.font = `bold ${14 * scale}px sans-serif`;
      ctx.fillText(`/${selectedBassInversion}`, centerX + 40 * scale, centerY + 40 * scale);
    }
  }, [selectedKey, selectedExtension, selectedBassInversion, isForeignBass, selectedStyle, styleRotation, keyRotation, extensionRotation, bassRotation]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) + Math.PI / 2;
    const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);

    const styleOuterRadius = 380;
    const styleInnerRadius = 330;
    const outerRadius = 320;
    const keyRadius = 270;
    const extensionRadius = 180;
    const bassInversionRadius = 145;
    const centerRadius = 120;

    // Check if click is in style ring (outermost)
    if (distance <= styleOuterRadius && distance >= styleInnerRadius) {
      const adjustedAngle = (normalizedAngle - styleRotation + 2 * Math.PI) % (2 * Math.PI);
      const segmentAngle = (2 * Math.PI) / musicStyles.length;
      const index = Math.floor(adjustedAngle / segmentAngle);
      const style = musicStyles[index];
      setSelectedStyle(style);
      if (onStyleChange) {
        onStyleChange(style);
      }
    }
    // Check if click is in key ring
    else if (distance <= outerRadius && distance >= keyRadius) {
      const adjustedAngle = (normalizedAngle - keyRotation + 2 * Math.PI) % (2 * Math.PI);
      const segmentAngle = (2 * Math.PI) / keys.length;
      const index = Math.floor(adjustedAngle / segmentAngle);
      const newKey = keys[index];
      setSelectedKey(newKey);
      setSelectedExtension('');
      onSelectionChange(newKey, '');
    }
    // Check if click is in extension ring
    else if (distance <= keyRadius && distance >= extensionRadius) {
      const extensions = getExtensionsForKey(selectedKey);
      if (extensions.length > 0) {
        const adjustedAngle = (normalizedAngle - extensionRotation + 2 * Math.PI) % (2 * Math.PI);
        const segmentAngle = (2 * Math.PI) / extensions.length;
        const index = Math.floor(adjustedAngle / segmentAngle);
        const ext = extensions[index].replace(selectedKey, '');
        setSelectedExtension(ext);
        onSelectionChange(selectedKey, ext, selectedBassInversion);
      }
    }
    // Check if click is in bass inversion ring
    else if (distance <= extensionRadius && distance >= centerRadius) {
      const bassOptions = isForeignBass ? foreignBassNotes : bassInversions;
      const adjustedAngle = (normalizedAngle - bassRotation + 2 * Math.PI) % (2 * Math.PI);
      const segmentAngle = (2 * Math.PI) / bassOptions.length;
      const index = Math.floor(adjustedAngle / segmentAngle);
      const bass = isForeignBass ? foreignBassNotes[index] : bassInversions[index].label;
      setSelectedBassInversion(bass);
      onSelectionChange(selectedKey, selectedExtension, bass, isForeignBass);
    }
  };

  const rotateLayer = (layer: 'style' | 'key' | 'extension' | 'bass', direction: 'left' | 'right') => {
    const angle = direction === 'left' ? -0.1 : 0.1;

    if (layer === 'style') {
      setStyleRotation(prev => prev + angle);
    } else if (layer === 'key') {
      setKeyRotation(prev => prev + angle);
    } else if (layer === 'extension') {
      setExtensionRotation(prev => prev + angle);
    } else if (layer === 'bass') {
      setBassRotation(prev => prev + angle);
    }
  };

  return (
    <div className="flex items-center gap-8 border-0 outline-none">
      {/* Navigation Controls - Left Side */}
      <div className="flex flex-col gap-2">
        {/* Styles Layer Controls */}
        <div className="flex items-center gap-2 bg-[#0F172A] rounded-lg p-2 border border-[#1E293B] fade-in">
          <button
            onClick={() => rotateLayer('style', 'left')}
            className="p-1 bg-[#1E293B] hover:bg-[#334155] rounded transition-all hover:scale-110 active:scale-95"
            title="Rotate styles left"
          >
            <ChevronLeft className="w-4 h-4 text-[#60A5FA]" />
          </button>
          <span className="text-xs text-[#60A5FA] font-semibold min-w-[80px] text-center">Styles</span>
          <button
            onClick={() => rotateLayer('style', 'right')}
            className="p-1 bg-[#1E293B] hover:bg-[#334155] rounded transition-all hover:scale-110 active:scale-95"
            title="Rotate styles right"
          >
            <ChevronRight className="w-4 h-4 text-[#60A5FA]" />
          </button>
        </div>

        {/* Keys Layer Controls */}
        <div className="flex items-center gap-2 bg-[#0F172A] rounded-lg p-2 border border-[#1E293B] fade-in">
          <button
            onClick={() => rotateLayer('key', 'left')}
            className="p-1 bg-[#1E293B] hover:bg-[#334155] rounded transition-all hover:scale-110 active:scale-95"
            title="Rotate keys left"
          >
            <ChevronLeft className="w-4 h-4 text-[#4ADE80]" />
          </button>
          <span className="text-xs text-[#4ADE80] font-semibold min-w-[80px] text-center">Keys</span>
          <button
            onClick={() => rotateLayer('key', 'right')}
            className="p-1 bg-[#1E293B] hover:bg-[#334155] rounded transition-all hover:scale-110 active:scale-95"
            title="Rotate keys right"
          >
            <ChevronRight className="w-4 h-4 text-[#4ADE80]" />
          </button>
        </div>

        {/* Extensions Layer Controls */}
        <div className="flex items-center gap-2 bg-[#0F172A] rounded-lg p-2 border border-[#1E293B] fade-in extension-highlight">
          <button
            onClick={() => rotateLayer('extension', 'left')}
            className="p-1 bg-[#1E293B] hover:bg-[#334155] rounded transition-all hover:scale-110 active:scale-95"
            title="Rotate extensions left"
          >
            <ChevronLeft className="w-4 h-4 text-[#A855F7]" />
          </button>
          <span className="text-xs text-[#A855F7] font-semibold min-w-[80px] text-center">Extensions</span>
          <button
            onClick={() => rotateLayer('extension', 'right')}
            className="p-1 bg-[#1E293B] hover:bg-[#334155] rounded transition-all hover:scale-110 active:scale-95"
            title="Rotate extensions right"
          >
            <ChevronRight className="w-4 h-4 text-[#A855F7]" />
          </button>
        </div>

        {/* Bass Inversion Layer Controls */}
        <div className="flex items-center gap-2 bg-[#0F172A] rounded-lg p-2 border border-[#1E293B] fade-in">
          <button
            onClick={() => rotateLayer('bass', 'left')}
            className="p-1 bg-[#1E293B] hover:bg-[#334155] rounded transition-all hover:scale-110 active:scale-95"
            title="Rotate bass inversions left"
          >
            <ChevronLeft className={`w-4 h-4 ${isForeignBass ? 'text-[#F59E0B]' : 'text-[#10B981]'}`} />
          </button>
          <span className={`text-xs font-semibold min-w-[80px] text-center ${isForeignBass ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>Bass</span>
          <button
            onClick={() => rotateLayer('bass', 'right')}
            className="p-1 bg-[#1E293B] hover:bg-[#334155] rounded transition-all hover:scale-110 active:scale-95"
            title="Rotate bass inversions right"
          >
            <ChevronRight className={`w-4 h-4 ${isForeignBass ? 'text-[#F59E0B]' : 'text-[#10B981]'}`} />
          </button>
        </div>

        {/* Toggle Foreign Bass Button */}
        <div className="flex items-center gap-2 bg-[#0F172A] rounded-lg p-2 border border-[#1E293B] fade-in">
          <button
            onClick={() => {
              setIsForeignBass(!isForeignBass);
              setSelectedBassInversion('');
            }}
            className={`px-3 py-1 rounded transition-all hover:scale-105 active:scale-95 font-semibold text-xs ${
              isForeignBass
                ? 'bg-[#F59E0B] text-white'
                : 'bg-[#1E293B] text-[#10B981] hover:bg-[#334155]'
            }`}
            title="Toggle between inversions and foreign bass"
          >
            {isForeignBass ? 'Foreign Bass' : 'Inversions'}
          </button>
        </div>
      </div>

      {/* Circular Selector - Center */}
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        onClick={handleCanvasClick}
        className="cursor-pointer drop-shadow-2xl transition-transform hover:scale-[1.01] ecm-fade border-0 outline-none max-w-[90vw] max-h-[90vh] w-auto h-auto"
        style={{ aspectRatio: '1/1' }}
      />
    </div>
  );
}
