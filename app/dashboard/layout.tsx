'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { AuthProvider } from '@/components/AuthProvider';
import { FitnessDataHydrator } from '@/components/FitnessDataHydrator';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ErrorBoundary>
            <AuthProvider>
                <FitnessDataHydrator>
                    <div className="flex h-dvh overflow-hidden bg-cyan-50/60 dark:bg-zinc-950">
                        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

                        <div className="flex flex-col flex-1 w-0 overflow-hidden">
                            <Header onMenuClick={() => setSidebarOpen(true)} />

                            <main className="flex-1 relative overflow-y-auto overscroll-contain focus:outline-none">
                                <div className="py-5 sm:py-7 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24 lg:pb-7">
                                    <ErrorBoundary>
                                        {children}
                                    </ErrorBoundary>
                                </div>
                            </main>
                        </div>

                        <BottomNav onMoreClick={() => setSidebarOpen(true)} />
                    </div>
                </FitnessDataHydrator>
            </AuthProvider>
        </ErrorBoundary>
    );
}

