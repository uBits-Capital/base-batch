"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import React from "react";

import { WagmiProvider } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/wagmi";

const queryClient = new QueryClient();

export default function Layout({ className, children }: Layout) {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center md:justify-between p-5 ${className}`}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>
            <Navbar />
            {children}
            <div className="mt-auto">
              <Footer />
            </div>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </main>
  );
}

interface Layout {
  className?: string;
  children: React.ReactNode;
}
