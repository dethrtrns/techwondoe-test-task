import {AppProps} from 'next/app';
import Head from 'next/head';
import {MantineProvider} from '@mantine/core';
import '../styles/globals.css';
import React from 'react';
import {Notifications} from '@mantine/notifications';

const App: React.FC<AppProps> = ({Component: PageComponent, pageProps}) => {
  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: 'light',
        }}
      >
        <Notifications />
        <PageComponent {...pageProps} />
      </MantineProvider>
    </>
  );
};

export default App;
