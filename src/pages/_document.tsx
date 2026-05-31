import { Html, Head, Main, NextScript } from 'next/document'

const OG_URL = 'https://band-bridge.vercel.app'
const OG_IMAGE = `${OG_URL}/api/og`
const OG_TITLE = 'BandBridge | Connect Musicians with Venues'
const OG_DESCRIPTION = 'The easiest way for independent musicians and bands to get booked. Only 5% booking fee — because artists deserve more.'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/*
          viewport-fit=cover is required for env(safe-area-inset-*) to work on
          iOS (Dynamic Island, notch). Without it Safari ignores safe-area values.
        */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Chromium on Android uses this for the address bar / status bar colour */}
        <meta name="theme-color" content="#0D0D0D" />
        {/* PWA-style full-screen on iOS home-screen launch */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Favicon */}
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={OG_URL} />
        <meta property="og:title" content={OG_TITLE} />
        <meta property="og:description" content={OG_DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="BandBridge" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={OG_TITLE} />
        <meta name="twitter:description" content={OG_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
