import { Metadata } from "next";
import Link from "next/link";
import { Shield, AlertTriangle, CheckCircle, Search, Flag, BookOpen, Plus, Users, ArrowRight, Lock, Eye, Mail, Phone, CreditCard, Home, Briefcase, Store, Trash2, X, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Thibitisha - Stay Safe from Scams",
  description: "Scam checklists for rentals, jobs, online sellers, and services. Warning signs, verification guides, and reporting tools. Free.",
};

type SafetyColor = "primary" | "blue" | "green" | "orange";

interface Checklist {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: SafetyColor;
  href: string;
  items: string[];
  warning: string;
}

const colorClasses: Record<SafetyColor, string> = {
  primary: "bg-primary-100 text-primary-600 hover:bg-primary-200",
  blue: "bg-blue-100 text-blue-600 hover:bg-blue-200",
  green: "bg-green-100 text-green-600 hover:bg-green-200",
  orange: "bg-orange-100 text-orange-600 hover:bg-orange-200",
};

const checklists: Checklist[] = [
  {
    title: "Rental Ads",
    icon: Home,
    color: "primary",
    href: "/safety/rental",
    items: [
      "Never pay before viewing the property in person",
      "Verify the landlord/agent owns or manages the property",
      "Check if the rent is realistic for the area",
      "Insist on a written tenancy agreement",
      "Do not pay via mobile money to personal numbers without verification",
      "Confirm the property exists at the advertised address",
      "Check for duplicate listings with different contacts",
    ],
    warning: "Red flag: Agent demands deposit before viewing",
  },
  {
    title: "Job Offers",
    icon: Briefcase,
    color: "blue",
    href: "/safety/jobs",
    items: [
      "Legitimate employers never ask for payment to apply",
      "Verify the company exists (registration, website, office)",
      "Check email domain matches company (not @gmail.com)",
      "Be wary of urgent offers without interviews",
      "Never share ID/bank details before formal offer letter",
      "Research the interviewer and company on LinkedIn",
      "Check for poor grammar, generic descriptions",
    ],
    warning: "Red flag: Pay for training/certification to get the job",
  },
  {
    title: "Online Sellers",
    icon: Store,
    color: "green",
    href: "/safety/sellers",
    items: [
      "Meet in safe public places for in-person trades",
      "Inspect items before paying",
      "Use platforms with buyer protection when possible",
      "Be suspicious of prices far below market value",
      "Check seller history and reviews on the platform",
      "Avoid sellers who refuse video calls for high-value items",
      "Do not pay shipping or clearance fees upfront",
    ],
    warning: "Red flag: Seller insists on mobile money to unknown number",
  },
  {
    title: "Service Providers",
    icon: Wrench,
    color: "orange",
    href: "/safety/services",
    items: [
      "Ask for ID and verify business registration",
      "Get written quotes before work starts",
      "Pay in stages, not 100% upfront",
      "Check references or past work photos",
      "Confirm they have the right tools/skills for the job",
      "Agree on timeline and penalties for delays",
      "Keep receipts and communication records",
    ],
    warning: "Red flag: Cash only, no receipt, no verifiable identity",
  },
];

const generalWarnings = [
  { icon: CreditCard, title: "Upfront Payments", desc: "Legitimate services rarely demand full payment before any work or viewing" },
  { icon: Phone, title: "Pressure Tactics", desc: "Limited time, act now, others are interested - designed to rush you" },
  { icon: Mail, title: "Unverifiable Contacts", desc: "Only WhatsApp, no landline, no physical office, generic email domains" },
  { icon: Eye, title: "Too Good to Be True", desc: "Rent far below market, salary double the norm, prices half of everyone else" },
  { icon: Lock, title: "Personal Info Requests", desc: "ID photos, bank details, M-PESA PIN - never share these early" },
  { icon: Trash2, title: "Disposable Identities", desc: "New SIM, new social media, no traceable history - be extra cautious" },
];

