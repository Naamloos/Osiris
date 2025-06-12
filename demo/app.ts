import { useState, useEffect, div, h1, h2, h3, p, button, pre, code, section, nav, a, input, ul, li, span, strong } from '../src';
import demos from './demos';

const app = () => {
    const [activeDemo, setActiveDemo] = useState('counter');
    const [demoCode, setDemoCode] = useState(demos['counter'].code);

    const switchDemo = (demo: string) => {
        setActiveDemo(demo);
        setDemoCode(demos[demo as keyof typeof demos].code);
    }

    return div({ class: 'app' },
        // Header
        div({ class: 'header' },
            h1({ class: 'title' }, '📝 Osiris Demo'),
            p({ class: 'subtitle' }, 'A lightweight UI framework built with TypeScript. Create modern web applications with minimal overhead using familiar hooks and virtual DOM patterns.')
        ),

        // Navigation
        nav({ class: 'nav' },
            ...Object.keys(demos).map(key =>
                button({
                    class: `nav-button ${activeDemo === key ? 'active' : ''}`,
                    onClick: () => switchDemo(key)
                }, demos[key as keyof typeof demos].title)
            )
        ),

        // Main content
        div({ class: 'main' },
            section({ class: 'demo-section' },
                h2({ class: 'demo-title' }, demos[activeDemo as keyof typeof demos].title),
                p({ class: 'demo-description' }, demos[activeDemo as keyof typeof demos].description),

                // Live demo
                div({ class: 'demo-container' },
                    h3('Live Demo:'),
                    div({ class: 'demo-preview' },
                        demos[activeDemo as keyof typeof demos].component()
                    )
                ),

                // Code example
                div({ class: 'code-container' },
                    h3('Code:'),
                    pre({ class: 'code-block' },
                        code({
                            class: 'language-typescript',
                        }, demoCode)
                    )
                )
            )
        ),

        // Footer
        div({ class: 'footer' },
            p('Built with ❤️ using Osiris Framework'),
        )
    );
};

export default app;