"use client";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";

export function Header() {
	const scrolled = useScroll(10);

	return (
        <header
			className={cn(
				"sticky top-0 z-50 mx-auto w-full max-w-4xl border-transparent border-b md:rounded-full md:border md:transition-all md:ease-out",
				{
					"border-border bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 md:top-2 md:max-w-3xl md:shadow-md":
						scrolled,
				}
			)}
		>
			<nav
				className={cn(
					"flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
					{
						"md:px-2": scrolled,
					}
				)}
			>
				<a className="flex items-center gap-2 rounded-md p-2 hover:bg-muted" href="/">
					<Logo className="h-5" />
					<span className="text-xl font-bold tracking-tight text-slate-900">Soseki</span>
				</a>
				<div className="hidden items-center gap-7 md:flex text-[15px] font-medium text-slate-600">
					<a href="/founders" className="hover:text-black transition-colors">Founders</a>
					<a href="/guide" className="hover:text-black transition-colors">Guide</a>
					<a href="/docs" className="hover:text-black transition-colors">Docs</a>
					<a href="/pricing" className="hover:text-black transition-colors">Pricing</a>
					<Button size="sm" className="ml-2">Get Started</Button>
				</div>
			</nav>
        </header>
    );
}
