import React from "react";

const SwitchButton = ({
    toggled = true,
    onChange,
    // Dimensions
    width = 60,
    height = 34,
    padding = 4,

    // Colors
    activeTrackColor = "#2196F3",
    inactiveTrackColor = "#ccc",
    toggleIndicator = "#ffffff",
    activeContentColor = "#2196F3",
    inactiveContentColor = "#9ca3af",

    // Styling
    trackBorderRadius = "9999px",
    indicatorBorderRadius = "9999px",
    trackShadow = "none",
    toggleIndicatorShadow = "0 2px 4px rgba(0,0,0,0.2)",

    // Transition
    transitionDuration = "300ms",

    // Content
    activeText = "",
    inactiveText = "",
    activeIcon = null,
    inactiveIcon = null,
}) => {

    const handleClick = () => {
        if (onChange) {
            onChange(!toggled);
        }
    };

    // Calculate indicator size based on height and padding
    const toggleIndicatorSize = height - (padding * 2);

    // Calculate translation distance
    const translateX = width - toggleIndicatorSize - (padding * 2);

    return (
        <div
            className="relative cursor-pointer select-none box-border"
            onClick={handleClick}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: toggled ? activeTrackColor : inactiveTrackColor,
                borderRadius: trackBorderRadius,
                boxShadow: trackShadow,
                transition: `background-color ${transitionDuration} ease-in-out`
            }}
        >
            <div
                className="absolute bg-white transition-all ease-in-out flex items-center justify-center overflow-hidden"
                style={{
                    width: `${toggleIndicatorSize}px`,
                    height: `${toggleIndicatorSize}px`,
                    top: `${padding}px`,
                    left: `${padding}px`,
                    backgroundColor: toggleIndicator,
                    borderRadius: indicatorBorderRadius,
                    boxShadow: toggleIndicatorShadow,
                    transform: toggled ? `translateX(${translateX}px)` : 'translateX(0)',
                    transitionDuration: transitionDuration,
                    color: toggled ? activeContentColor : inactiveContentColor,
                }}
            >
                {toggled ? (
                    <div className="flex items-center justify-center gap-1 font-bold text-xs h-full w-full">
                        {typeof activeIcon === 'string' ? (
                            <img src={activeIcon} alt="active" className="w-full h-full object-contain p-0.5" />
                        ) : (
                            activeIcon
                        )}
                        {activeText && <span>{activeText}</span>}
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-1 font-bold text-xs h-full w-full">
                        {typeof inactiveIcon === 'string' ? (
                            <img src={inactiveIcon} alt="inactive" className="w-full h-full object-contain p-0.5" />
                        ) : (
                            inactiveIcon
                        )}
                        {inactiveText && <span>{inactiveText}</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SwitchButton