export default function ThibitishaPage() {
  return (
    <div className="flex flex-col">
      <section className="relative bg-gradient-to-b from-red-50 via-white to-white py-16 sm:py-20 lg:py-28">
        <div className="container-main">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 inline-flex">
              <Shield className="h-3 w-3 mr-1.5" />
              Free guides • No verification service yet • Report suspicious activity
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-muted-900 tracking-tight mb-4">
              Stay Safe. <span className="text-red-600">Verify First.</span>
            </h1>
            <p className="text-lg text-muted-600 mb-8 max-w-xl">
              Practical checklists for rental ads, job offers, online sellers, and service providers.
              Learn warning signs. Report suspicious listings. Protect yourself before sending money.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/report">
                <Button variant="primary" size="lg">
                  <Flag className="h-5 w-5 mr-2" />
                  Report Suspicious Activity
                </Button>
              </Link>
              <Link href="/safety/guides">
                <Button variant="outline" size="lg">
                  <BookOpen className="h-5 w-5 mr-2" />
                  View All Guides
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="section-title">Scam Checklists</h2>
            <p className="section-subtitle">Choose your situation. Follow the steps. Protect yourself.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {checklists.map((checklist) => {
              const Icon = checklist.icon;
              return (
                <Link key={checklist.title} href={checklist.href} className="group">
                  <Card variant="outlined" hover className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={colorClasses[checklist.color] + " h-12 w-12 rounded-xl flex items-center justify-center"}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{checklist.title}</CardTitle>
                          <p className="text-sm text-muted-500">{checklist.items.length} checks</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {checklist.items.slice(0, 3).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-600">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                        {checklist.items.length > 3 && (
                          <li className="text-sm text-primary-600">+{checklist.items.length - 3} more checks</li>
                        )}
                      </ul>
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4" />
                          <strong>{checklist.warning}</strong>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link href="/safety/guides">
              <Button variant="ghost" size="lg">
                View All Checklists
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-muted-50">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="section-title">Universal Warning Signs</h2>
            <p className="section-subtitle">These red flags appear across all types of scams.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {generalWarnings.map((warning) => {
              const Icon = warning.icon;
              return (
                <Card key={warning.title} variant="outlined" className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-muted-900 mb-2">{warning.title}</h4>
                  <p className="text-sm text-muted-600">{warning.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="section-title">What MtaaHub Verifies (and What We Do Not)</h2>
            <p className="section-subtitle">Transparency about our verification process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card variant="outlined" className="p-6 border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <CardTitle>We Check</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Contact details (phone, email) on listings</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Authority to advertise (landlord/agent verification)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Property details match records (where available)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Current availability status</li>
                </ul>
              </CardContent>
            </Card>

            <Card variant="outlined" className="p-6 border-red-200 bg-red-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                    <X className="h-5 w-5" />
                  </div>
                  <CardTitle>We Do Not Guarantee</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-red-800">
                  <li className="flex items-center gap-2"><X className="h-4 w-4" />Safety of any transaction or person</li>
                  <li className="flex items-center gap-2"><X className="h-4 w-4" />Legitimacy of every user or listing</li>
                  <li className="flex items-center gap-2"><X className="h-4 w-4" />Quality of services or properties</li>
                  <li className="flex items-center gap-2"><X className="h-4 w-4" />Employment outcomes or seller honesty</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="section bg-red-600">
        <div className="container-main">
          <Card className="bg-red-700 border-red-800 p-8 sm:p-12 text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-4">See Something Suspicious?</h2>
            <p className="text-red-100 text-lg max-w-2xl mx-auto mb-8">
              Help protect the community. Report fake listings, scam attempts, impersonation, and fraud.
              Every report is reviewed by our moderation team.
            </p>
            <Link href="/report">
              <Button variant="secondary" size="lg">
                <Flag className="h-5 w-5 mr-2" />
                File a Report
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      <section className="section">
        <div className="container-main">
          <Card variant="outlined" className="p-6 border-yellow-200 bg-yellow-50">
            <div className="flex gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-muted-900 mb-2">Important Disclaimer</h3>
                <p className="text-sm text-muted-700">
                  Thibitisha provides educational guidance and reporting tools. We do not currently offer automated live verification
                  of listings, users, or transactions. Checklists are based on common scam patterns in Kenya.
                  Always exercise your own judgment. MtaaHub is not liable for losses from scams.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
