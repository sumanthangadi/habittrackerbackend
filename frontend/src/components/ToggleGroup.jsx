export default function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="inline-flex bg-surface-card rounded-xl border border-surface-light/30 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
            value === option.value
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-text-muted hover:text-text hover:bg-surface-light/30'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
