"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WelcomePopup } from "@/lib/types";
import { STORAGE_BUCKETS } from "@/lib/types";
import { Plus, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminWelcomePage() {
    const [popups, setPopups] = useState<WelcomePopup[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPopupImages, setNewPopupImages] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    const fetchPopups = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("welcome_popup")
            .select("*")
            .order("created_at", { ascending: false });
        setPopups(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchPopups();
    }, []);

    const handleCreate = async () => {
        if (newPopupImages.length === 0) return;

        const supabase = createClient();
        await supabase.from("welcome_popup").insert({
            image_url: newPopupImages[0],
            is_active: false,
        });

        setNewPopupImages([]);
        setIsCreating(false);
        fetchPopups();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this popup?")) return;
        const supabase = createClient();
        await supabase.from("welcome_popup").delete().eq("id", id);
        fetchPopups();
    };

    const handleToggleActive = async (popup: WelcomePopup) => {
        const supabase = createClient();

        // If activating, first deactivate all others
        if (!popup.is_active) {
            await supabase
                .from("welcome_popup")
                .update({ is_active: false })
                .neq("id", popup.id);
        }

        // Toggle this one
        await supabase
            .from("welcome_popup")
            .update({ is_active: !popup.is_active })
            .eq("id", popup.id);

        fetchPopups();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    const activePopup = popups.find(p => p.is_active);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Welcome Popup</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                    <Plus size={18} />
                    New Popup
                </button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-blue-300 text-sm">
                            The welcome popup appears once when users first open the app.
                            Only <strong>one popup can be active</strong> at a time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Active Popup */}
            {activePopup && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                    <p className="text-green-400 text-sm font-medium mb-2">Currently Active Popup</p>
                    <div className="flex items-center gap-4">
                        <img
                            src={activePopup.image_url}
                            alt="Active popup"
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <p className="text-white text-sm">This popup will be shown to new visitors</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Create New Popup */}
            {isCreating && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Upload New Popup Image</h3>
                    <ImageUpload
                        bucket={STORAGE_BUCKETS.WELCOME_IMAGES}
                        images={newPopupImages}
                        onImagesChange={setNewPopupImages}
                        multiple={false}
                        maxImages={1}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => { setIsCreating(false); setNewPopupImages([]); }}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={newPopupImages.length === 0}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                        >
                            Create Popup
                        </button>
                    </div>
                </div>
            )}

            {/* All Popups */}
            <div className="space-y-3">
                {popups.map((popup) => (
                    <div
                        key={popup.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border ${popup.is_active
                                ? "bg-green-500/10 border-green-500/30"
                                : "bg-gray-800 border-gray-700"
                            }`}
                    >
                        <img
                            src={popup.image_url}
                            alt="Popup"
                            className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <p className={`text-sm ${popup.is_active ? "text-green-400" : "text-gray-400"}`}>
                                {popup.is_active ? "Active" : "Inactive"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Created: {new Date(popup.created_at || "").toLocaleDateString()}
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggleActive(popup)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${popup.is_active
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                        >
                            {popup.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                            {popup.is_active ? "Active" : "Activate"}
                        </button>
                        <button
                            onClick={() => handleDelete(popup.id)}
                            className="p-2 text-gray-400 hover:text-red-400"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {popups.length === 0 && !isCreating && (
                    <div className="text-center py-12 text-gray-500">
                        No popups created yet. Click &quot;New Popup&quot; to create one.
                    </div>
                )}
            </div>
        </div>
    );
}
