"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Sponsor } from "@/lib/types";
import SponsorCard from "@/components/SponsorCard";

export default function SponsorsPage() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSponsors() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("sponsors")
                .select("*")
                .order("display_order", { ascending: true });

            if (error) {
                console.error("Error fetching sponsors:", error);
            } else {
                setSponsors(data || []);
            }
            setLoading(false);
        }

        fetchSponsors();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    // Group sponsors by tier
    const tiers = {
        platinum: sponsors.filter((s) => s.tier === "platinum"),
        gold: sponsors.filter((s) => s.tier === "gold"),
        supporter: sponsors.filter((s) => s.tier === "supporter" || !s.tier),
    };

    const tierConfig = [
        { key: "platinum", label: "Platinum Sponsors", emoji: "💎", color: "bg-gradient-to-r from-slate-600 to-slate-800" },
        { key: "gold", label: "Gold Sponsors", emoji: "🥇", color: "bg-gradient-to-r from-amber-500 to-amber-600" },
        { key: "supporter", label: "Supporters", emoji: "⭐", color: "bg-gradient-to-r from-primary-500 to-primary-600" },
    ];

    return (
        <div className="px-4 py-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 high-contrast">
                    🙏 Our Sponsors
                </h2>
                <p className="text-gray-500 mt-2">Thank you for your generous support</p>
            </div>

            {sponsors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium">Sponsor details coming soon</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {tierConfig.map((tier) => {
                        const tierSponsors = tiers[tier.key as keyof typeof tiers];
                        if (tierSponsors.length === 0) return null;

                        return (
                            <div key={tier.key}>
                                {/* Tier Header */}
                                <div className={`${tier.color} text-white px-4 py-2 rounded-t-xl flex items-center gap-2`}>
                                    <span>{tier.emoji}</span>
                                    <span className="font-semibold">{tier.label}</span>
                                </div>

                                {/* Sponsor Cards */}
                                <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 divide-y divide-gray-100">
                                    {tierSponsors.map((sponsor) => (
                                        <SponsorCard key={sponsor.id} sponsor={sponsor} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
