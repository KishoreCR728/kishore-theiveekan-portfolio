import type { Metadata } from "next";
import Experience from "@/journey/Experience";

export const metadata: Metadata = {
  title: "The journey",
  description: "The immersive version of this portfolio: a scroll-driven three.js city, one district for each year since 2023.",
  alternates: { canonical: "/journey" },
  robots: { index: false, follow: true },
};

export default function Journey() {
  return (
    <>
      <a href="/" className="journey-back">← Back to the portfolio</a>
      <Experience />
    </>
  );
}
