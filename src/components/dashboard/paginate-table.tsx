import {
  ReactNode,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/dashboard/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PaginatedResponse } from "@/types/common";
import { useQuery } from "@tanstack/react-query";
import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ChevronDown, Loader2, Settings2 } from "lucide-react";

interface ClientDateFormatterProps {
  date: string | Date;
  formatString?: string;
}

const ClientDateFormatter = ({
  date,
  formatString = "EEEE, dd MMMM yyyy",
}: ClientDateFormatterProps) => {
  const formattedDate = useMemo(() => {
    return format(new Date(date), formatString);
  }, [date, formatString]);

  return <p className="text-sm font-medium">{formattedDate}</p>;
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface PaginateTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  url: string;
  id: string;
  payload?: Record<string, unknown>;
  massSelect?: string[] | number[];
  onChangeMassSelect?: (values: string[] | number[]) => void;
  massSelectField?: string;
  Plugin?: () => ReactNode;
  grouped?: boolean;
  queryKey?: unknown[];
  perPage?: number;
  searchIsForm?: boolean;
  onSuccess?: () => void;
}

export interface PaginateTableRef {
  refetch: () => void;
  data: PaginationData | undefined;
}

interface PaginationData {
  data: unknown[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  current_page?: number;
  last_page?: number;
}

interface DataTableViewOptionsProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
}

function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto flex h-8 items-center gap-1"
        >
          <Settings2 className="h-4 w-4" />
          <span>View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Show columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {typeof column.columnDef.header === "string"
                  ? column.columnDef.header
                  : column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Loading overlay component
const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
};

const limitOptions = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

