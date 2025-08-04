import { useState, useEffect, div, h1, h2, h3, p, button, pre, code, section, nav, a, input, ul, li, span, strong } from '../src';
import demos from './demos';

const app = () => {
    const [activeDemo, setActiveDemo] = useState('counter');

    const switchDemo = (demo: string) => {
        setActiveDemo(demo);
    }

    // Re-highlight syntax when demo changes
    useEffect(() => {
        // Add a small delay to ensure DOM is updated before highlighting
        const timeoutId = setTimeout(() => {
            if (typeof window !== 'undefined' && (window as any).Prism) {
                (window as any).Prism.highlightAll();
            }
        }, 50);

        return () => clearTimeout(timeoutId);
    }, [activeDemo]); // Depend on activeDemo instead of demoCode

    const copyToClipboard = () => {
        const currentCode = demos[activeDemo as keyof typeof demos].code;
        navigator.clipboard.writeText(currentCode).then(() => {
            // Simple feedback - could be enhanced with a toast notification
            console.log('Code copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy code: ', err);
        });
    };

    // Get current demo data
    const currentDemo = demos[activeDemo as keyof typeof demos];

    return div({ class: 'app' },
        // Header with enhanced styling
        div({ class: 'header' },
            h1({ class: 'title' }, '🚀 Osiris Demo'),
            p({ class: 'subtitle' }, 'A lightweight UI framework built with TypeScript. Create modern web applications with minimal overhead using familiar hooks and virtual DOM patterns.')
        ),

        // Navigation with enhanced glassmorphism
        nav({ class: 'nav' },
            ...Object.keys(demos).map(key =>
                button({
                    class: `nav-button ${activeDemo === key ? 'active' : ''}`,
                    onClick: () => switchDemo(key)
                }, demos[key as keyof typeof demos].title)
            )
        ),

        // Main content with enhanced layout
        div({ class: 'main' },
            section({ class: 'demo-section' },
                h2({ class: 'demo-title' }, currentDemo.title),
                p({ class: 'demo-description' }, currentDemo.description),

                // Live demo with enhanced preview
                div({ class: 'demo-container' },
                    h3('🎯 Live Demo:'),
                    div({
                        class: 'demo-preview',
                        key: activeDemo // Force re-creation when demo changes
                    },
                        currentDemo.component()
                    )
                ),

                // Enhanced code example with syntax highlighting
                div({ class: 'code-container' },
                    div({
                        style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;'
                    },
                        h3('💻 Code:'),
                        button({
                            class: 'demo-button small',
                            onClick: copyToClipboard,
                            style: 'margin: 0; font-size: 0.85rem; padding: 0.5rem 1rem;'
                        }, '📋 Copy Code')
                    ),
                    pre({
                        class: 'code-block line-numbers',
                        style: 'position: relative;',
                        key: `code-${activeDemo}` // Force re-creation when demo changes
                    },
                        code({
                            class: 'language-typescript',
                        }, currentDemo.code)
                    )
                )
            )
        ),

        // Enhanced footer
        div({ class: 'footer' },
            p('Built with ❤️ using Osiris Framework'),
            p({ style: 'font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem;' },
                'Featuring modern glassmorphism design and syntax highlighting')
        )
    );
};

export default app;