

interface OptionCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export default function OptionCheckbox({ checked, onChange, label }: OptionCheckboxProps) {
  return (
    <div className="p-2 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.7) 0%, rgba(26, 8, 8, 0.7) 100%)',
        border: '1px solid',
        borderImage: 'linear-gradient(135deg, rgba(255, 0, 0, 0.4) 0%, rgba(0, 212, 255, 0.4) 100%) 1',
        boxShadow: '0 0 15px rgba(127, 106, 127, 0.3)',
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
      }}
    >
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-red-500 cursor-pointer"
        />
        <span
          className="text-white text-xs tracking-wider uppercase group-hover:text-red-400 transition-colors"
          style={{ fontFamily: '"Reborn Technologies", sans-serif' }}
        >
          {label}
        </span>
      </label>
    </div>
  );
}
