"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { DynamicAvatar } from "@/components/ui/dynamic-avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import API from "@/lib/api";
import { ClientForm } from "@/components/forms/client-form";
import { toast } from "sonner";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Pagination
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const limit = 10;

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/clients", {
        params: { query, status: statusFilter, page, limit }
      });
      setClients(res.data.clients);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when query or filter changes
    setPage(1);
  }, [query, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClients();
    }, 300); // 300ms debounce for search

    return () => clearTimeout(delayDebounceFn);
  }, [query, statusFilter, page]);

  const handleFormSuccess = () => {
    setIsSheetOpen(false);
    fetchClients();
  };

  return (
    <div className="p-8 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-2">Manage your clients and organizations here.</p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)} className="gap-2">
          <PlusIcon className="size-4" />
          New Client
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search clients..." 
            className="pl-9 h-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-card flex-1">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Added On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Loading clients...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <DynamicAvatar type="client" seed={client.name} size={32} />
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === "Active" ? "default" : client.status === "Lead" ? "secondary" : "outline"}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {formatDate(client.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {clients.length} of {pagination.total} results
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeftIcon className="size-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm font-medium mx-2">
            Page {page} of {Math.max(1, pagination.totalPages)}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages || isLoading}
          >
            Next
            <ChevronRightIcon className="size-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Create Client Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full border-l flex flex-col h-full bg-background overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Client</SheetTitle>
            <SheetDescription>
              Create a new client profile for your organization.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 mt-4">
            <ClientForm 
              onSuccess={handleFormSuccess} 
              onCancel={() => setIsSheetOpen(false)} 
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
