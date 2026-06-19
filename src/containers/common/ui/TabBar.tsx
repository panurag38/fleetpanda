import './TabBar.css';

interface TabBarProps<T extends string> {
  tabs: Array<{ id: T; label: string }>;
  activeTab: T;
  onChange: (tab: T) => void;
}

export const TabBar = <T extends string>({ tabs, activeTab, onChange }: TabBarProps<T>) => (
  <div className="tab-bar" role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={activeTab === tab.id}
        className={`tab-bar__tab ${activeTab === tab.id ? 'tab-bar__tab--active' : ''}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
