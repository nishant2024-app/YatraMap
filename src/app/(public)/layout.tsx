import BottomNav from "@/components/BottomNav";
import WelcomePopup from "@/components/WelcomePopup";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            {/* Welcome Popup - Shows once per session */}
            <WelcomePopup />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-primary-500 text-white shadow-md">
                <div className="flex items-center justify-center h-14 px-4">
                    <h1 className="text-lg font-bold tracking-wide high-contrast">
                        YatraMap
                    </h1>
                </div>
            </header>

            {/* Main content with top and bottom padding for fixed elements */}
            <main className="pt-14 pb-20 min-h-screen">
                {children}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
