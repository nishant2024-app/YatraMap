"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Store, Map, Users, Eye } from "lucide-react";
import Link from "next/link";

interface Stats {
    totalStalls: number;
    activeStalls: number;
    totalSponsors: number;
    mapElements: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalStalls: 0,
        activeStalls: 0,
        totalSponsors: 0,
        mapElements: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient();

            const [stallsRes, sponsorsRes, elementsRes] = await Promise.all([
                supabase.from("stalls").select("id, is_active"),
                supabase.from("sponsors").select("id"),
                supabase.from("map_elements").select("id"),
            ]);

            const stalls = stallsRes.data || [];
            setStats({
                totalStalls: stalls.length,
                activeStalls: stalls.filter((s) => s.is_active).length,
                totalSponsors: sponsorsRes.data?.length || 0,
                mapElements: elementsRes.data?.length || 0,
            });
            setLoading(false);
        }

        fetchStats();
    }, []);

    const statCards = [
        {
            label: "Total Stalls",
            value: stats.totalStalls,
            icon: Store,
            color: "from-blue-500 to-blue-600",
            href: "/admin/stalls",
        },
        {
            label: "Active Stalls",
            value: stats.activeStalls,
            icon: Eye,
            color: "from-green-500 to-green-600",
            href: "/admin/stalls",
        },
        {
            label: "Sponsors",
            value: stats.totalSponsors,
            icon: Users,
            color: "from-amber-500 to-amber-600",
            href: "/admin/sponsors",
        },
        {
            label: "Map Elements",
            value: stats.mapElements,
            icon: Map,
            color: "from-purple-500 to-purple-600",
            href: "/admin/map-editor",
        },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {statCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <Link
                                    key={card.label}
                                    href={card.href}
                                    className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${card.color} mb-3`}>
                                        <Icon className="text-white" size={24} />
                                    </div>
                                    <p className="text-3xl font-bold text-white">{card.value}</p>
                                    <p className="text-gray-400 text-sm mt-1">{card.label}</p>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Quick Actions */}
                    <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            href="/admin/stalls"
                            className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                <Store className="text-primary-400" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Manage Stalls</p>
                                <p className="text-sm text-gray-400">Add, edit, or remove stalls</p>
                            </div>
                        </Link>

                        <Link
                            href="/admin/map-editor"
                            className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-primary-500 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                <Map className="text-primary-400" size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-white">Edit Map Layout</p>
                                <p className="text-sm text-gray-400">Drag & drop stalls and roads</p>
                            </div>
                        </Link>
                    </div>

                    {/* Public View Link */}
                    <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <p className="text-green-400 text-sm">
                            <strong>Tip:</strong> Open{" "}
                            <Link href="/" target="_blank" className="underline hover:text-green-300">
                                the public app
                            </Link>{" "}
                            in a new tab to preview your changes.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
