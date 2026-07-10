import { formatCurrency, formatDate } from "@/lib/utils";
import { SosekiBranding } from "@/components/shared/soseki-branding";

export function SosekiModernExpense({ expense, organization }) {
  if (!expense) return null;

  const currency = expense.invoice?.currency || organization?.masterCurrency || "USD";

  return (
    <div className="bg-white text-slate-800 w-full h-full flex flex-col p-10 font-sans text-sm relative">
      
      {/* Accent top border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600"></div>

      {/* Top Header */}
      <div className="flex justify-between items-start mb-10 pt-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{organization?.name || "Company Name"}</h1>
          {organization?.address && <p className="text-slate-500 mt-1 max-w-xs leading-relaxed">{organization.address}</p>}
          <div className="mt-4 text-xs text-slate-500 space-y-1">
            {organization?.profile?.phone && <p>Phone: <span className="font-medium text-slate-700">{organization.profile.phone}</span></p>}
            {organization?.profile?.email && <p>Email: <span className="font-medium text-slate-700">{organization.profile.email}</span></p>}
            {organization?.profile?.taxId && <p>{currency === "INR" ? "GSTIN" : "Tax ID"}: <span className="font-medium text-slate-700">{organization.profile.taxId}</span></p>}
            {organization?.profile?.registrationNumber && <p>{currency === "INR" ? "PAN" : "Reg No"}: <span className="font-medium text-slate-700">{organization.profile.registrationNumber}</span></p>}
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-5xl font-black text-slate-100 uppercase tracking-widest">Expense</h2>
          <p className="text-blue-600 font-bold mt-2 text-xl tracking-wide">EXP-{expense.id.slice(0,6).toUpperCase()}</p>
        </div>
      </div>

      {/* Expense Details Grid */}
      <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-slate-100">
        <div>
          {expense.client ? (
            <>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Linked Client</p>
              <p className="font-bold text-slate-800 text-lg">{expense.client.name}</p>
              <div className="text-slate-600 text-sm mt-1 space-y-0.5">
                {expense.client.email && <p>{expense.client.email}</p>}
                {expense.client.phone && <p>{expense.client.phone}</p>}
                {expense.client.address && <p>{expense.client.address}</p>}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Category</p>
              <p className="font-bold text-slate-800 text-lg">{expense.category}</p>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expense Date</p>
            <p className="font-medium text-slate-800">{formatDate(expense.date)}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</p>
            <p className="font-medium text-slate-800">{expense.status || "Paid"}</p>
          </div>
          {expense.client && (
            <div className="col-span-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</p>
              <p className="font-medium text-slate-800">{expense.category}</p>
            </div>
          )}
        </div>
      </div>

      {/* Expense Items / Details */}
      <div className="mb-10 flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-slate-200 text-slate-500">
              <th className="py-3 font-bold uppercase tracking-wider text-xs">Expense Description</th>
              <th className="py-3 font-bold uppercase tracking-wider text-xs text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-50 last:border-b-0">
              <td className="py-4 text-slate-800 font-medium pr-4 leading-relaxed">{expense.description}</td>
              <td className="py-4 text-slate-900 font-bold text-right">{formatCurrency(expense.amount, currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="flex gap-10 mb-8 justify-between">
        <div className="flex-1 max-w-[340px]">
          <div className="bg-emerald-50/80 p-5 rounded-xl border border-emerald-100 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 text-xl">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Recorded</p>
                <p className="text-emerald-700 text-xs mt-0.5">This expense has been fully recorded.</p>
              </div>
          </div>
        </div>

        {/* Totals */}
        <div className="w-[340px]">
          <div className="space-y-3 text-sm bg-slate-50/80 p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="pt-1">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">Total Paid</span>
                <span className="text-3xl font-black text-blue-600">{formatCurrency(expense.amount, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-400 text-xs mt-auto pt-6 border-t border-slate-100 flex-col flex gap-2">
        <span>{organization?.profile?.expenseFooterNote || "Thank you for your business!"}</span>
        <SosekiBranding />
      </div>

    </div>
  );
}
