import type { Sponsor } from "@/lib/types";

interface SponsorCardProps {
    sponsor: Sponsor;
}

export default function SponsorCard({ sponsor }: SponsorCardProps) {
    // Prefer image_url over logo_url for display
    const imageUrl = sponsor.image_url || sponsor.logo_url;

    return (
        <div className="flex items-center gap-4 p-4">
            {/* Image/Logo */}
            <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={sponsor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Hide image and show fallback
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : null}
                {/* Fallback initial - always rendered, hidden behind image */}
                <span className="text-3xl font-bold text-gray-300 absolute">
                    {sponsor.name.charAt(0).toUpperCase()}
                </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-lg">{sponsor.name}</h4>
                {sponsor.message && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {sponsor.message}
                    </p>
                )}
            </div>
        </div>
    );
}
