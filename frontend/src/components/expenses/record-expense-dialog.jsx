"use client";

import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import API from "@/lib/api";
import { toast } from "sonner";
import { fetchExchangeRate } from "@/lib/exchange";
import { CURRENCIES } from "@/lib/currencies";
import { useOrganization } from "@/components/providers/organization-provider";

export function RecordExpenseDialog({ open, onOpenChange, onSuccess, defaultInvoiceId, expenseToEdit }) {
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "",
    status: "Paid",
    clientId: "none",
    projectId: "none",
    invoiceId: defaultInvoiceId || "none",
    currency: "USD",
    customCategory: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const { organization } = useOrganization();
  const masterCurrency = organization?.masterCurrency || "USD";
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    if (open) {
      if (expenseToEdit) {
        const cat = expenseToEdit.category || "";

        setFormData({
          description: expenseToEdit.description,
          amount: expenseToEdit.amount,
          date: expenseToEdit.date ? new Date(expenseToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          category: cat,
          status: expenseToEdit.status || "Paid",
          clientId: expenseToEdit.clientId || "none",
          projectId: expenseToEdit.projectId || "none",
          invoiceId: expenseToEdit.invoiceId || defaultInvoiceId || "none",
          currency: expenseToEdit.currency || "USD"
        });
        setExchangeRate(expenseToEdit.exchangeRate || 1.0);
      } else {
        setFormData(prev => ({
          description: "",
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          category: "",
          status: "Paid",
          clientId: "none",
          projectId: "none",
          invoiceId: defaultInvoiceId || "none",
          currency: prev.currency || "USD",
          customCategory: ""
        }));
      }
      fetchMetadata();
    }
  }, [open, defaultInvoiceId, expenseToEdit]);

  const fetchMetadata = async () => {
    try {
      const [pRes, catRes] = await Promise.all([
        API.get("/projects"),
        API.get("/expenses/categories")
      ]);
      setProjects(pRes.data.projects || []);
      setDbCategories(catRes.data.categories || []);
      
      if (organization?.masterCurrency && !expenseToEdit && formData.currency !== organization.masterCurrency) {
          setFormData(prev => ({ ...prev, currency: organization.masterCurrency }));
      }
    } catch (error) {
      console.error("Failed to load metadata", error);
    }
  };

  useEffect(() => {
      if (!open) return;
      if (expenseToEdit && formData.currency === expenseToEdit.currency) return;

      const fetchRate = async () => {
          if (formData.currency === masterCurrency) {
              setExchangeRate(1.0);
              return;
          }
          setIsFetchingRate(true);
          try {
              const rate = await fetchExchangeRate(formData.currency, masterCurrency);
              setExchangeRate(rate);
          } catch (e) {
              console.error("Failed to fetch exchange rate", e);
          } finally {
              setIsFetchingRate(false);
          }
      };
      fetchRate();
  }, [formData.currency, masterCurrency, open, expenseToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0) {
        toast.error(`Please enter a valid description and amount`);
        return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        status: formData.status,
        clientId: formData.clientId === "none" ? null : formData.clientId,
        projectId: formData.projectId === "none" ? null : formData.projectId,
        invoiceId: formData.invoiceId === "none" ? null : formData.invoiceId,
        currency: formData.currency,
        exchangeRate: formData.currency === masterCurrency ? 1.0 : exchangeRate,
        category: formData.category,
      };
      
      if (expenseToEdit) {
        await API.patch(`/expenses/${expenseToEdit.id}`, payload);
        toast.success("Expense updated successfully!");
      } else {
        await API.post(`/expenses`, payload);
        toast.success("Expense recorded successfully!");
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to record expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full border-l flex flex-col h-full bg-background overflow-y-hidden p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{expenseToEdit ? "Edit Expense" : "Record Expense"}</SheetTitle>
          <SheetDescription>
            {expenseToEdit ? "Update this outgoing expense." : "Record a new outgoing expense."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold">Description</label>
            <Input 
                placeholder="Domain purchase, subcontractor fee, etc."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                required
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold flex justify-between">
                Currency
                {isFetchingRate && <span className="text-xs text-muted-foreground animate-pulse">Fetching rate...</span>}
            </label>
            <Select 
              value={formData.currency} 
              onValueChange={val => setFormData({...formData, currency: val})}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                    {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>
                            <div className="flex items-center gap-2">
                                <img src={`https://flagcdn.com/w20/${c.country}.png`} alt={c.code} className="w-4 h-3 object-cover rounded-sm shadow-sm" />
                                <span>{c.code} ({c.symbol})</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {formData.currency !== masterCurrency && !isFetchingRate && (
                <div className="text-xs text-muted-foreground">
                    Exchange Rate: 1 {formData.currency} = {exchangeRate} {masterCurrency}
                </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold">Amount</label>
            <Input 
                type="number" 
                step="0.01" 
                min={0.01}
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                required
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold">Date</label>
            <Input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold">Status</label>
            <Select 
              value={formData.status} 
              onValueChange={val => setFormData({...formData, status: val})}
              items={["Pending", "Approved", "Rejected", "Paid"].map(s => ({ value: s, label: s }))}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold">Category</label>
            <Popover open={openCategory} onOpenChange={setOpenCategory}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCategory}
                  className="w-full justify-between bg-transparent hover:bg-input/50 font-normal"
                >
                  {formData.category ? formData.category : "Select category..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-(--radix-popover-trigger-width) p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search or type custom category..." 
                    value={categorySearch}
                    onValueChange={setCategorySearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => {
                          setFormData({ ...formData, category: categorySearch });
                          setOpenCategory(false);
                          setCategorySearch("");
                        }}
                      >
                        Create "{categorySearch}"
                      </Button>
                    </CommandEmpty>
                    <CommandGroup>
                      {Array.from(new Set(dbCategories)).map((cat) => (
                        <CommandItem
                          key={cat}
                          value={cat}
                          onSelect={() => {
                            setFormData({ ...formData, category: cat });
                            setOpenCategory(false);
                            setCategorySearch("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2",
                              formData.category === cat ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {cat}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>


          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Link to Project (Optional)</label>
              {formData.projectId !== "none" && (
                <button type="button" onClick={() => setFormData({...formData, projectId: "none", invoiceId: "none"})} className="text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              )}
            </div>
            <Select 
              value={formData.projectId} 
              onValueChange={val => {
                const selectedProject = projects.find(p => p.id === val);
                if (selectedProject) {
                  setFormData({
                    ...formData, 
                    projectId: val, 
                    clientId: selectedProject.clientId || formData.clientId, 
                    invoiceId: "none"
                  });
                }
              }}
              items={[
                ...projects
                  .filter(proj => formData.clientId === "none" || proj.clientId === formData.clientId)
                  .map(proj => ({ value: proj.id, label: proj.title }))
              ]}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select Project">
                        {formData.projectId !== "none" 
                            ? (projects.find(p => p.id === formData.projectId)?.title || expenseToEdit?.project?.title || formData.projectId) 
                            : "Select Project"}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>

                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>


          <SheetFooter className="mt-4 pt-4 border-t px-0 mx-0 pb-2">
            <SheetClose render={<Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>} />
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : (expenseToEdit ? "Update Expense" : "Record Expense")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
