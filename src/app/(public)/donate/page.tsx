"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DonateInfo } from "@/lib/types";
import { Heart, QrCode } from "lucide-react";
import Image from "next/image";

export default function DonatePage() {
    const [donateInfo, setDonateInfo] = useState<DonateInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDonateInfo() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("donate_info")
                .select("*")
                .limit(1);

            if (error) {
                console.error("Error fetching donate info:", error);
            }
            setDonateInfo(data?.[0] || null);
            setLoading(false);
        }

        fetchDonateInfo();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-lg mb-4">
                    <Heart className="text-white" size={32} fill="currentColor" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 high-contrast">
                    Support the Yatra
                </h2>
                <p className="text-gray-500 mt-2">Your contribution makes a difference</p>
            </div>

            {/* Committee Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">
                    {donateInfo?.committee_name || "Yatra Committee"}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                    {donateInfo?.purpose_text || "Your donations help us organize the annual Yatra, maintain the temple, and support community activities."}
                </p>
            </div>

            {/* UPI QR Code */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                <h4 className="font-medium text-gray-700 mb-4 flex items-center justify-center gap-2">
                    <QrCode size={20} className="text-primary-500" />
                    Scan to Pay via UPI
                </h4>

                {donateInfo?.upi_qr_url ? (
                    <div className="relative w-48 h-48 mx-auto bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                        <Image
                            src={donateInfo.upi_qr_url}
                            alt="UPI QR Code"
                            fill
                            className="object-contain p-2"
                        />
                    </div>
                ) : (
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <QrCode size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">QR Code Coming Soon</p>
                        </div>
                    </div>
                )}

                <p className="text-xs text-gray-400 mt-4">
                    Scan with any UPI app to donate
                </p>
            </div>

            {/* Note */}
            <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                <p className="text-sm text-primary-700 text-center">
                    🙏 All donations are voluntary. No payment is processed through this app.
                </p>
            </div>
        </div>
    );
}
