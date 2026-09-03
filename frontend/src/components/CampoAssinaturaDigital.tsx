import React, { useRef, useState, useEffect, useCallback } from 'react';
import './CampoAssinaturaDigital.css';

interface CampoAssinaturaDigitalProps {
  label?: string;
  value?: string;
  onChange?: (dataUrl: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export const CampoAssinaturaDigital: React.FC<CampoAssinaturaDigitalProps> = ({
  label = 'Assinatura do Executante',
  value,
  onChange,
  disabled = false,
  required = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const initCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const displayWidth = Math.max(rect.width || 420, 280);
    const displayHeight = 140;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = displayWidth * ratio;
    canvas.height = displayHeight * ratio;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx =
      typeof canvas.getContext === 'function'
        ? canvas.getContext('2d')
        : null;
    if (!ctx) return;

    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        setHasContent(true);
      };
      img.src = value;
    }
  }, [value]);

  useEffect(() => {
    initCanvasSize();
    window.addEventListener('resize', initCanvasSize);
    return () => window.removeEventListener('resize', initCanvasSize);
  }, [initCanvasSize]);

  const getCanvasCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is not supported
    }

    setIsDrawing(true);
    setIsFocused(true);
    const coords = getCanvasCoordinates(e);
    lastPointRef.current = coords;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 1.25, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    }
    setHasContent(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    const lastPoint = lastPointRef.current;
    if (!canvas || !lastPoint) return;

    const ctx =
      typeof canvas.getContext === 'function'
        ? canvas.getContext('2d')
        : null;
    if (!ctx) return;

    const currentPoint = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPointRef.current = currentPoint;
    setHasContent(true);
  };

  const finishDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    setIsDrawing(false);
    lastPointRef.current = null;

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const dataUrl =
      typeof canvas.toDataURL === 'function'
        ? canvas.toDataURL('image/png')
        : '';
    onChange?.(dataUrl);
  };

  const handleLimpar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx =
      typeof canvas.getContext === 'function'
        ? canvas.getContext('2d')
        : null;
    if (ctx) {
      ctx.clearRect(0, 0, rect.width, rect.height);
    }

    setHasContent(false);
    onChange?.('');
  };

  return (
    <div className="campo-assinatura-container">
      <div className="campo-assinatura-label">
        <span>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </span>
        {hasContent && !disabled && (
          <button
            type="button"
            className="btn-limpar-assinatura"
            onClick={handleLimpar}
            title="Limpar e assinar novamente"
          >
            Limpar assinatura
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className={`campo-assinatura-wrapper${disabled ? ' disabled' : ''}${
          isFocused && !disabled ? ' focus' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          className="campo-assinatura-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
          onBlur={() => setIsFocused(false)}
        />
        <div className="campo-assinatura-guia" />
        {!hasContent && (
          <div className="campo-assinatura-placeholder">
            <span>✍️ Assine aqui com o dedo, caneta touch ou mouse</span>
          </div>
        )}
      </div>

      <span className="campo-assinatura-hint">
        Use a tela sensível ao toque, caneta stylus ou o mouse para assinar no espaço acima.
      </span>
    </div>
  );
};
