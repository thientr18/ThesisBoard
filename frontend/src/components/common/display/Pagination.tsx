import React from "react";
import { Pagination as AntPagination } from "antd";

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showTotal?: (total: number, range: [number, number]) => string | React.ReactNode;
  className?: string;
}

/**
 Example usage:
 
 // inside a table/list container
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(20);

 <Table ... />
 <Pagination
   current={page}
   pageSize={pageSize}
   total={totalItems}
   onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
 />
*/
const defaultShowTotal = (total: number, range: [number, number]) =>
  `Showing ${range[0]}–${range[1]} of ${total} items`;

const Pagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = true,
  showTotal,
  className = "",
}) => {
  const handleChange = (page: number, newPageSize?: number) => {
    // AntD sometimes calls onChange with undefined pageSize when only page changes
    const resolvedPageSize = typeof newPageSize === "number" ? newPageSize : pageSize;
    onChange(page, resolvedPageSize);
  };

  // sensible page size options; can be overridden by passing custom component/props in future
  const pageSizeOptions = ["10", "20", "50", "100"];

  const containerClasses = `w-full flex justify-center sm:justify-end items-center p-2 rounded-lg shadow-sm ${className}`.trim();

  return (
    <div className={containerClasses}>
      <AntPagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={handleChange}
        showSizeChanger={showSizeChanger}
        pageSizeOptions={pageSizeOptions}
        showQuickJumper
        showTotal={showTotal ?? defaultShowTotal}
      />
    </div>
  );
};

export default Pagination;