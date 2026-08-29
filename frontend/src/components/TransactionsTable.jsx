import { ArrowUpDown, Search } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import { formatINR, formatPercent } from "../lib/format";
import { LoadingBlock, EmptyBlock } from "./StateBlocks";

const COLUMNS = [
  { key: "transaction_id", label: "Transaction" },
  { key: "amount", label: "Amount" },
  { key: "payment_method", label: "Payment Method" },
  { key: "failure_reason", label: "Failure Reason" },
  { key: "recovery_probability", label: "Recovery Probability" },
  { key: "priority", label: "Priority" },
  { key: "recommended_action", label: "Recommended Action" },
  { key: "recommended_channel", label: "Channel" },
  { key: "actual_recovered", label: "Status" },
];

export default function TransactionsTable({
  loading,
  rows,
  total,
  filters,
  filterOptions,
  onFilterChange,
  sortBy,
  order,
  onSortChange,
  onRowClick,
  page,
  pageSize,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-card border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search by transaction or customer ID…"
            className="w-full rounded-lg border border-border bg-app py-2 pl-9 pr-3 text-[13px] text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <Select
          value={filters.priority}
          onChange={(v) => onFilterChange({ priority: v })}
          options={filterOptions.priorities}
          placeholder="All priorities"
        />
        <Select
          value={filters.payment_method}
          onChange={(v) => onFilterChange({ payment_method: v })}
          options={filterOptions.payment_methods}
          placeholder="All payment methods"
        />
        <Select
          value={filters.failure_reason}
          onChange={(v) => onFilterChange({ failure_reason: v })}
          options={filterOptions.failure_reasons}
          placeholder="All failure reasons"
        />
      </div>

      {loading ? (
        <LoadingBlock label="Loading transactions…" />
      ) : rows.length === 0 ? (
        <EmptyBlock
          title="No matching transactions"
          detail="Try clearing a filter or searching a different term."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-border">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => onSortChange(col.key)}
                      className="cursor-pointer whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-500 hover:text-ink-800"
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortBy === col.key && (
                          <ArrowUpDown size={11} className="text-brand-600" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.transaction_id}
                    onClick={() => onRowClick(row)}
                    className="cursor-pointer border-b border-border/70 transition-colors last:border-0 hover:bg-app"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12.5px] text-ink-700">
                      {row.transaction_id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12.5px] font-medium text-ink-900">
                      {formatINR(row.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-ink-700">
                      {row.payment_method}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-ink-700">
                      {row.failure_reason}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[12.5px] text-ink-700">
                      {formatPercent(row.recovery_probability * 100)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <PriorityBadge priority={row.priority} />
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-[12.5px] text-ink-700">
                      {row.recommended_action}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-ink-700">
                      {row.recommended_channel}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.actual_recovered === 1 ? (
                        <span className="text-[12px] font-medium text-status-success">Recovered</span>
                      ) : (
                        <span className="text-[12px] font-medium text-ink-500">Not Recovered</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 border-t border-border px-4 py-3 sm:flex-row">
            <p className="text-[12px] text-ink-500">
              Showing <span className="font-medium text-ink-800">{rows.length}</span> of{" "}
              <span className="font-medium text-ink-800">{total}</span> transactions
            </p>
            <div className="flex items-center gap-2">
              <PageButton disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                Previous
              </PageButton>
              <span className="text-[12px] text-ink-500">
                Page {page} of {totalPages}
              </span>
              <PageButton disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                Next
              </PageButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-app px-3 py-2 text-[12.5px] text-ink-700 focus:border-brand-500 focus:outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function PageButton({ children, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium text-ink-700 transition-colors hover:bg-app disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
