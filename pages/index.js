import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
    const [manifestUrl, setManifestUrl] = useState('');

    useEffect(() => {
        setManifestUrl(`${window.location.origin}/manifest.json`);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <Head>
                <title>MovieLeaks</title>
                <meta name="description" content="The latest leaks from r/MovieLeaks, directly in your Stremio library." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://stremleak.vercel.app/" />
                <meta property="og:title" content="MovieLeaks for Stremio" />
                <meta property="og:description" content="The latest leaks from r/MovieLeaks, directly in your Stremio library." />
                <meta property="og:image" content="/images/share.jpg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://stremleak.vercel.app/" />
                <meta property="twitter:title" content="MovieLeaks for Stremio" />
                <meta property="twitter:description" content="The latest leaks from r/MovieLeaks, directly in your Stremio library." />
                <meta property="twitter:image" content="/images/share.jpg" />
            </Head>

            <main style={{ maxWidth: '600px', width: '100%' }}>
                <img
                    src="/images/logo.webp"
                    alt="MovieLeaks Logo"
                    style={{
                        width: '240px',
                        height: '240px',
                        marginBottom: '1.5rem',
                        borderRadius: '20px'
                    }}
                />
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{
                        fontSize: '2.1rem',
                        lineHeight: '1.4',
                        marginBottom: '3rem'
                    }}>
                        The latest leaks from <a href="https://reddit.com/r/MovieLeaks" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', textDecorationColor: '#333', textUnderlineOffset: '4px' }}>r/MovieLeaks</a>, directly in your Stremio library.
                    </p>

                    {manifestUrl && (
                        <a
                            href={`stremio://${manifestUrl.replace('https://', '').replace('http://', '')}`}
                            style={{
                                display: 'inline-block',
                                background: 'var(--accent-color)',
                                color: 'var(--bg-color)',
                                padding: '1rem 1.5rem',
                                fontSize: '1.6rem',
                                fontWeight: '600',
                                borderRadius: '50px',
                                transition: 'opacity 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '0.5'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Install Addon
                        </a>
                    )}
                </div>

                <footer style={{
                    paddingTop: '0rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem',
                    fontSize: '0.9rem',
                    color: 'var(--secondary-text)'
                }}>
                    <a href="https://github.com/oskarsundberg/stremleak" target="_blank" rel="noopener noreferrer" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-color)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--secondary-text)'}>Source</a>
                    <a href={`${manifestUrl}`} target="_blank" rel="noopener noreferrer" style={{ transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-color)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--secondary-text)'}>Manifest</a>
                </footer>
            </main>
        </div>
    );
}
