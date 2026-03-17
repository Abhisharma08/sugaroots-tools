'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { AuthProvider } from '@/components/AuthProvider';
import { FitnessDataHydrator } from '@/components/FitnessDataHydrator';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AuthProvider>
            <FitnessDataHydrator>
                <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans">
                    <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

                    <div className="flex flex-col flex-1 w-0 overflow-hidden">
                        <Header onMenuClick={() => setSidebarOpen(true)} />

                        <main className="flex-1 relative overflow-y-auto focus:outline-none">
                            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </FitnessDataHydrator>
        </AuthProvider>
    );
}