function PaginateTableComponent<TData = unknown>(
  {
    columns,
    url,
    id,
    payload = {},
    massSelect = [],
    onChangeMassSelect = () => {},
    massSelectField = "uuid",
    Plugin = () => null,
    grouped = false,
    queryKey,
    perPage = 10,
    searchIsForm = true,
    onSuccess = () => ({}),
  }: PaginateTableProps<TData>,
  ref: React.ForwardedRef<PaginateTableRef>
) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(perPage);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data, isFetching, refetch } = useQuery<PaginationData>({
    queryKey: queryKey
      ? queryKey
      : [url, payload, page, limit, debouncedSearch],
    queryFn: async () => {
      const queryParams = {
        search: debouncedSearch,
        page: String(page),
        limit: String(limit),
        ...payload,
      };
      const queryString = buildQueryString(queryParams);
      const urlWithQuery = queryString ? `${url}?${queryString}` : url;

      const response = await api.get<PaginatedResponse<unknown> | unknown[]>(
        urlWithQuery
      );

      if (!response.data) {
        return { data: [] };
      }

      if (Array.isArray(response.data)) {
        return {
          data: response.data,
        };
      }

      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data &&
        "pagination" in response.data
      ) {
        const paginatedData = response.data as PaginatedResponse<unknown>;
        return {
          data: paginatedData.data,
          pagination: paginatedData.pagination,
        };
      }

      return { data: [] };
    },
    placeholderData: { data: [] },
  });

  useEffect(() => {
    if (data && onSuccess) {
      onSuccess();
    }
  }, [data, onSuccess]);

  useImperativeHandle(ref, () => ({
    refetch,
    data,
  }));

  const table = useReactTable<TData>({
    data: (data?.data || []) as TData[],
    columns: columns as ColumnDef<TData, unknown>[],
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  useEffect(() => {
    refetch();
  }, [debouncedSearch, limit, page, refetch]);

  const pagination = useMemo(() => {
    const totalPages = data?.pagination?.totalPages || data?.last_page || 0;
    const currentPage = data?.pagination?.page || data?.current_page || page;
    const pageLimit = totalPages <= currentPage + 1 ? 5 : 2;
    return Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (i) =>
        i >= (currentPage < 3 ? 3 : currentPage) - pageLimit &&
        i <= (currentPage < 3 ? 3 : currentPage) + pageLimit
    );
  }, [data?.pagination, data?.current_page, data?.last_page, page]);

  const handleMassSelect = useCallback(
    (checked: boolean) => {
      const items = data?.data || [];
      if (checked && items.length > 0) {
        const selectedValues: (string | number)[] = [];
        items.forEach((item) => {
          if (item && typeof item === "object" && massSelectField in item) {
            const value = (item as Record<string, unknown>)[massSelectField];
            selectedValues.push(
              isNaN(Number(value)) ? String(value) : Number(value)
            );
          }
        });
        onChangeMassSelect(selectedValues as string[] | number[]);
      } else {
        onChangeMassSelect([]);
      }
    },
    [data?.data, massSelectField, onChangeMassSelect]
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      refetch();
    },
    [refetch]
  );

  // Determine if we should show the loading overlay
  const showLoading = isFetching;

  return (
    <Card id={id} className="relative w-full">
      <CardContent>
        <LoadingOverlay isLoading={showLoading} />
        <div className="mb-4 flex flex-wrap justify-between gap-2 pt-4">
          <div className="flex items-center gap-2">
            <DataTableViewOptions table={table} />
            {searchIsForm ? (
              <form onSubmit={handleSearch} className="flex">
                <Input
                  type="search"
                  className="w-full"
                  placeholder="Cari ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
            ) : (
              <div className="flex">
                <Input
                  type="search"
                  className="w-full"
                  placeholder="Cari ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Plugin />
          </div>
        </div>
        <div className="rounded-md border">
          <ScrollArea className="w-full max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="py-4 font-medium"
                        style={
                          (
                            header.column.columnDef.meta as {
                              style?: React.CSSProperties;
                            }
                          )?.style
                        }
                      >
                        {header.column.columnDef.header === "check" &&
                        Boolean((data?.data || []).length) ? (
                          <div className="flex h-4 w-4 items-center">
                            <Checkbox
                              className="h-5 w-5 cursor-pointer"
                              checked={
                                massSelect?.length === (data?.data || []).length
                              }
                              onCheckedChange={(checked) =>
                                handleMassSelect(checked as boolean)
                              }
                            />
                          </div>
                        ) : header.isPlaceholder ? null : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, idx) => (
                    <TableRow
                      key={
                        grouped
                          ? `row.${
                              (
                                row.original as {
                                  type?: string;
                                  date?: string;
                                  data?: { uuid?: string };
                                }
                              ).type === "group"
                                ? (row.original as { date: string }).date
                                : (row.original as { data?: { uuid?: string } })
                                    .data?.uuid ?? idx
                            }`
                          : `row.${
                              (row.original as { uuid?: string }).uuid ??
                              (row.original as { id?: string }).id ??
                              idx
                            }`
                      }
                    >
                      {(row.original as { type?: string }).type === "group" ? (
                        <TableCell
                          key={`cell.${row.id}.${
                            (
                              row.original as {
                                type?: string;
                                date?: string;
                                data?: { uuid?: string; id?: string };
                              }
                            ).type === "group"
                              ? (row.original as { date: string }).date
                              : (
                                  row.original as {
                                    data?: { uuid?: string; id?: string };
                                  }
                                ).data?.uuid ??
                                (row.original as { data?: { id?: string } })
                                  .data?.id ??
                                idx
                          }`}
                          className={`py-4 ${
                            (row.original as { type?: string }).type === "group"
                              ? "bg-blue-600/10 dark:bg-blue-300/10"
                              : ""
                          }`}
                          colSpan={
                            (row.original as { type?: string }).type === "group"
                              ? columns.length
                              : 1
                          }
                        >
                          <div className="flex flex-col gap-2">
                            <ClientDateFormatter
                              date={
                                (row.original as { date: string | Date }).date
                              }
                            />
                          </div>
                        </TableCell>
                      ) : (
                        row.getVisibleCells().map((cell, indexCell) => {
                          if (grouped) {
                            return (
                              <TableCell
                                key={`cell.${cell.id}.${
                                  (cell.row.original as { uuid?: string })
                                    .uuid ??
                                  (cell.row.original as { id?: string }).id ??
                                  indexCell
                                }`}
                                className={`py-4 ${
                                  (cell.row.original as { type?: string })
                                    .type === "group"
                                    ? "bg-muted"
                                    : ""
                                }`}
                                colSpan={
                                  (cell.row.original as { type?: string })
                                    .type === "group"
                                    ? columns.length
                                    : 1
                                }
                                style={
                                  (
                                    cell.column.columnDef.meta as {
                                      style?: React.CSSProperties;
                                    }
                                  )?.style
                                }
                              >
                                {(cell.row.original as { type?: string })
                                  .type === "group" ? (
                                  <div className="flex flex-col gap-2">
                                    <ClientDateFormatter
                                      date={
                                        (
                                          cell.row.original as {
                                            date: string | Date;
                                          }
                                        ).date
                                      }
                                    />
                                  </div>
                                ) : (
                                  flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )
                                )}
                              </TableCell>
                            );
                          } else {
                            return (
                              <TableCell
                                key={`cell.${cell.id}.${
                                  (cell.row.original as { uuid?: string })
                                    .uuid ??
                                  (cell.row.original as { id?: string }).id ??
                                  indexCell
                                }`}
                                className="py-4"
                                style={
                                  (
                                    cell.column.columnDef.meta as {
                                      style?: React.CSSProperties;
                                    }
                                  )?.style
                                }
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            );
                          }
                        })
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-data">
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <p className="text-muted-foreground text-sm">
                        Data not found
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <div className="flex flex-1 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                Rows per page
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex h-8 items-center gap-1"
                  >
                    {limit} <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {limitOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={limit === option.value}
                      onCheckedChange={() => setLimit(option.value)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="text-muted-foreground text-sm">
              Page {data?.pagination?.page || data?.current_page || page} of{" "}
              {data?.pagination?.totalPages || data?.last_page || 1}
            </div>
          </div>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className={cn(
                    "cursor-pointer",
                    (data?.pagination?.page || data?.current_page || page) ===
                      1 && "pointer-events-none opacity-50"
                  )}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                />
              </PaginationItem>

              {pagination.map((item: number) => (
                <PaginationItem key={item}>
                  <PaginationLink
                    isActive={
                      item ===
                      (data?.pagination?.page || data?.current_page || page)
                    }
                    className="cursor-pointer"
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  className={cn(
                    "cursor-pointer",
                    (data?.pagination?.page || data?.current_page || page) ===
                      (data?.pagination?.totalPages || data?.last_page || 1) &&
                      "pointer-events-none opacity-50"
                  )}
                  onClick={() => setPage((prev) => prev + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}

const PaginateTableWithRef = forwardRef(PaginateTableComponent);

(PaginateTableWithRef as { displayName?: string }).displayName =
  "PaginateTable";

const PaginateTable = memo(PaginateTableWithRef) as <TData = unknown>(
  props: PaginateTableProps<TData> & {
    ref?: React.ForwardedRef<PaginateTableRef>;
  }
) => React.ReactElement;

(PaginateTable as { displayName?: string }).displayName = "PaginateTable";

export { PaginateTable };
