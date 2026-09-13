import { FileText, ClipboardList, FileArchive } from 'lucide-react';
import type { InputType } from '../../types';

interface InputTypeSelectorProps {
  value: InputType;
  onChange: (type: InputType) => void;
}

const INPUT_TYPES: { value: InputType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'product_description',
    label: 'Product Description',
    description: 'Describe the product or item to be procured',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    value: 'technical_specification',
    label: 'Technical Specification',
    description: 'Enter detailed technical requirements',
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    value: 'tender_document',
    label: 'Tender Document',
    description: 'Paste or upload tender document content',
    icon: <FileArchive className="w-5 h-5" />,
  },
];

export default function InputTypeSelector({ value, onChange }: InputTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-3">
        Select Input Type
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {INPUT_TYPES.map((type) => {
          const isActive = value === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                isActive
                  ? 'border-teal bg-teal/5 shadow-sm'
                  : 'border-border hover:border-teal/40 hover:bg-surface'
              }`}
              aria-pressed={isActive}
            >
              <div
                className={`shrink-0 mt-0.5 transition-colors ${
                  isActive ? 'text-teal' : 'text-text-light'
                }`}
              >
                {type.icon}
              </div>
              <div>
                <div
                  className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-teal' : 'text-text-primary'
                  }`}
                >
                  {type.label}
                </div>
                <div className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                  {type.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
