"use client";

import { Globe, CreditCard, Banknote, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

export function GlobalBillingSection() {
  return (
    <section className="bg-white py-24 border-b border-slate-100 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-5">
          Global billing, <span className="text-blue-600">zero friction</span>
        </h2>
        <p className="text-lg md:text-[19px] text-slate-600 max-w-2xl mb-16 leading-relaxed">
          Generate invoices in any currency, accept cards or bank transfers instantly, and let Soseki handle the conversion and reconciliation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 w-full">
          {/* Left Feature Mock */}
          <div className="flex flex-col items-center group cursor-default">
            <div className="w-full max-w-sm bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-800 p-6 mb-8 h-[240px] flex flex-col relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_20px_40px_rgb(37,99,235,0.2)] group-hover:-translate-y-1">
              {/* Animated Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>

              <div className="flex-1 flex flex-col justify-center items-center relative z-10 w-full px-4">
                <div className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between shadow-lg transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105 group-hover:border-blue-500/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <span className="font-bold text-lg">£</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-white">Invoice #492</span>
                      <span className="text-[11px] text-slate-400">To: Acme Ltd (UK)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">£4,500.00</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
                      <RefreshCw className="w-3 h-3" /> Auto-converted
                    </div>
                  </div>
                </div>

                {/* Received Mock */}
                <div className="mt-4 w-[90%] bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-all duration-500 delay-100">
                  <div className="text-[12px] text-slate-300 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    You receive (USD)
                  </div>
                  <div className="text-[13px] font-bold text-white">$5,692.50</div>
                </div>
              </div>
            </div>

            <div className="text-center max-w-xs">
              <div className="text-[11px] font-bold tracking-wider uppercase text-blue-600 mb-2.5 flex items-center justify-center gap-1.5 group-hover:scale-105 transition-transform duration-300">
                <Globe className="w-4 h-4" /> MULTI-CURRENCY
              </div>
              <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                Bill clients in their local currency while receiving payouts in yours. Real-time exchange rates, no hidden spread.
              </p>
            </div>
          </div>

          {/* Right Feature Mock */}
          <div className="flex flex-col items-center group cursor-default">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-6 mb-8 h-[240px] flex flex-col justify-center relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_20px_40px_rgb(16,185,129,0.12)] group-hover:-translate-y-1">

              <div className="relative z-10 w-full max-w-[260px] mx-auto flex flex-col gap-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-center">Payment Method</div>
                
                <button className="w-full bg-white border-2 border-blue-500 rounded-xl p-3 flex items-center justify-between shadow-[0_0_15px_rgba(37,99,235,0.1)] group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-shadow duration-300 cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-800">Credit Card</span>
                  </div>
                  <div className="w-4 h-4 rounded-full border-4 border-blue-500 bg-white"></div>
                </button>

                <button className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between opacity-70 group-hover:opacity-100 group-hover:bg-white transition-all duration-300 cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-600">Bank Transfer</span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
                </button>
              </div>

            </div>

            <div className="text-center max-w-xs">
              <div className="text-[11px] font-bold tracking-wider uppercase text-emerald-600 mb-2.5 flex items-center justify-center gap-1.5 group-hover:scale-105 transition-transform duration-300">
                <CreditCard className="w-4 h-4" /> INSTANT CHECKOUT
              </div>
              <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                Give your clients a seamless, one-click payment experience powered by our global payment infrastructure.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
