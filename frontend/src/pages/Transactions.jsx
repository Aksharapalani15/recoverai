import { useEffect, useState, useCallback } from "react";
import TransactionsTable from "../components/TransactionsTable";
import TransactionDetail from "../components/TransactionDetail";
import { ErrorBlock } from "../components/StateBlocks";
import { getTransactions, getFilters } from "../api/client";
import { getErrorMessage } from "../lib/format";

const PAGE_SIZE = 15;

export default function Transactions() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("recovery_probability");
  const [order, setOrder] = useState("desc");
  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    payment_method: "",
    failure_reason: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    priorities: [],
    payment_methods: [],
    failure_reasons: [],
  });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getFilters()
      .then(setFilterOptions)
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getTransactions({
      ...filters,
      sort_by: sortBy,
      order,
      page,
      page_size: PAGE_SIZE,
    })
      .then((data) => {
        setRows(data.results);
        setTotal(data.total);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters, sortBy, order, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (partial) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleSortChange = (key) => {
    if (sortBy === key) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setOrder("desc");
    }
  };

  if (error) return <ErrorBlock title="Transactions unavailable" detail={error} />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[15px] font-semibold text-ink-900">Transaction Recovery Table</h2>
        <p className="mt-0.5 text-[12.5px] text-ink-500">
          Click any row to see full details and the AI-generated recovery explanation.
        </p>
      </div>

      <TransactionsTable
        loading={loading}
        rows={rows}
        total={total}
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        order={order}
        onSortChange={handleSortChange}
        onRowClick={setSelected}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <TransactionDetail transaction={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
