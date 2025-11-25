interface Props<T extends string> {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
}

export const TabList = <T extends string>({ tabs, active, onChange }: Props<T>) => (
  <div className="tabs">
    {tabs.map(tab => (
      <button
        key={tab}
        className={`tab ${tab === active ? 'tab--active' : ''}`}
        type="button"
        onClick={() => onChange(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);
