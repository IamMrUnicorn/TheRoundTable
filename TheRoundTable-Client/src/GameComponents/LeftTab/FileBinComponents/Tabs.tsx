import { useState, MouseEvent } from "react";

export const Tabs = () => {
  const tabs = ['sounds', 'maps', 'screen effects', 'AI voices', 'sequences'];
  const [selectedTab, setSelectedTab] = useState('sounds');
  
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLAnchorElement;
    const name = target.getAttribute("data-name");
    if (name) {
      setSelectedTab(name);
    }
  };

  return (
    <div className="tabs flex flex-row justify-center">
      {tabs.map((tabName, index) => (
        <a
          key={index}
          data-name={tabName}
          onClick={handleClick}
          className={`tab tab-lifted ${tabName === selectedTab ? 'tab-active' : ''}`}
        >
          {tabName}
        </a>
      ))}
    </div>
  );
}
