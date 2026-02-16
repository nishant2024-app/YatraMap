// Database types for YatraMap

export interface Stall {
    id: string;
    stall_number: number;
    name: string;
    category: string | null;
    description: string | null;
    x: number;
    y: number;
    width: number;
    height: number;
    is_active: boolean;
    images: string[];
    created_at?: string;
}

export interface MapElement {
    id: string;
    type: 'road' | 'space';
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Sponsor {
    id: string;
    name: string;
    logo_url: string | null;
    image_url: string | null;
    tier: 'platinum' | 'gold' | 'supporter' | null;
    message: string | null;
    display_order: number;
}

export interface AboutContent {
    id: string;
    content: {
        history?: string;
        importance?: string;
        schedule?: string;
        committee_message?: string;
    };
    images: string[];
}

export interface DonateInfo {
    id: string;
    committee_name: string | null;
    purpose_text: string | null;
    upi_qr_url: string | null;
}

export interface WelcomePopup {
    id: string;
    image_url: string;
    is_active: boolean;
    created_at?: string;
}

// Map grid configuration
export const MAP_CONFIG = {
    GRID_SIZE: 40, // pixels per grid cell
    DEFAULT_STALL_WIDTH: 2,
    DEFAULT_STALL_HEIGHT: 1,
    CANVAS_COLS: 20,
    CANVAS_ROWS: 15,
};

// Storage bucket names
export const STORAGE_BUCKETS = {
    STALL_IMAGES: 'stall-images',
    ABOUT_IMAGES: 'about-images',
    SPONSOR_IMAGES: 'sponsor-images',
    DONATE_QR: 'donate-qr',
    WELCOME_IMAGES: 'welcome-images',
} as const;

// Max file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
