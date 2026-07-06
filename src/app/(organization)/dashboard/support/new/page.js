"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import API from "@/lib/api";
import { toast } from "sonner";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

export default function NewSupportTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      return toast.error("Title and description are required.");
    }

    setIsSubmitting(true);
    try {
      const res = await API.post("/support-tickets", formData);
      toast.success("Support ticket created!");
      router.push(`/dashboard/support/${res.data.ticket.id}`);
    } catch (error) {
      toast.error("Failed to submit ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full pt-4">
      <Link href="/dashboard/support" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeftIcon className="mr-1 size-4" />
        Back to tickets
      </Link>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Support Ticket</h1>
        <p className="text-muted-foreground mt-2">
          Describe the issue you're facing in detail so we can help.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription>Fill out the form below to open a ticket.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Title</label>
              <Input
                placeholder="e.g. Cannot generate invoice PDF"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select 
                value={formData.priority} 
                onValueChange={(val) => setFormData({ ...formData, priority: val })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low - Not urgent</SelectItem>
                  <SelectItem value="Medium">Medium - Regular issue</SelectItem>
                  <SelectItem value="High">High - Critical blocker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Please describe what happened, steps to reproduce, etc."
                className="min-h-[150px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t px-6 py-4 bg-muted/20">
            <Button type="button" variant="ghost" onClick={() => router.push('/dashboard/support')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
