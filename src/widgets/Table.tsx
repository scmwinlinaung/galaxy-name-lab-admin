import { ReactNode } from 'react';
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
}

export function Table<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className,
  striped = true,
  hover = true,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

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
    <div className={cn('overflow-hidden border border-gray-200 rounded-lg', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.className
                )}
                style={{ width: column.width }}
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
          {data.map((item, index) => (
            <tr key={index} className="transition-colors">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                    'px-6 py-4 whitespace-nowrap text-sm',
                    column.className
                  )}
                >
                  {column.render
                    ? column.render(item[column.key], item, index)
                    : (item[column.key] as React.ReactNode) || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}