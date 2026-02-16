"use client";

import type { Stall } from "@/lib/types";
import { X } from "lucide-react";
import ImageCarousel from "./ImageCarousel";

interface StallDetailModalProps {
    stall: Stall | null;
    onClose: () => void;
}

export default function StallDetailModal({ stall, onClose }: StallDetailModalProps) {
    if (!stall) return null;

    const hasImages = stall.images && stall.images.length > 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop bg-black/40"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 translate-y-0 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: "85vh", animation: "slideUp 0.3s ease-out" }}
            >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2 relative z-10 bg-white">
                    <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
                </div>

                {/* Image Carousel - Above details */}
                {hasImages && (
                    <ImageCarousel
                        images={stall.images}
                        className="w-full"
                    />
                )}

                {/* Header */}
                <div className="flex items-start justify-between px-5 py-4 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-2xl font-bold text-white">
                                {stall.stall_number}
                            </span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{stall.name}</h2>
                            {stall.category && (
                                <span className="inline-block mt-1 px-3 py-1 bg-primary-50 text-primary-600 text-sm font-medium rounded-full">
                                    {stall.category}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors tap-target"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content - Description */}
                <div className="px-5 pb-8 overflow-y-auto bg-white" style={{ minHeight: "300px", maxHeight: hasImages ? "35vh" : "50vh" }}>
                    {stall.description ? (
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{stall.description}</p>
                    ) : (
                        <p className="text-gray-400 italic">No description available</p>
                    )}
                </div>
            </div>
        </div>
    );
}
