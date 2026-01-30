import type { Metadata } from "next";
import "./globals.css";
import { WebGLErrorBoundary } from "@/components/WebGLErrorBoundary";

export const metadata: Metadata = {
  title: "Gesture-Controlled Particle System",
  description: "Control 3D particles with hand gestures using MediaPipe and Three.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WebGLErrorBoundary>
          {children}
        </WebGLErrorBoundary>
      </body>
    </html>
  );
}
