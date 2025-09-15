import { Edit3, Upload } from 'lucide-react';

type ImportMode = 'individual' | 'bulk';

interface ImportModeToggleProps {
  importMode: ImportMode;
  onModeChange: (mode: ImportMode) => void;
}

function ImportModeToggle({ importMode, onModeChange }: ImportModeToggleProps) {
  return (
    <div>
      <h2 className="text-md font-semibold text-gray-700 mb-4">Choose Import Method</h2>
      <div className="bg-white/80 rounded-xl border border-gray-200 p-6">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onModeChange('individual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
              importMode === 'individual'
                ? 'border-accent bg-sharp-blue/10 '
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Individual Cards
          </button>

          <button
            type="button"
            onClick={() => onModeChange('bulk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
              importMode === 'bulk'
                ? 'border-muted-foreground/80 bg-muted-foreground/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportModeToggle;