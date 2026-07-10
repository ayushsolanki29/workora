import { LogoIcon } from "@/components/logo";
import { BlockedActions } from "./blocked-actions";
import { APP_NAME } from "@/lib/constants";
import { Ban } from "lucide-react";

export const metadata = {
  title: "Account Blocked | " + APP_NAME,
};

export default function BlockedPage() {
  return (
    <div className="flex flex-col h-full bg-background min-h-screen">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 md:py-24 max-w-sm mx-auto w-full">
        
        <div className="w-full bg-card rounded-2xl shadow-sm border p-8 flex flex-col relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 p-32 bg-destructive/5 rounded-bl-[100%] -mr-16 -mt-16 pointer-events-none" />

          <div className="flex items-center gap-2 mb-8 relative">
            <LogoIcon />
            <span className="font-semibold text-lg tracking-tight">{APP_NAME}</span>
          </div>

          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
            <Ban className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            Your organization has been temporarily blocked or suspended. You no longer have access to the dashboard or internal resources.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Please contact your organization's admin or reach out to support for further assistance.
          </p>

          <BlockedActions />
        </div>
        
        <div className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </div>
  );
}
