"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, TrendingUpIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LogoIcon } from "@/components/logo";

function StatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  return (
    <div className="flex min-h-screen">
      
      {/* Left Panel - Content */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white p-6 sm:p-12 relative overflow-y-auto">
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-primary/5 p-2.5 rounded-xl border border-primary/10">
              <LogoIcon className="size-6 text-primary" />
            </div>
            <span className="text-2xl font-bold font-heading tracking-tight text-slate-900">Soseki</span>
          </Link>
        </div>

        <div className="w-full max-w-[480px]">

          <div className="animate-in slide-in-from-bottom-8 fade-in duration-700">
            <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-2xl mb-8 border border-green-100 shadow-sm">
              <CheckCircle2Icon className="size-10 text-green-600" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              You're on the waitlist!
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed mb-10">
              Your request for early access is secured. We are rolling out invites in batches and will notify you at <br/><strong className="text-slate-900 bg-slate-100 px-2 py-1 rounded-md mt-2 inline-block font-medium">{email || "your email address"}</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => router.push("/")} className="flex-1 h-12 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all group">
                Return to Home
                <ArrowRightIcon className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" onClick={() => router.push("/login")} className="flex-1 h-12 text-base font-medium rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">
                Sign in instead
              </Button>
            </div>
          </div>
          
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative bg-slate-900 overflow-hidden border-l border-white/10">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 via-black/40 to-black/80 z-10" />
        <img
          src="/login-banner.jpeg"
          alt="Soseki Background"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        
        <div className="relative z-20 p-12 mt-auto text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
            <TrendingUpIcon className="size-4 text-amber-400" />
            <span>Join 2,000+ waitlisted professionals</span>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4 tracking-tight">
            The next generation of business management.
          </h2>
          <p className="text-lg text-white/70 leading-relaxed max-w-md">
            Request early access to experience the most powerful, intuitive operating system for your freelance or agency business.
          </p>
        </div>
      </div>

    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-screen flex items-center justify-center text-slate-500">Loading status...</div>}>
      <StatusContent />
    </Suspense>
  );
}
