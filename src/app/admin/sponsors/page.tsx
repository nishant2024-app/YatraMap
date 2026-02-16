"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Sponsor } from "@/lib/types";
import { STORAGE_BUCKETS } from "@/lib/types";
import { Plus, Edit2, Trash2, Save, Image as ImageIcon } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

export default function AdminSponsorsPage() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSponsor, setEditingSponsor] = useState<Partial<Sponsor> | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [sponsorImages, setSponsorImages] = useState<string[]>([]);

    const fetchSponsors = async () => {
        const supabase = createClient();
        const { data } = await supabase.from("sponsors").select("*").order("display_order");
        setSponsors(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchSponsors();
    }, []);

    const handleEdit = (sponsor: Sponsor) => {
        setEditingSponsor(sponsor);
        setSponsorImages(sponsor.image_url ? [sponsor.image_url] : []);
        setIsCreating(false);
    };

    const handleCreate = () => {
        setIsCreating(true);
        setEditingSponsor({ tier: "supporter" });
        setSponsorImages([]);
    };

    const handleSave = async () => {
        if (!editingSponsor) return;
        const supabase = createClient();

        const imageUrl = sponsorImages.length > 0 ? sponsorImages[0] : null;

        if (isCreating) {
            await supabase.from("sponsors").insert({
                name: editingSponsor.name || "New Sponsor",
                logo_url: editingSponsor.logo_url || null,
                image_url: imageUrl,
                tier: editingSponsor.tier || "supporter",
                message: editingSponsor.message || null,
                display_order: sponsors.length,
            });
        } else if (editingSponsor.id) {
            await supabase
                .from("sponsors")
                .update({
                    name: editingSponsor.name,
                    logo_url: editingSponsor.logo_url,
                    image_url: imageUrl,
                    tier: editingSponsor.tier,
                    message: editingSponsor.message,
                })
                .eq("id", editingSponsor.id);
        }

        setEditingSponsor(null);
        setIsCreating(false);
        setSponsorImages([]);
        fetchSponsors();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this sponsor?")) return;
        const supabase = createClient();
        await supabase.from("sponsors").delete().eq("id", id);
        fetchSponsors();
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
                <h1 className="text-2xl font-bold text-white">Manage Sponsors</h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                    <Plus size={18} />
                    Add Sponsor
                </button>
            </div>

            {/* Edit Modal */}
            {editingSponsor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-white mb-4">
                            {isCreating ? "Add Sponsor" : "Edit Sponsor"}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={editingSponsor.name || ""}
                                    onChange={(e) => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                    <ImageIcon size={16} />
                                    Sponsor Image/Logo
                                </label>
                                <ImageUpload
                                    bucket={STORAGE_BUCKETS.SPONSOR_IMAGES}
                                    images={sponsorImages}
                                    onImagesChange={setSponsorImages}
                                    multiple={false}
                                    maxImages={1}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tier</label>
                                <select
                                    value={editingSponsor.tier || "supporter"}
                                    onChange={(e) => setEditingSponsor({ ...editingSponsor, tier: e.target.value as Sponsor["tier"] })}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                >
                                    <option value="platinum">Platinum</option>
                                    <option value="gold">Gold</option>
                                    <option value="supporter">Supporter</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Message (optional)</label>
                                <textarea
                                    value={editingSponsor.message || ""}
                                    onChange={(e) => setEditingSponsor({ ...editingSponsor, message: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => { setEditingSponsor(null); setIsCreating(false); setSponsorImages([]); }}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg"
                            >
                                <Save size={18} /> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sponsors List */}
            <div className="space-y-3">
                {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
                        <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {sponsor.image_url || sponsor.logo_url ? (
                                <img
                                    src={sponsor.image_url || sponsor.logo_url || ""}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-gray-500">{sponsor.name.charAt(0)}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{sponsor.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sponsor.tier === "platinum" ? "bg-slate-600 text-slate-200" :
                                sponsor.tier === "gold" ? "bg-amber-500/20 text-amber-400" :
                                    "bg-primary-500/20 text-primary-400"
                                }`}>
                                {sponsor.tier || "supporter"}
                            </span>
                        </div>
                        <button onClick={() => handleEdit(sponsor)} className="p-2 text-gray-400 hover:text-white">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(sponsor.id)} className="p-2 text-gray-400 hover:text-red-400">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {sponsors.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No sponsors yet.</div>
                )}
            </div>
        </div>
    );
}
