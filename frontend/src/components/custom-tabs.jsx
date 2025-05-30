"use client"

import { useState } from "react"

export function CustomTabs({ defaultTab, tabs, children }) {
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].value : ""))

  return (
    <div className="w-full">
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "border-b-2 border-theme-2 text-theme-2"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {children.map((child) => (
          <div key={child.props.value} className={activeTab === child.props.value ? "block" : "hidden"}>
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CustomTabsContent({ value, children }) {
  return <div value={value}>{children}</div>
}

