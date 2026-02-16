import type { Stall } from "@/lib/types";
import { ChevronRight } from "lucide-react";

interface StallCardProps {
    stall: Stall;
    onClick: () => void;
}

export default function StallCard({ stall, onClick }: StallCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all tap-target text-left active:scale-[0.98]"
        >
            {/* Stall Number Badge */}
            <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-white">
                    {stall.stall_number}
                </span>
            </div>

            {/* Stall Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate text-base">
                    {stall.name}
                </h3>
                {stall.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
                        {stall.category}
                    </span>
                )}
            </div>

            {/* Arrow */}
            <ChevronRight className="flex-shrink-0 text-gray-400" size={20} />
        </button>
    );
}
