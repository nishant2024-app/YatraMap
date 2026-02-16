"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKETS } from "@/lib/types";
import { Save, Check, Image as ImageIcon } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface AboutContentData {
    history: string;
    importance: string;
    schedule: string;
    committee_message: string;
}

export default function AdminAboutPage() {
    const [content, setContent] = useState<AboutContentData>({
        history: "",
        importance: "",
        schedule: "",
        committee_message: "",
    });
    const [images, setImages] = useState<string[]>([]);
    const [recordId, setRecordId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function fetchContent() {
            const supabase = createClient();
            const { data } = await supabase.from("about_content").select("*").single();
            if (data) {
                setRecordId(data.id);
                if (data.content) {
                    setContent(data.content);
                }
                setImages(data.images || []);
            }
            setLoading(false);
        }
        fetchContent();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const supabase = createClient();

        if (recordId) {
            await supabase.from("about_content")
                .update({ content, images })
                .eq("id", recordId);
        } else {
            await supabase.from("about_content").insert({ content, images });
        }

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    const fields = [
        { key: "history", label: "History", placeholder: "Write about the history of the Yatra..." },
        { key: "importance", label: "Importance", placeholder: "Explain the spiritual importance..." },
        { key: "schedule", label: "Schedule Highlights", placeholder: "Key events and timings..." },
        { key: "committee_message", label: "Committee Message", placeholder: "A message from the organizers..." },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Edit About Content</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                    {saved ? <Check size={18} /> : <Save size={18} />}
                    {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </button>
            </div>

            {/* Image Gallery Section */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <ImageIcon size={18} />
                    About Section Images (Gallery)
                </label>
                <ImageUpload
                    bucket={STORAGE_BUCKETS.ABOUT_IMAGES}
                    images={images}
                    onImagesChange={setImages}
                    multiple={true}
                    maxImages={10}
                />
                <p className="text-xs text-gray-500 mt-2">
                    These images will appear as a gallery on the About page
                </p>
            </div>

            {/* Text Content */}
            <div className="space-y-6">
                {fields.map((field) => (
                    <div key={field.key} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {field.label}
                        </label>
                        <textarea
                            value={content[field.key as keyof AboutContentData]}
                            onChange={(e) => setContent({ ...content, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            rows={4}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 resize-none focus:outline-none focus:border-primary-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
