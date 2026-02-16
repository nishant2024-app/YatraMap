"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WelcomePopup } from "@/lib/types";
import { X } from "lucide-react";

export default function WelcomePopupComponent() {
    const [popup, setPopup] = useState<WelcomePopup | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if popup was already dismissed this session
        const dismissed = sessionStorage.getItem("welcomePopupDismissed");
        if (dismissed) return;

        async function fetchPopup() {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("welcome_popup")
                    .select("*")
                    .eq("is_active", true)
                    .order("created_at", { ascending: false })
                    .limit(1);

                if (error) {
                    console.error("Error fetching welcome popup:", error);
                    return;
                }

                if (data && data.length > 0) {
                    setPopup(data[0]);
                    setIsVisible(true);
                }
            } catch (err) {
                console.error("Failed to fetch welcome popup:", err);
            }
        }

        fetchPopup();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem("welcomePopupDismissed", "true");
    };

    if (!isVisible || !popup) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={handleClose}
        >
            <div
                className="relative max-w-[90vw] max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                    <X size={24} className="text-gray-700" />
                </button>

                {/* Popup Image */}
                <img
                    src={popup.image_url}
                    alt="Welcome"
                    className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
                    style={{ animation: "slideUp 0.3s ease-out" }}
                    onError={handleClose}
                />
            </div>
        </div>
    );
}
