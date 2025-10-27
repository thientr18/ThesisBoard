// Example usage:
// <FileUpload label="Upload Report" maxCount={1} onChange={handleUpload} accept=".pdf,.docx" />

import React, { useEffect, useState } from "react";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

type Props = {
  label?: string;
  onChange?: (fileList: UploadFile[]) => void;
  maxCount?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
};

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const FileUpload: React.FC<Props> = ({
  label,
  onChange,
  maxCount,
  accept,
  disabled = false,
  className,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    onChange?.(fileList);
  }, [fileList, onChange]);

  const multiple = maxCount === undefined || maxCount > 1;

  const handleChange = ({ fileList: nextList }: { fileList: UploadFile[] }) => {
    const trimmed = typeof maxCount === "number" ? nextList.slice(-maxCount) : nextList;
    setFileList(trimmed);
  };

  return (
    <div className={cx("w-full", className)}>
      {label && (
        <label className="text-sm font-medium mb-1 block text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}

      <Upload
        accept={accept}
        multiple={multiple}
        fileList={fileList}
        beforeUpload={() => false} // prevent automatic upload, keep files in client state
        onChange={handleChange}
        showUploadList
        disabled={disabled}
        maxCount={maxCount}
        className="w-full"
      >
        <Button
          type="default"
          disabled={disabled || (typeof maxCount === "number" && fileList.length >= maxCount)}
          className={cx(
            "flex items-center gap-2 rounded-lg px-4 py-2 w-full justify-center",
            "border border-gray-200 dark:border-gray-700",
            "bg-white dark:bg-gray-800",
            "text-gray-700 dark:text-gray-200",
            "hover:bg-gray-50 dark:hover:bg-gray-700"
          )}
        >
          <UploadOutlined />
          <span className="text-sm">Upload</span>
        </Button>
      </Upload>
    </div>
  );
};

export default FileUpload;