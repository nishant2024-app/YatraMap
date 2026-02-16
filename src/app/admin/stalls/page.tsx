"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Stall } from "@/lib/types";
import { STORAGE_BUCKETS } from "@/lib/types";
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, Image as ImageIcon } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminStallsPage() {
    const [stalls, setStalls] = useState<Stall[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingStall, setEditingStall] = useState<Partial<Stall> | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const fetchStalls = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("stalls")
            .select("*")
            .order("stall_number", { ascending: true });

        if (error) console.error("Error:", error);
        else setStalls(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchStalls();
    }, []);

    const handleSave = async () => {
        if (!editingStall) return;
        const supabase = createClient();

        if (isCreating) {
            const { error } = await supabase.from("stalls").insert({
                stall_number: editingStall.stall_number || 1,
                name: editingStall.name || "New Stall",
                category: editingStall.category || null,
                description: editingStall.description || null,
                x: editingStall.x || 0,
                y: editingStall.y || 0,
                width: editingStall.width || 2,
                height: editingStall.height || 1,
                is_active: editingStall.is_active ?? true,
                images: editingStall.images || [],
            });
            if (error) console.error("Error creating:", error);
        } else if (editingStall.id) {
            const { error } = await supabase
                .from("stalls")
                .update({
                    stall_number: editingStall.stall_number,
                    name: editingStall.name,
                    category: editingStall.category,
                    description: editingStall.description,
                    is_active: editingStall.is_active,
                    images: editingStall.images || [],
                })
                .eq("id", editingStall.id);
            if (error) console.error("Error updating:", error);
        }

        setEditingStall(null);
        setIsCreating(false);
        fetchStalls();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this stall?")) return;
        const supabase = createClient();
        await supabase.from("stalls").delete().eq("id", id);
        fetchStalls();
    };

    const toggleActive = async (stall: Stall) => {
        const supabase = createClient();
        await supabase
            .from("stalls")
            .update({ is_active: !stall.is_active })
            .eq("id", stall.id);
        fetchStalls();
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
                <h1 className="text-2xl font-bold text-white">Manage Stalls</h1>
                <button
                    onClick={() => {
                        setIsCreating(true);
                        setEditingStall({ stall_number: stalls.length + 1, is_active: true, width: 2, height: 1, images: [] });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                    <Plus size={18} />
                    Add Stall
                </button>
            </div>

            {/* Edit Modal */}
            {editingStall && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {isCreating ? "Create New Stall" : "Edit Stall"}
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Stall Number</label>
                                    <input
                                        type="number"
                                        value={editingStall.stall_number || ""}
                                        onChange={(e) => setEditingStall({ ...editingStall, stall_number: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={editingStall.category || ""}
                                        onChange={(e) => setEditingStall({ ...editingStall, category: e.target.value })}
                                        placeholder="e.g., Food"
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editingStall.name || ""}
                                    onChange={(e) => setEditingStall({ ...editingStall, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={editingStall.description || ""}
                                    onChange={(e) => setEditingStall({ ...editingStall, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                    <ImageIcon size={16} />
                                    Stall Images
                                </label>
                                <ImageUpload
                                    bucket={STORAGE_BUCKETS.STALL_IMAGES}
                                    images={editingStall.images || []}
                                    onImagesChange={(images) => setEditingStall({ ...editingStall, images })}
                                    multiple={true}
                                    maxImages={5}
                                    path={`stall-${editingStall.stall_number || 'new'}`}
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editingStall.is_active ?? true}
                                    onChange={(e) => setEditingStall({ ...editingStall, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-gray-300">Active (visible to public)</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => { setEditingStall(null); setIsCreating(false); }}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                <Save size={18} />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stalls Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">#</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Images</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {stalls.map((stall) => (
                            <tr key={stall.id} className="hover:bg-gray-700/30">
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 font-bold text-sm">
                                        {stall.stall_number}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-white">{stall.name}</td>
                                <td className="px-4 py-3 text-gray-400">{stall.category || "-"}</td>
                                <td className="px-4 py-3">
                                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                                        <ImageIcon size={14} />
                                        {stall.images?.length || 0}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => toggleActive(stall)}
                                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${stall.is_active
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-gray-600 text-gray-400"
                                            }`}
                                    >
                                        {stall.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {stall.is_active ? "Active" : "Hidden"}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => setEditingStall(stall)}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(stall.id)}
                                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {stalls.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <p>No stalls yet. Click &quot;Add Stall&quot; to create one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
