"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKETS } from "@/lib/types";
import { Save, Check, QrCode } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface DonateInfoData {
    committee_name: string;
    purpose_text: string;
    upi_qr_url: string;
}

export default function AdminDonatePage() {
    const [info, setInfo] = useState<DonateInfoData>({
        committee_name: "",
        purpose_text: "",
        upi_qr_url: "",
    });
    const [qrImages, setQrImages] = useState<string[]>([]);
    const [recordId, setRecordId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        async function fetchInfo() {
            const supabase = createClient();
            const { data } = await supabase.from("donate_info").select("*").single();
            if (data) {
                setRecordId(data.id);
                setInfo({
                    committee_name: data.committee_name || "",
                    purpose_text: data.purpose_text || "",
                    upi_qr_url: data.upi_qr_url || "",
                });
                if (data.upi_qr_url) {
                    setQrImages([data.upi_qr_url]);
                }
            }
            setLoading(false);
        }
        fetchInfo();
    }, []);

    const handleQrChange = (urls: string[]) => {
        setQrImages(urls);
        // Update info.upi_qr_url with the first image
        setInfo({ ...info, upi_qr_url: urls.length > 0 ? urls[0] : "" });
    };

    const handleSave = async () => {
        setSaving(true);
        const supabase = createClient();

        const updateData = {
            committee_name: info.committee_name,
            purpose_text: info.purpose_text,
            upi_qr_url: qrImages.length > 0 ? qrImages[0] : null,
        };

        if (recordId) {
            await supabase.from("donate_info").update(updateData).eq("id", recordId);
        } else {
            await supabase.from("donate_info").insert(updateData);
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

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Edit Donate Info</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                    {saved ? <Check size={18} /> : <Save size={18} />}
                    {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                </button>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Committee / Temple Name
                    </label>
                    <input
                        type="text"
                        value={info.committee_name}
                        onChange={(e) => setInfo({ ...info, committee_name: e.target.value })}
                        placeholder="e.g., Shri Hanuman Mandir Committee"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Donation Purpose Text
                    </label>
                    <textarea
                        value={info.purpose_text}
                        onChange={(e) => setInfo({ ...info, purpose_text: e.target.value })}
                        placeholder="Explain what the donations will be used for..."
                        rows={4}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 resize-none"
                    />
                </div>

                {/* QR Upload Section */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <QrCode size={18} />
                        UPI QR Code Image
                    </label>
                    <ImageUpload
                        bucket={STORAGE_BUCKETS.DONATE_QR}
                        images={qrImages}
                        onImagesChange={handleQrChange}
                        multiple={false}
                        maxImages={1}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Upload a clear image of your UPI QR code
                    </p>
                </div>

                {/* QR Preview */}
                {qrImages.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
                        <div className="w-40 h-40 bg-white rounded-lg overflow-hidden p-2">
                            <img src={qrImages[0]} alt="QR Preview" className="w-full h-full object-contain" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
