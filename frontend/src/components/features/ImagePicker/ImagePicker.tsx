/* ═══════════════════════════════════════════════════════════════════════════
   IMAGE PICKER COMPONENT
   Drag & drop, file select, and camera capture for image upload
   ═══════════════════════════════════════════════════════════════════════════ */

import { useState, useCallback, useRef } from 'react';
import { OrnateFrame } from '@/components/common/OrnateFrame';
import { Button } from '@/components/common/Button';
import styles from './ImagePicker.module.css';

// ─────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────

export interface ImagePickerProps {
  onImageSelect: (base64: string) => void;
  disabled?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────

const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// ─────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────

export function ImagePicker({
  onImageSelect,
  disabled = false,
  className = '',
}: ImagePickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Mobile detection
  const isMobile =
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Process selected file
  const processFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate type
      if (!VALID_TYPES.includes(file.type)) {
        setError('JPEG、PNG、WebP形式の画像を選択してください');
        return;
      }

      // Validate size
      if (file.size > MAX_SIZE) {
        setError('ファイルサイズは10MB以下にしてください');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onImageSelect(base64);
      };
      reader.onerror = () => {
        setError('画像の読み込みに失敗しました');
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  // Drag & drop handlers
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [disabled, processFile]
  );

  // File input handler
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  // Clear preview
  const handleClear = useCallback(() => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }, []);

  // Render preview state
  if (preview) {
    return (
      <div className={`${styles.previewContainer} ${className}`}>
        <OrnateFrame variant="dark" size="md">
          <div className={styles.preview}>
            <img src={preview} alt="選択された画像" className={styles.previewImage} />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className={styles.clearButton}
            >
              別の画像を選択
            </Button>
          </div>
        </OrnateFrame>
      </div>
    );
  }

  // Render picker state
  return (
    <div className={className}>
      <OrnateFrame variant="dark" size="lg" glow={isDragging}>
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.content}>
            {/* Icon */}
            <div className={styles.iconWrapper}>
              <TreasureChestIcon />
            </div>

            {/* Instructions */}
            <h3 className={styles.title}>お宝を見つけよう</h3>
            <p className={styles.subtitle}>
              画像をドロップ、または選択してください
            </p>

            {/* Buttons */}
            <div className={styles.buttons}>
              {/* File select */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={disabled}
                hidden
                aria-label="ファイルを選択"
              />
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                icon={<FileIcon />}
              >
                ファイルを選択
              </Button>

              {/* Camera capture (mobile only) */}
              {isMobile && (
                <>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    disabled={disabled}
                    hidden
                    aria-label="カメラで撮影"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={disabled}
                    icon={<CameraIcon />}
                  >
                    カメラで撮影
                  </Button>
                </>
               )}
            </div>

            {/* Error message */}
            {error && <p className={styles.error}>{error}</p>}

            {/* Hint */}
            <p className={styles.hint}>
              対応形式: JPEG, PNG, WebP (最大10MB)
            </p>
          </div>
        </div>
      </OrnateFrame>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────

function TreasureChestIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={styles.icon}>
      {/* Chest body */}
      <rect
        x="8"
        y="28"
        width="48"
        height="28"
        rx="4"
        fill="var(--color-leather)"
        stroke="var(--color-gold)"
        strokeWidth="2"
      />
      {/* Chest lid */}
      <path
        d="M8 28C8 28 8 16 32 16C56 16 56 28 56 28"
        fill="var(--color-leather-light)"
        stroke="var(--color-gold)"
        strokeWidth="2"
      />
      {/* Lock plate */}
      <rect
        x="26"
        y="32"
        width="12"
        height="12"
        rx="2"
        fill="var(--color-gold)"
      />
      {/* Keyhole */}
      <circle cx="32" cy="36" r="2" fill="var(--color-leather-dark)" />
      <rect x="31" y="38" width="2" height="4" fill="var(--color-leather-dark)" />
      {/* Shine effect */}
      <ellipse
        cx="20"
        cy="22"
        rx="4"
        ry="2"
        fill="var(--color-gold-light)"
        opacity="0.5"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 18v-6" />
      <path d="M9 15l3-3 3 3" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default ImagePicker;
