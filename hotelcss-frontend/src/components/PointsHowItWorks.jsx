// Brief "how points work" explainer for guests. Plain English text is auto-translated
// by GlobalTranslator (the exact phrases live in the PHRASE_TRANSLATIONS tables).
const STEPS = [
    {
        icon: 'room_service',
        title: 'Earn points',
        text: 'Order services to your room and collect points when each order is completed.',
    },
    {
        icon: 'storefront',
        title: 'Spend points',
        text: 'Use your points here to claim a reward.',
    },
    {
        icon: 'confirmation_number',
        title: 'Get your reward',
        text: 'Open My Vouchers and show the code to reception to get your service.',
    },
];

const PointsHowItWorks = () => {
    return (
        <div className="bg-[#FDFBF7] rounded-[22px] sm:rounded-[28px] border border-[#E3DCD2]/30 shadow-[0_20px_40px_rgba(15,28,44,0.04)] p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#D35400]">help</span>
                <h3 className="font-headline text-lg text-[#4A3728] font-bold">How point system works?</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {STEPS.map((step, i) => (
                    <div key={step.title} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F2EBE1] text-[#D35400] font-bold flex items-center justify-center text-sm border border-[#E3DCD2]/40">
                            {i + 1}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="material-symbols-outlined text-[#8E735B] text-[18px]">{step.icon}</span>
                                <p className="font-bold text-[#4A3728] text-sm">{step.title}</p>
                            </div>
                            <p className="text-[13px] text-[#5D534A] leading-relaxed">{step.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PointsHowItWorks;
