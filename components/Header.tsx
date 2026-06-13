'use client';
import { useRouter } from 'next/navigation';
import { Menu, UserCircle, Bell, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/components/AuthProvider';
import { useFitnessStore } from '@/store/useFitnessStore';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
    const router = useRouter();
    const { logout } = useAuth();
    const userInfo = useFitnessStore((s) => s.userInfo);

    const handleLogout = async () => {
        await logout();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('SugaRoots_user_info');
        }
        router.push('/login');
        router.refresh();
    };

    const displayName = userInfo?.displayName || userInfo?.firstName || 'User';
    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className="sticky top-0 z-10 flex flex-shrink-0 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
            <button
                type="button"
                className="px-4 text-zinc-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                onClick={onMenuClick}
            >
                <span className="sr-only">Open sidebar</span>
                <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
            <div className="flex justify-between flex-1 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1 items-center">
                    {userInfo && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 hidden sm:block">
                                {displayName}
                            </span>
                            {userInfo.email && (
                                <span className="text-xs text-zinc-400 hidden md:block">
                                    ({userInfo.email})
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center ml-4 space-x-2 md:ml-6">
                    <ThemeToggle />
                    <button className="p-2 text-zinc-400 hover:text-zinc-500 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors">
                        <span className="sr-only">View notifications</span>
                        <Bell className="w-5 h-5" aria-hidden="true" />
                    </button>
                    <div className="relative">
                        <button
                            className="flex items-center justify-center w-8 h-8 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:ring-2"
                            title={displayName}
                        >
                            {initials || <UserCircle className="w-5 h-5" />}
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-50 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        title="Sign out"
                    >
                        <span className="sr-only">Sign out</span>
                        <LogOut className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </header>
    );
}
