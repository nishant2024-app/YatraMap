"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutList,
    Heart,
    Map,
    Info,
    Star
} from "lucide-react";

const navItems = [
    { href: "/stalls", label: "Stalls", icon: LayoutList },
    { href: "/donate", label: "Donate", icon: Heart },
    { href: "/map", label: "Map", icon: Map, isCenter: true },
    { href: "/about", label: "About", icon: Info },
    { href: "/sponsors", label: "Sponsors", icon: Star },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg safe-area-bottom">
            <div className="flex justify-around items-end h-16 max-w-lg mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isCenter) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center -mt-5 relative"
                            >
                                {/* Elevated circle button */}
                                <div
                                    className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${isActive
                                            ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white scale-105"
                                            : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"
                                        }`}
                                >
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] mt-1.5 font-semibold transition-colors ${isActive ? "text-primary-600" : "text-gray-500"
                                    }`}>
                                    {item.label}
                                </span>
                                {/* Active indicator line */}
                                {isActive && (
                                    <div className="absolute -bottom-1 w-8 h-0.5 bg-primary-500 rounded-full" />
                                )}
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center py-2 px-2 min-w-[56px] transition-colors relative ${isActive ? "text-primary-600" : "text-gray-500"
                                }`}
                        >
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 1.75}
                                className={`transition-all ${isActive ? "text-primary-600" : "text-gray-500"}`}
                            />
                            <span className={`text-[10px] mt-1 transition-all ${isActive ? "font-semibold text-primary-600" : "font-medium text-gray-500"
                                }`}>
                                {item.label}
                            </span>
                            {/* Active indicator line */}
                            {isActive && (
                                <div className="absolute bottom-0 w-8 h-0.5 bg-primary-500 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
