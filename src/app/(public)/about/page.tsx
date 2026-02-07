"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AboutContent } from "@/lib/types";
import { Calendar, History, Star, Users, Image as ImageIcon } from "lucide-react";

export default function AboutPage() {
    const [content, setContent] = useState<AboutContent["content"] | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        async function fetchContent() {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("about_content")
                .select("*")
                .limit(1);

            if (error) {
                console.error("Error fetching about content:", error);
            }
            setContent(data?.[0]?.content || null);
            setImages(data?.[0]?.images || []);
            setLoading(false);
        }

        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    const sections = [
        {
            icon: History,
            title: "History",
            content: content?.history || "The Mangrulpir Yatra is an annual celebration that brings together devotees from across the region to honor our traditions and seek blessings.",
            color: "text-amber-500",
            bg: "bg-amber-50",
        },
        {
            icon: Star,
            title: "Importance",
            content: content?.importance || "This sacred Yatra holds deep spiritual significance for our community, fostering unity and devotion among all participants.",
            color: "text-primary-500",
            bg: "bg-primary-50",
        },
        {
            icon: Calendar,
            title: "Schedule Highlights",
            content: content?.schedule || "The Yatra spans multiple days with various religious ceremonies, cultural programs, and community gatherings.",
            color: "text-green-500",
            bg: "bg-green-50",
        },
        {
            icon: Users,
            title: "Committee Message",
            content: content?.committee_message || "We welcome all devotees to participate in this auspicious occasion. May this Yatra bring peace and prosperity to all.",
            color: "text-blue-500",
            bg: "bg-blue-50",
        },
    ];

    return (
        <div className="px-4 py-6">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 high-contrast">
                    About the Yatra
                </h2>
                <p className="text-gray-500 mt-2">Mangrulpir Village Yatra</p>
            </div>

            {/* Image Gallery - At Top */}
            {images.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3 text-gray-600">
                        <ImageIcon size={18} />
                        <span className="font-medium">Photo Gallery</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {images.map((url, index) => (
                            <button
                                key={url}
                                onClick={() => setSelectedImage(url)}
                                className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                            >
                                <img
                                    src={url}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Sections */}
            <div className="space-y-4">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <div
                            key={section.title}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className={`${section.bg} px-4 py-3 flex items-center gap-3`}>
                                <Icon className={section.color} size={22} />
                                <h3 className="font-semibold text-gray-800">{section.title}</h3>
                            </div>
                            <div className="px-4 py-4">
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {section.content}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Lightbox for full image view */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Full view"
                        className="max-w-full max-h-full object-contain rounded-lg"
                    />
                </div>
            )}
        </div>
    );
}
