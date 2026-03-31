export default function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="inline-flex bg-surface-card rounded-xl border border-surface-light/30 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 flex items-center justify-center py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
            value === option.value
              ? 'bg-primary text-bg shadow-sm'
              : 'text-text-muted hover:text-text hover:bg-surface-card/50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
