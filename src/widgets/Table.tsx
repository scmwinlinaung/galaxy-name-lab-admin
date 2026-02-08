import { ReactNode, useState, useMemo } from 'react';
import { cn_fallback as cn } from '../utils/cn';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T, index: number) => ReactNode;
  className?: string;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  hover?: boolean;
  onRowClick?: (item: T, index: number) => void;
  paginate?: boolean;
  itemsPerPage?: number;
}

export function Table<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className,
  striped = true,
  hover = true,
  onRowClick,
  paginate = true,
  itemsPerPage = 10,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    if (!paginate) return data;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage, paginate]);

  // Reset to page 1 when data changes
  useMemo(() => {
    setCurrentPage(1);
  }, [data.length]);
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  const displayData = paginate ? paginatedData : data;

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('border border-gray-200 rounded-lg', className)}>
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh] sm:max-h-[60vh] lg:max-h-[65vh] pb-10 ">
        <div className="min-w-[800px]">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-20">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={cn(
                      'px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap',
                      column.className
                    )}
                    style={{
                      width: column.width,
                      minWidth: column.width || '120px'
                    }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={cn(
                'bg-white divide-y divide-gray-200',
                striped && 'odd:bg-white even:bg-gray-50',
                hover && '[&>_tr]:hover:bg-gray-50'
              )}
            >
              {displayData.map((item, index) => {
                const actualIndex = paginate ? (currentPage - 1) * itemsPerPage + index : index;
                return (
                  <tr
                    key={index}
                    className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(item, actualIndex)}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={cn(
                          'px-4 sm:px-6 py-4 text-sm align-top',
                          column.className
                        )}
                      >
                        <div className="max-w-xs sm:max-w-none">
                          {column.render
                            ? column.render(item[column.key], item, actualIndex)
                            : (item[column.key] as React.ReactNode) || '-'}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {paginate && data.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, data.length)}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, data.length)}</span> of{' '}
            <span className="font-medium">{data.length}</span> results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              )}
            >
              Previous
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'min-w-[2.5rem] px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <span className="hidden sm:inline sm:mx-2 text-gray-500">of</span>
            <span className="hidden sm:inline text-sm text-gray-700 font-medium">{totalPages}</span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              )}
            >
              Next
            </button>
          </div>

          {/* Mobile page indicator */}
          <div className="sm:hidden text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
}