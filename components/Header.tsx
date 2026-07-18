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
        <header className="sticky top-0 z-10 flex flex-shrink-0 h-[76px] bg-white/90 dark:bg-zinc-900/90 border-b border-cyan-100 dark:border-zinc-800 backdrop-blur">
            <button
                type="button"
                className="grid w-14 place-items-center text-cyan-800 lg:hidden"
                onClick={onMenuClick}
            >
                <span className="sr-only">Open sidebar</span>
                <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
            <div className="flex justify-between flex-1 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1 items-center">
                    <p className="hidden text-sm font-semibold text-cyan-950 sm:block dark:text-cyan-50">Your daily wellbeing space</p>
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
                <div className="flex items-center ml-4 gap-2 md:ml-6">
                    <ThemeToggle />
                    <button className="grid size-11 place-items-center text-zinc-500 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors" aria-label="View notifications">
                        <span className="sr-only">View notifications</span>
                        <Bell className="w-5 h-5" aria-hidden="true" />
                    </button>
                    <div className="relative">
                        <button
                            className="flex items-center justify-center size-10 text-xs font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 rounded-lg transition-colors hover:bg-cyan-200 dark:hover:bg-cyan-900"
                            title={displayName}
                        >
                            {initials || <UserCircle className="w-5 h-5" />}
                        </button>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="grid size-11 place-items-center text-zinc-500 hover:text-red-600 bg-cyan-50 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
