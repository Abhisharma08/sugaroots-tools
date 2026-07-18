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
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-zinc-800">
                    <img 
                        src="https://thesugaroots.com/wp-content/uploads/2026/02/SugaRoots-01.png" 
                        alt="TheSugaRoots"
                        className="h-8 w-auto object-contain dark:brightness-110" 
                    />
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                    >
                        <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm'
                                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                                    }`}
                                onClick={() => setIsOpen(false)} // Close on navigate on mobile
                            >
                                <item.icon
                                    className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300'
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
