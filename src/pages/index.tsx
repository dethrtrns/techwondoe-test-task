/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from 'next/image';
import {Inter} from 'next/font/google';
import React from 'react';
import CompanySettings from '../components/CompanySettings';

const inter = Inter({subsets: ['latin']});

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
    
      <CompanySettings />
    </main>
  );
}
