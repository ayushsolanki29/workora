"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function OrgActions({ org }) {
  const router = useRouter();
  
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [editData, setEditData] = useState({
    name: org.name || "",
    masterCurrency: org.masterCurrency || "USD",
    address: org.address || "",
  });
  
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusToggle = async () => {
    const newStatus = org.status === "Blocked" ? "Active" : "Blocked";
    setIsLoading(true);
    try {
      await API.patch(`/super-admin/organizations/${org.id}/status`, { status: newStatus });
      toast.success("Success", {
        description: `Organization ${newStatus.toLowerCase()} successfully.`
      });
      router.refresh();
    } catch (error) {
      toast.error("Error", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await API.put(`/super-admin/organizations/${org.id}`, editData);
      toast.success("Success", {
        description: "Organization updated successfully."
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error("Error", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await API.put(`/super-admin/organizations/${org.id}/admin-password`, { newPassword });
      toast.success("Success", {
        description: "Admin password changed successfully."
      });
      setIsChangingPassword(false);
      setNewPassword("");
    } catch (error) {
      toast.error("Error", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Details</Button>
      <Button variant="outline" onClick={() => setIsChangingPassword(true)}>Change Admin Password</Button>
      <Button 
        variant={org.status === "Blocked" ? "default" : "destructive"} 
        onClick={handleStatusToggle}
        disabled={isLoading}
      >
        {org.status === "Blocked" ? "Unblock Organization" : "Block Organization"}
      </Button>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Make changes to the organization's core details here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={editData.name} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Master Currency</Label>
                <Input 
                  id="currency" 
                  value={editData.masterCurrency} 
                  onChange={(e) => setEditData({...editData, masterCurrency: e.target.value})} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={editData.address} 
                  onChange={(e) => setEditData({...editData, address: e.target.value})} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
            <DialogDescription>
              Set a new password for the primary admin of this organization.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>Change Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
