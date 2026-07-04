"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import API from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceSettingsPage() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const res = await API.get("/organization");
        setName(res.data.organization.name);
      } catch (error) {
        toast.error("Failed to load organization settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrganization();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Organization name is required");

    setIsSaving(true);
    try {
      await API.patch("/organization", { name: name.trim() });
      toast.success("Organization name updated successfully!");
    } catch (error) {
      toast.error("Failed to update organization");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl h-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your workspace's basic information.</p>
      </div>

      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Organization Name</CardTitle>
            <CardDescription>
              This is your workspace's visible name within Workora.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-11 w-full max-w-md rounded-md" />
            ) : (
              <div className="flex flex-col gap-2 max-w-md">
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Acme Corp" 
                  disabled={isSaving}
                  className="h-11"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4 bg-muted/20">
            <Button type="submit" disabled={isLoading || isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
