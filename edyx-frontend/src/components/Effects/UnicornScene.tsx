import React, { useEffect } from 'react';

declare global {
    interface Window {
        UnicornStudio: {
            init: () => void;
            isInitialized: boolean;
        };
    }
}

const UnicornScene: React.FC = () => {
    useEffect(() => {

        const scriptId = 'unicorn-studio-script';
        const existingScript = document.getElementById(scriptId);

        if (!existingScript) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.4/dist/unicornStudio.umd.js";
            script.async = true;
            script.onload = () => {
                if (window.UnicornStudio) {
                    window.UnicornStudio.init();
                }
            };
            document.body.appendChild(script);
        } else {
            
            if (window.UnicornStudio) {
                window.UnicornStudio.init();
            }
        }

        
    }, []);

    return (
        <div
            data-us-project="eHJPDqgLDnrp3lbx0rjc"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none' 
            }}
        ></div>
    );
};

export default UnicornScene;
