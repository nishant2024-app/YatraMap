"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Stall } from "@/lib/types";
import StallCard from "@/components/StallCard";
import StallDetailModal from "@/components/StallDetailModal";

export default function StallsPage() {
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStall, setSelectedStall] = useState<Stall | null>(null);

    useEffect(() => {
        async function fetchStalls() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("stalls")
                .select("*")
                .eq("is_active", true)
                .order("stall_number", { ascending: true });

            if (error) {
                console.error("Error fetching stalls:", error);
            } else {
                setStalls(data || []);
            }
            setLoading(false);
        }

        fetchStalls();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="px-4 py-4 smooth-scroll">
            <h2 className="text-xl font-bold text-gray-800 mb-4 high-contrast">
                All Stalls
            </h2>

            {stalls.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium">No stalls available</p>
                    <p className="text-sm mt-2">Check back soon!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {stalls.map((stall) => (
                        <StallCard
                            key={stall.id}
                            stall={stall}
                            onClick={() => setSelectedStall(stall)}
                        />
                    ))}
                </div>
            )}

            <StallDetailModal
                stall={selectedStall}
                onClose={() => setSelectedStall(null)}
            />
        </div>
    );
}
