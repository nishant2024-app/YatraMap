"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Stall, MapElement } from "@/lib/types";
import { MAP_CONFIG } from "@/lib/types";
import { Trash2, Minus } from "lucide-react";

type DragItem = { type: "stall"; stall: Stall } | { type: "element"; element: MapElement } | null;

export default function MapEditorPage() {
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [mapElements, setMapElements] = useState<MapElement[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DragItem>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [addMode, setAddMode] = useState<"road" | null>(null);

    const { GRID_SIZE, CANVAS_COLS, CANVAS_ROWS } = MAP_CONFIG;
    const canvasWidth = CANVAS_COLS * GRID_SIZE;
    const canvasHeight = CANVAS_ROWS * GRID_SIZE;

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const [stallsRes, elementsRes] = await Promise.all([
            supabase.from("stalls").select("*").order("stall_number", { ascending: true }),
            supabase.from("map_elements").select("*"),
        ]);
        setStalls(stallsRes.data || []);
        setMapElements(elementsRes.data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        if (!addMode) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
        const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);

        if (addMode === "road") {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("map_elements")
                .insert({ type: "road", x, y, width: 1, height: 1 })
                .select()
                .single();

            if (!error && data) {
                setMapElements((prev) => [...prev, data]);
            }
        }
    };

    const handleStallDragStart = (stall: Stall, e: React.PointerEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setSelectedItem({ type: "stall", stall });
    };

    const handleElementDragStart = (element: MapElement, e: React.PointerEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setSelectedItem({ type: "element", element });
    };

    const handleDrop = async (e: React.PointerEvent<HTMLDivElement>) => {
        if (!selectedItem) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - dragOffset.x) / GRID_SIZE);
        const y = Math.floor((e.clientY - rect.top - dragOffset.y) / GRID_SIZE);

        const clampedX = Math.max(0, Math.min(x, CANVAS_COLS - 1));
        const clampedY = Math.max(0, Math.min(y, CANVAS_ROWS - 1));

        const supabase = createClient();

        if (selectedItem.type === "stall") {
            await supabase
                .from("stalls")
                .update({ x: clampedX, y: clampedY })
                .eq("id", selectedItem.stall.id);

            setStalls((prev) =>
                prev.map((s) =>
                    s.id === selectedItem.stall.id ? { ...s, x: clampedX, y: clampedY } : s
                )
            );
        } else if (selectedItem.type === "element") {
            await supabase
                .from("map_elements")
                .update({ x: clampedX, y: clampedY })
                .eq("id", selectedItem.element.id);

            setMapElements((prev) =>
                prev.map((el) =>
                    el.id === selectedItem.element.id ? { ...el, x: clampedX, y: clampedY } : el
                )
            );
        }

        setSelectedItem(null);
    };

    const handleDeleteElement = async (id: string) => {
        const supabase = createClient();
        await supabase.from("map_elements").delete().eq("id", id);
        setMapElements((prev) => prev.filter((el) => el.id !== id));
    };

    const handleResizeStall = async (stall: Stall, delta: { w?: number; h?: number }) => {
        const newWidth = Math.max(1, Math.min((stall.width || 1) + (delta.w || 0), 5));
        const newHeight = Math.max(1, Math.min((stall.height || 1) + (delta.h || 0), 3));

        const supabase = createClient();
        await supabase
            .from("stalls")
            .update({ width: newWidth, height: newHeight })
            .eq("id", stall.id);

        setStalls((prev) =>
            prev.map((s) =>
                s.id === stall.id ? { ...s, width: newWidth, height: newHeight } : s
            )
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Map Editor</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAddMode(addMode === "road" ? null : "road")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${addMode === "road"
                            ? "bg-green-500 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                    >
                        <Minus size={18} />
                        {addMode === "road" ? "Click to Place Road" : "Add Road"}
                    </button>
                </div>
            </div>

            {/* Instructions */}
            <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400">
                    <strong className="text-white">Instructions:</strong> Drag stalls to position them. Click &quot;Add Road&quot; then click on the grid to place roads. Changes save automatically.
                </p>
            </div>

            {/* Map Canvas */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 overflow-auto">
                <div
                    className="relative border border-gray-600 rounded"
                    style={{ width: canvasWidth, height: canvasHeight }}
                    onClick={handleCanvasClick}
                    onPointerUp={handleDrop}
                >
                    {/* Grid */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
                            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                        }}
                    />

                    {/* Map Elements (Roads) */}
                    {mapElements.map((el) => (
                        <div
                            key={el.id}
                            className="absolute bg-road rounded cursor-move group"
                            style={{
                                left: el.x * GRID_SIZE,
                                top: el.y * GRID_SIZE,
                                width: el.width * GRID_SIZE - 2,
                                height: el.height * GRID_SIZE - 2,
                            }}
                            onPointerDown={(e) => handleElementDragStart(el, e)}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={12} className="text-white" />
                            </button>
                        </div>
                    ))}

                    {/* Stalls */}
                    {stalls.map((stall) => (
                        <div
                            key={stall.id}
                            className={`absolute bg-white border-2 rounded-lg cursor-move flex items-center justify-center font-bold shadow-md group ${stall.is_active ? "border-primary-500 text-primary-600" : "border-gray-400 text-gray-500"
                                }`}
                            style={{
                                left: stall.x * GRID_SIZE + 2,
                                top: stall.y * GRID_SIZE + 2,
                                width: (stall.width || 2) * GRID_SIZE - 4,
                                height: (stall.height || 1) * GRID_SIZE - 4,
                            }}
                            onPointerDown={(e) => handleStallDragStart(stall, e)}
                        >
                            <span className="text-lg">{stall.stall_number}</span>

                            {/* Resize handles */}
                            <div className="absolute bottom-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleResizeStall(stall, { w: 1 }); }}
                                    className="w-4 h-4 bg-blue-500 text-white text-[10px] rounded flex items-center justify-center"
                                >
                                    W+
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleResizeStall(stall, { w: -1 }); }}
                                    className="w-4 h-4 bg-blue-400 text-white text-[10px] rounded flex items-center justify-center"
                                >
                                    W-
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleResizeStall(stall, { h: 1 }); }}
                                    className="w-4 h-4 bg-green-500 text-white text-[10px] rounded flex items-center justify-center"
                                >
                                    H+
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleResizeStall(stall, { h: -1 }); }}
                                    className="w-4 h-4 bg-green-400 text-white text-[10px] rounded flex items-center justify-center"
                                >
                                    H-
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stall List */}
            <div className="mt-6">
                <h2 className="text-lg font-semibold text-white mb-3">Stalls on Map</h2>
                <div className="grid grid-cols-4 gap-2">
                    {stalls.map((stall) => (
                        <div
                            key={stall.id}
                            className={`p-2 rounded-lg border text-center text-sm ${stall.is_active
                                ? "bg-primary-500/20 border-primary-500/30 text-primary-400"
                                : "bg-gray-700 border-gray-600 text-gray-500"
                                }`}
                        >
                            <span className="font-bold">#{stall.stall_number}</span>
                            <span className="ml-1 text-xs opacity-70">({stall.x},{stall.y})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
