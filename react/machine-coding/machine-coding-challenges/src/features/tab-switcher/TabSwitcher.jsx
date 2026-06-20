import { useState } from "react";
import styles from "./TabSwitcher.module.css";
export default function TabSwitcher() {
  const tabs = [
    { id: 1, label: "Tab 1", content: "Content for Tab 1" },
    { id: 2, label: "Tab 2", content: "Content for Tab 2" },
    {
      id: 3,
      label: "Tab 3",
      content: "Content for Tab 3",
    },
  ];

  const [activeTabContent, setActiveTabContent] = useState(tabs[0].content);

  const handleTabClick = (content) => {
    setActiveTabContent(content);
  };
  return (
    <div>
      <h2>Tab Switcher</h2>
      <div className={styles.tabsContainer}>
        {tabs.map((tab) => {
          return (
            <div onClick={() => handleTabClick(tab.content)} key={tab.id}>
              <h3 className={styles.tab}>{tab.label}</h3>
            </div>
          );
        })}
      </div>
      <div>
        <p>{activeTabContent}</p>
      </div>
    </div>
  );
}
