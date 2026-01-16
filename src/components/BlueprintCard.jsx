import React from 'react';


const STATUS_STYLES = {
    'unknown': 'border-gray-700 opacity-70',
    'missing': 'border-arc-red drop-shadow-[0_0_5px_rgba(255,68,68,0.5)]',
    'owned': 'border-arc-green drop-shadow-[0_0_5px_rgba(68,255,68,0.5)]',
};

const BlueprintCard = ({ blueprint, status = 'unknown', onClick, isOverview = false, users = [], filteredUser = null, overviewMode = 'missing' }) => {

    if (blueprint.isBlank) {
        return (
            <div
                className={`
                    relative 
                    border-2 rounded bg-[#151515]
                    border-gray-800 opacity-50
                    w-[100px] h-[100px] flex flex-col items-center justify-center
                    overflow-hidden isolate
                    cursor-default select-none
                `}
            >

                <div
                    className="absolute inset-0 -z-10 opacity-80"
                    style={{
                        backgroundImage: "url('https://arcraiders.wiki/w/images/thumb/5/55/UI_Blueprint_background.png/100px-UI_Blueprint_background.png.webp')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <span className="text-xl font-bold text-gray-500/50 z-10">NYI</span>
            </div>
        );
    }


    const isOwned = status === 'owned';

    let overviewGradient = 'none';
    if (isOverview && users.length > 0) {

        const degPerUser = 360 / users.length;
        const gradientParts = [];

        users.forEach((u, i) => {
            const startDeg = i * degPerUser;
            const endDeg = (i + 1) * degPerUser;

            const uStatus = u.blueprints?.[blueprint.id];
            const uIsOwned = uStatus === 'owned';


            const shouldShow = overviewMode === 'missing' ? !uIsOwned : uIsOwned;



            const isVisible = shouldShow && (!filteredUser || filteredUser === u.name);

            const color = isVisible ? u.color : 'transparent';

            gradientParts.push(`${color} ${startDeg}deg ${endDeg}deg`);
        });

        overviewGradient = `conic-gradient(${gradientParts.join(', ')})`;
    }

    return (
        <div
            className={`
        relative group ${!isOverview ? 'cursor-pointer' : 'cursor-default'}
        rounded bg-[#151515]
        transition-all duration-200 ease-in-out
        ${!isOverview && 'hover:scale-105 active:scale-95'}
        w-[100px] h-[100px] flex flex-col items-center justify-center
        overflow-hidden isolate
        ${!isOverview && (isOwned ? 'border-2 border-arc-green drop-shadow-[0_0_5px_rgba(68,255,68,0.5)]' : 'border-2 border-[#333] hover:border-gray-500')}
        ${isOverview ? 'border-2 border-transparent' : ''} 
      `}
            onClick={onClick}
            title={blueprint.name}
        >

            {isOverview && (
                <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                        background: overviewGradient,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'exclude',
                        WebkitMaskComposite: 'xor',
                        padding: '2px'
                    }}
                />
            )}


            <div
                className="absolute inset-0 -z-10 opacity-80"
                style={{
                    backgroundImage: "url('https://arcraiders.wiki/w/images/thumb/5/55/UI_Blueprint_background.png/100px-UI_Blueprint_background.png.webp')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            {blueprint.nyi ? (
                <span className="text-xl font-bold text-gray-500/50 select-none z-10">NYI</span>
            ) : (
                <img
                    src={blueprint.icon}
                    alt={blueprint.name}
                    className="w-full h-full object-cover p-2 z-10"
                    draggable="false"
                />
            )}




            {!isOverview && (
                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isOwned ? 'bg-arc-green' : 'hidden'} z-10`} />
            )}
        </div>
    );
};

export default BlueprintCard;

