'use client';
import React, { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface TabItem {
    label: string;
    icon?: LucideIcon;
    children: ReactNode;
}

interface TabsProps {
    tabs: TabItem[];
}

export function Tabs({ tabs }: TabsProps) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="w-full">
            <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl mb-6">
                {tabs.map((tab, index) => {
                    const isActive = activeTab === index;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                        >
                            {Icon && (
                                <Icon
                                    className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'
                                        }`}
                                />
                            )}
                            <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
            <div className="focus:outline-none">
                {tabs[activeTab].children}
            </div>
        </div>
    );
}
