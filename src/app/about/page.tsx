import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about VivahVendors — the culturally-aware wedding vendor marketplace.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <h1 className="text-4xl font-bold mb-6">About VivahVendors</h1>

          <div className="prose prose-lg text-muted-foreground space-y-6">
            <p>
              VivahVendors is a global wedding vendor marketplace built for the
              diverse traditions and cultures that make every wedding unique.
            </p>

            <p>
              We understand that weddings are deeply personal celebrations rooted
              in cultural heritage. Whether you&apos;re planning a traditional Hindu
              ceremony, a Sikh Anand Karaj, a Christian church wedding, a Muslim
              Nikah, or a fusion celebration, finding vendors who truly understand
              your traditions matters.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8">Our Mission</h2>
            <p>
              To connect every couple with wedding vendors who specialize in their
              cultural traditions, religion, and ceremony style — making it easy to
              celebrate your way.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8">For Couples</h2>
            <p>
              Browse vendors filtered by your specific cultural needs. Find
              photographers who know the rituals, caterers who serve authentic
              cuisine, decorators who understand the aesthetics, and priests who
              can perform the ceremonies meaningful to you.
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8">For Vendors</h2>
            <p>
              Reach couples actively seeking your cultural expertise. List your
              business for free, showcase your packages, and connect with clients
              who value what makes you unique.
            </p>
          </div>

          <div className="flex gap-4 mt-10">
            <Link href="/vendors">
              <Button size="lg">Browse Vendors</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">List Your Business</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
