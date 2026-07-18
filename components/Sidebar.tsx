'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, X, ListChecks, Wind, HeartPulse, Dumbbell, Target } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Health Tracker', href: '/dashboard/health-tracker', icon: HeartPulse },
    { name: 'Workout Planner', href: '/dashboard/workout-planner', icon: Dumbbell },
    { name: 'BMR & TDEE', href: '/dashboard/tools/bmr', icon: Activity },
    { name: 'Weight Loss Plan', href: '/dashboard/tools/weight-loss', icon: Target },
    { name: 'Habits', href: '/dashboard/habits', icon: ListChecks },
    { name: 'Stress Relief', href: '/dashboard/stress-relief', icon: Wind },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-30 w-72 bg-white/95 dark:bg-zinc-900/95 border-r border-cyan-100 dark:border-zinc-800 backdrop-blur transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-[76px] px-6 border-b border-cyan-100 dark:border-zinc-800">
                    <img 
                        src="https://thesugaroots.com/wp-content/uploads/2026/02/SugaRoots-01.png" 
                        alt="TheSugaRoots"
                        className="h-9 w-auto object-contain dark:brightness-110"
                    />
                    <button
                        onClick={() => setIsOpen(false)}
                        className="grid size-11 place-items-center rounded-lg text-zinc-500 hover:bg-cyan-50 hover:text-cyan-800 dark:hover:bg-zinc-800 lg:hidden"
                    >
                        <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>
                <nav className="p-4 space-y-1.5" aria-label="Primary navigation">
                    {navigation.map((item) => {
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex min-h-11 items-center px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                                    ? 'bg-cyan-100 text-cyan-950 dark:bg-cyan-950/70 dark:text-cyan-100'
                                    : 'text-zinc-600 hover:bg-cyan-50 hover:text-cyan-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                                    }`}
                                onClick={() => setIsOpen(false)} // Close on navigate on mobile
                            >
                                <item.icon
                                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-cyan-700 dark:text-cyan-300' : 'text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300'
                                        }`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
