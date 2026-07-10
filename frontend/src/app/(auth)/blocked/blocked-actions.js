"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function BlockedActions() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await API.post("/auth/logout");
      // Redirect to login
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback
      router.push("/login");
    }
  };

  return (
    <Button 
      variant="default" 
      className="w-full mt-6" 
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="w-4 h-4 mr-2" />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
