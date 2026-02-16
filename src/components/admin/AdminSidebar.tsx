"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
    LayoutDashboard,
    Store,
    Map,
    Users,
    Info,
    Heart,
    LogOut,
    Sparkles,
} from "lucide-react";

interface AdminSidebarProps {
    user: User;
}

const menuItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/stalls", label: "Stalls", icon: Store },
    { href: "/admin/map-editor", label: "Map Editor", icon: Map },
    { href: "/admin/sponsors", label: "Sponsors", icon: Users },
    { href: "/admin/about", label: "About Content", icon: Info },
    { href: "/admin/donate", label: "Donate Info", icon: Heart },
    { href: "/admin/welcome", label: "Welcome Popup", icon: Sparkles },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    🕉️ YatraMap
                    <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                        Admin
                    </span>
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? "bg-primary-500/20 text-primary-400"
                                : "text-gray-400 hover:bg-gray-700 hover:text-white"
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User & Logout */}
            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <span className="text-primary-400 font-semibold text-sm">
                            {user.email?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
}
