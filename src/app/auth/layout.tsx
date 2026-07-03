export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-full flex items-center justify-center p-4 py-10">
                {children}
            </div>
        </div>
    );
}