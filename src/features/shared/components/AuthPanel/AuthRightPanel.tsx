import Image from 'next/image';

export default function AuthRightPanel() {
    return (
        <div className="hidden md:flex flex-col items-center justify-center relative overflow-hidden w-[300px] flex-shrink-0"
            style={{ background: 'linear-gradient(160deg, #0e1e35 0%, #0a1525 40%, #060A0F 100%)' }}>

            <div className="absolute top-6 right-4 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                style={{ background: 'rgba(46,166,255,0.15)' }} />
            <div className="absolute bottom-10 left-4 w-24 h-24 rounded-full blur-2xl pointer-events-none"
                style={{ background: 'rgba(46,166,255,0.08)' }} />

            <div className="relative w-[240px] mb-5 select-none">
                <Image
                    src="/Frame 427318502.png"
                    alt="UzChess"
                    width={240}
                    height={300}
                    className="w-full h-auto drop-shadow-2xl"
                    priority
                />
            </div>

        </div>
    );
}