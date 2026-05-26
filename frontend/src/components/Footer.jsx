import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <>
            {/* Scattered Telemetry & Preserved Details */}
            <footer className="relative z-10 mt-auto flex w-full select-none flex-col items-end justify-between gap-12 px-6 pb-6 font-['Inter'] selection:bg-[#d4e157] selection:text-black md:flex-row md:px-12">
                {/* Dynamic Footer / TBD */}
            </footer>

            {/* Floating Metadata - Shared Globally */}
            <div className="pointer-events-none fixed bottom-6 left-6 z-50 rotate-180 transform font-['Montserrat'] text-[10px] uppercase tracking-widest text-white/50 mix-blend-difference [writing-mode:vertical-rl]">
                Enerlytics Renewable Tracker
            </div>

            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 text-right font-['Montserrat'] text-[10px]">
                <Link
                    className="bg-white/20 px-2 text-black/40 backdrop-blur transition-colors hover:text-black"
                    to="#"
                >
                    Privacy Policy
                </Link>
                <Link
                    className="bg-white/20 px-2 text-black/40 backdrop-blur transition-colors hover:text-black"
                    to="#"
                >
                    Terms of Service
                </Link>
                <span className="bg-[#d4e157] px-2 py-1 font-black text-black shadow-md">
                    System Online
                </span>
            </div>
        </>
    );
}
