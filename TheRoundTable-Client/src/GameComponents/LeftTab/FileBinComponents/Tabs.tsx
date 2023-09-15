import { useState } from "react";

export const Tabs = () => {

  const tabs = ['sounds', 'maps', 'screen effects', 'AI voices', 'sequences']
  const [selectedTab, setSelectedTab] = ('sounds')
  
  return (
    <div className="tabs">
        {tabs.map((tabName, index) => (
          <a
            key={index}
            name={tabName}
            onClick={(e) => { setSelectedTab(e.target.name) }}
            className={`tab tab-lifted ${tabName === selectedTab ? 'tab-active' : null}`}
          >
            {tabName}
          </a>
        ))}
      </div>
  )
}