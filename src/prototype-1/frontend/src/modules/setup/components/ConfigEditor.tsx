/**
 * Config Editor Component
 * JSON configuration editor with validation
 * SPEC-MS-CE-* compliance
 */

import { useState, useEffect } from 'react';

interface ConfigEditorProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  height?: string;
}

export function ConfigEditor({
  config,
  onChange,
  height = '300px',
}: ConfigEditorProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  // Initialize with formatted JSON
  useEffect(() => {
    try {
      setJsonText(JSON.stringify(config, null, 2));
      setError(null);
      setIsValid(true);
    } catch (err) {
      setError('Failed to stringify config');
      setIsValid(false);
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonText(value);

    // Try to parse JSON
    try {
      const parsed = JSON.parse(value);
      setError(null);
      setIsValid(true);
      onChange(parsed);
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError(null);
      setIsValid(true);
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const minified = JSON.stringify(parsed);
      setJsonText(minified);
      setError(null);
      setIsValid(true);
    } catch (err: any) {
      setError(err.message);
      setIsValid(false);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-muted p-2 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">JSON Configuration</span>
          {isValid ? (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Valid
            </span>
          ) : (
            <span className="text-xs text-destructive flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Invalid
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleFormat}
            className="px-2 py-1 text-xs border rounded hover:bg-background transition-colors"
            title="Format JSON"
          >
            Format
          </button>
          <button
            onClick={handleMinify}
            className="px-2 py-1 text-xs border rounded hover:bg-background transition-colors"
            title="Minify JSON"
          >
            Minify
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={jsonText}
        onChange={handleChange}
        className="w-full p-4 font-mono text-sm bg-background focus:outline-none resize-none"
        style={{ height }}
        spellCheck={false}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border-t border-destructive p-3">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">JSON Error</p>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!error && (
        <div className="bg-muted/50 border-t p-2">
          <p className="text-xs text-muted-foreground">
            Edit the JSON configuration above. Changes are validated in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
