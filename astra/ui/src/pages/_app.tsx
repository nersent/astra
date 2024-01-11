import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  FONT_INTER_BOLD,
  FONT_INTER_EXTRA_BOLD,
  FONT_INTER_MEDIUM,
  FONT_INTER_REGULAR,
} from "~/common/ui/fonts";

import { useStore } from "../store/app_store_provider";
import { GlobalStyle } from "../views/style";

const GLOBAL_STYLE = `
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(${FONT_INTER_REGULAR}) format('woff2') 400;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(${FONT_INTER_MEDIUM}) format('woff2') 500;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url(${FONT_INTER_BOLD}) format('woff2') 600;
}

@font-face {
  font-family: 'Inter';
  src: url(${FONT_INTER_EXTRA_BOLD}) format('woff2') 700;
  font-style: normal;
  font-display: swap;
  font-weight: 700;
}
`;

function CustomApp({ Component, pageProps }: AppProps) {
  const store = useStore();
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Astra</title>
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLE }} />
        <link
          rel="preload"
          href={FONT_INTER_REGULAR}
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href={FONT_INTER_MEDIUM}
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href={FONT_INTER_BOLD}
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href={FONT_INTER_EXTRA_BOLD}
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
        />
        <meta name="overscroll-behavior-y" content="none" />
      </Head>
      <GlobalStyle />
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default CustomApp;
