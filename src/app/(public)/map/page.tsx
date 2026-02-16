"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Stall, MapElement } from "@/lib/types";
import { MAP_CONFIG } from "@/lib/types";
import StallDetailModal from "@/components/StallDetailModal";
import { ZoomIn, ZoomOut, LocateFixed } from "lucide-react";

export default function MapPage() {
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [mapElements, setMapElements] = useState<MapElement[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStall, setSelectedStall] = useState<Stall | null>(null);
    const [scale, setScale] = useState(1);
    const [baseScale, setBaseScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isInitialized, setIsInitialized] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { GRID_SIZE, CANVAS_COLS, CANVAS_ROWS } = MAP_CONFIG;
    const canvasWidth = CANVAS_COLS * GRID_SIZE;
    const canvasHeight = CANVAS_ROWS * GRID_SIZE;

    // Calculate content bounds (actual area with stalls/roads)
    const contentBounds = useMemo(() => {
        if (stalls.length === 0 && mapElements.length === 0) {
            return { minX: 0, minY: 0, maxX: canvasWidth, maxY: canvasHeight };
        }

        let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

        stalls.forEach(stall => {
            minX = Math.min(minX, stall.x * GRID_SIZE);
            minY = Math.min(minY, stall.y * GRID_SIZE);
            maxX = Math.max(maxX, (stall.x + (stall.width || 2)) * GRID_SIZE);
            maxY = Math.max(maxY, (stall.y + (stall.height || 1)) * GRID_SIZE);
        });

        mapElements.forEach(el => {
            minX = Math.min(minX, el.x * GRID_SIZE);
            minY = Math.min(minY, el.y * GRID_SIZE);
            maxX = Math.max(maxX, (el.x + el.width) * GRID_SIZE);
            maxY = Math.max(maxY, (el.y + el.height) * GRID_SIZE);
        });

        // Add padding around content
        const padding = GRID_SIZE * 2;
        return {
            minX: Math.max(0, minX - padding),
            minY: Math.max(0, minY - padding),
            maxX: Math.min(canvasWidth, maxX + padding),
            maxY: Math.min(canvasHeight, maxY + padding),
        };
    }, [stalls, mapElements, GRID_SIZE, canvasWidth, canvasHeight]);

    // Calculate initial scale to fit content in viewport
    const initializeMapView = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate content dimensions
        const contentWidth = contentBounds.maxX - contentBounds.minX;
        const contentHeight = contentBounds.maxY - contentBounds.minY;

        // Calculate scale to fit content (contain mode)
        const scaleX = containerWidth / contentWidth;
        const scaleY = containerHeight / contentHeight;
        const fitScale = Math.min(scaleX, scaleY, 2.5); // Cap at 2.5x zoom

        setBaseScale(fitScale);
        setScale(fitScale);

        // Center the content in the viewport
        const scaledContentWidth = contentWidth * fitScale;
        const scaledContentHeight = contentHeight * fitScale;
        const offsetX = (containerWidth - scaledContentWidth) / 2 - contentBounds.minX * fitScale;
        const offsetY = (containerHeight - scaledContentHeight) / 2 - contentBounds.minY * fitScale;

        setPosition({ x: offsetX, y: offsetY });
        setIsInitialized(true);
    }, [contentBounds]);

    useEffect(() => {
        async function fetchMapData() {
            try {
                const supabase = createClient();

                const [stallsRes, elementsRes] = await Promise.all([
                    supabase.from("stalls").select("*").eq("is_active", true),
                    supabase.from("map_elements").select("*"),
                ]);

                if (stallsRes.error) console.error("Error fetching stalls:", stallsRes.error);
                if (elementsRes.error) console.error("Error fetching map elements:", elementsRes.error);

                setStalls(stallsRes.data || []);
                setMapElements(elementsRes.data || []);
            } catch (error) {
                console.error("Failed to fetch map data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchMapData();
    }, []);

    // Initialize map view after loading and when content changes
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                initializeMapView();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [loading, initializeMapView]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            initializeMapView();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [initializeMapView]);

    // Touch/Mouse handlers for pan
    const handlePointerDown = (e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest("[data-stall]")) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        setIsDragging(false);
    };

    const handleZoom = (delta: number) => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        setScale(prev => {
            const minScale = baseScale * 0.5;
            const maxScale = baseScale * 4;
            const newScale = Math.min(Math.max(prev + delta * baseScale, minScale), maxScale);

            // Adjust position to zoom towards center
            const scaleRatio = newScale / prev;
            setPosition(pos => ({
                x: centerX - (centerX - pos.x) * scaleRatio,
                y: centerY - (centerY - pos.y) * scaleRatio,
            }));

            return newScale;
        });
    };

    const resetView = () => {
        initializeMapView();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    // Empty state
    if (stalls.length === 0 && mapElements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-gray-500 px-4">
                <LocateFixed size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">No map content yet</p>
                <p className="text-sm mt-2 text-center">Stalls and roads will appear here once added by the admin.</p>
            </div>
        );
    }

    return (
        <div className="relative h-[calc(100vh-8rem)] overflow-hidden bg-background">
            {/* Map Controls */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                <button
                    onClick={() => handleZoom(0.25)}
                    className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center active:bg-gray-50 transition-colors"
                    aria-label="Zoom in"
                >
                    <ZoomIn size={20} className="text-gray-700" />
                </button>
                <button
                    onClick={() => handleZoom(-0.25)}
                    className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center active:bg-gray-50 transition-colors"
                    aria-label="Zoom out"
                >
                    <ZoomOut size={20} className="text-gray-700" />
                </button>
                <button
                    onClick={resetView}
                    className="w-11 h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center active:bg-gray-50 transition-colors"
                    aria-label="Center view"
                >
                    <LocateFixed size={18} className="text-gray-700" />
                </button>
            </div>

            {/* Legend */}
            <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-gray-100 text-xs">
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-4 h-4 bg-white border-2 border-primary-500 rounded-sm"></div>
                    <span className="text-gray-700 font-medium">Stall</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-road rounded-sm"></div>
                    <span className="text-gray-700 font-medium">Road</span>
                </div>
            </div>

            {/* Map Canvas */}
            <div
                ref={containerRef}
                className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <div
                    className="relative will-change-transform"
                    style={{
                        width: canvasWidth,
                        height: canvasHeight,
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: "top left",
                        transition: isDragging ? "none" : "transform 0.15s ease-out",
                    }}
                >
                    {/* Background Grid */}
                    <div
                        className="absolute inset-0 bg-background"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
                            `,
                            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                        }}
                    />

                    {/* Road Elements */}
                    {mapElements
                        .filter((el) => el.type === "road")
                        .map((road) => (
                            <div
                                key={road.id}
                                className="absolute bg-road rounded-sm"
                                style={{
                                    left: road.x * GRID_SIZE,
                                    top: road.y * GRID_SIZE,
                                    width: road.width * GRID_SIZE,
                                    height: road.height * GRID_SIZE,
                                }}
                            />
                        ))}

                    {/* Stall Boxes */}
                    {stalls.map((stall) => (
                        <button
                            key={stall.id}
                            data-stall
                            onClick={() => setSelectedStall(stall)}
                            className="absolute bg-white border-2 border-primary-500 rounded-lg shadow-sm flex items-center justify-center font-bold text-primary-600 hover:bg-primary-50 hover:shadow-md active:scale-95 transition-all"
                            style={{
                                left: stall.x * GRID_SIZE + 2,
                                top: stall.y * GRID_SIZE + 2,
                                width: (stall.width || 2) * GRID_SIZE - 4,
                                height: (stall.height || 1) * GRID_SIZE - 4,
                                fontSize: Math.max(14, Math.min((stall.width || 2) * 10, 28)),
                            }}
                        >
                            {stall.stall_number}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stall Detail Modal */}
            <StallDetailModal
                stall={selectedStall}
                onClose={() => setSelectedStall(null)}
            />
        </div>
    );
}
