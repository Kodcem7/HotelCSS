import { Link } from 'react-router-dom';

// 👇 Pointing directly to your new WebP file in the public folder
const DEFAULT_HERO_IMAGE = '/hotel1.webp';

/**
 * Split editorial layout for staff login, room login, and password recovery.
 */
const ConciergeAuthLayout = ({
    badge,
    title,
    subtitle,
    children,
    footer,
    backLink,
    image, // 👈 Image prop still available for overrides
    heroHeadline = (
        <>
            The Art of <br />
            Hospitality Management.
        </>
    ),
    heroParagraph = 'A curated suite designed for the modern hotelier, where every detail is an invitation to excellence.',
    showStatusBar = true,
}) => {
    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-concierge-background font-body text-concierge-on-surface selection:bg-concierge-secondary-container">
            <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-concierge-secondary-container opacity-20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] rounded-full bg-concierge-primary/10 blur-[100px]" />

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 concierge-glass-panel rounded-[3rem] overflow-hidden concierge-editorial-shadow">
                <div className="lg:col-span-5 relative hidden lg:block overflow-hidden min-h-[520px]">
                    <div className="absolute inset-0 bg-concierge-primary/20 mix-blend-multiply z-10" />
                    <img
                        alt="Hotel Hero"
                        className="absolute inset-0 w-full h-full object-cover scale-105"
                        // 👇 Uses the passed prop or your hotel1.webp default
                        src={image || DEFAULT_HERO_IMAGE}
                    />
                    <div className="absolute inset-0 z-20 p-12 flex flex-col justify-between text-white">
                        <div />
                        <div className="space-y-4 bg-black/10 backdrop-blur-sm p-8 rounded-[3rem] -mx-4">
                            <h2 className="font-headline italic text-4xl leading-tight">{heroHeadline}</h2>
                            <p className="text-white/90 font-light max-w-xs leading-relaxed text-sm md:text-base">
                                {heroParagraph}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs tracking-widest font-label uppercase text-white/70">
                            <span>EST. 2026</span>
                            <div className="w-8 h-px bg-white/30" />
                            <span>LUXURY STANDARDS</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 bg-concierge-surface-container-lowest p-8 md:p-16 lg:p-24 flex flex-col justify-center min-h-[min(100vh-3rem,720px)]">
                    <div className="max-w-md mx-auto w-full">
                        {backLink && (
                            <div className="mb-8">
                                <Link
                                    to={backLink.to}
                                    className="text-xs font-bold tracking-widest uppercase text-concierge-outline hover:text-concierge-primary transition-colors"
                                >
                                    {backLink.label}
                                </Link>
                            </div>
                        )}

                        <header className="mb-12">
                            <span className="inline-block py-1.5 px-4 rounded-full bg-concierge-secondary-container text-concierge-on-secondary-container text-[10px] font-bold tracking-widest uppercase mb-4">
                                {badge}
                            </span>
                            <h1 className="font-headline italic text-4xl sm:text-5xl text-concierge-on-background mb-4">{title}</h1>
                            <p className="text-concierge-on-surface-variant font-light text-lg">{subtitle}</p>
                        </header>

                        {children}

                        {footer}
                    </div>
                </div>
            </div>

            {showStatusBar && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 md:px-0 z-10 pointer-events-none">
                    <div className="bg-concierge-surface-container-low/90 backdrop-blur-md rounded-full py-3 px-6 flex items-center justify-between concierge-editorial-shadow pointer-events-auto">
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold tracking-widest uppercase text-concierge-outline">
                                System operational
                            </span>
                        </div>
                        <div className="h-4 w-px bg-concierge-outline-variant/30" />
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-sm text-concierge-outline">language</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-concierge-outline">
                                v4.2.0-terracotta
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ConciergeAuthLayout;