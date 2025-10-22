import { Table as AntTable } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";

export interface TableProps<T extends object> {
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  rowKey?: string | ((record: T) => string);
  pagination?: false | TablePaginationConfig;
  onRowClick?: (record: T) => void;
  scroll?: { x?: number | true; y?: number };
  className?: string;
  emptyText?: string;
}

/**
 Example usage:
 
 interface Student {
   id: string;
   name: string;
   email: string;
   projectCount: number;
 }

 const columns: ColumnsType<Student> = [
   { title: "Name", dataIndex: "name", key: "name" },
   { title: "Email", dataIndex: "email", key: "email" },
   { title: "Projects", dataIndex: "projectCount", key: "projectCount", align: "right" },
 ];

 const data: Student[] = [
   { id: "s1", name: "Alice", email: "alice@example.com", projectCount: 2 },
   { id: "s2", name: "Bob", email: "bob@example.com", projectCount: 1 },
 ];

 <Table
   columns={columns}
   data={data}
   loading={false}
   rowKey="id"
   pagination={{ pageSize: 20 }}
   onRowClick={(r) => console.log("clicked", r)}
 />
*/
const Table = <T extends object>({
  columns,
  data,
  loading = false,
  rowKey = "id",
  pagination,
  onRowClick,
  scroll,
  className = "",
  emptyText = "No data",
}: TableProps<T>) => {
  const containerClasses = `bg-white dark:bg-gray-800 dark:text-gray-100 rounded-2xl shadow-sm p-4 overflow-x-auto ${className}`.trim();

  return (
    <div className={containerClasses}>
      <AntTable<T>
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey={rowKey as any}
        pagination={pagination}
        scroll={scroll}
        sticky
        onHeaderRow={() => ({
          className: "font-semibold bg-gray-50 dark:bg-gray-900",
        })}
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          className: onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" : undefined,
        })}
        locale={{
          emptyText: <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-300">{emptyText}</div>,
        }}
        // keep table visuals minimal since container provides rounded/bg/shadow
        className="ant-table-shadow-none"
        // prevent Ant Card-like internal shadows conflicting with wrapper
        tableLayout="auto"
      />
    </div>
  );
};

export default Table;