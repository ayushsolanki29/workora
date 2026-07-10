export function SosekiBranding({ monochrome = false }) {
  return (
    <a 
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-6 pt-4 flex items-center justify-center gap-1.5 text-[9px] font-medium w-full select-none hover:opacity-80 transition-opacity ${monochrome ? 'text-black/50 print:text-black/50' : 'text-slate-400 print:text-slate-400'}`}
    >
      <img src="/logo.svg" alt="Soseki Logo" className={`h-3 w-auto pointer-events-none ${monochrome ? 'grayscale opacity-60' : ''}`} />
      <span className="tracking-wide">Powered by Soseki</span>
    </a>
  );
}
