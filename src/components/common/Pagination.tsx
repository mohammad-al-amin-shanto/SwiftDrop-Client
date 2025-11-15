import React from "react";
import Button from "./Button";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
};

export const Pagination: React.FC<Props> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={page === 1}
      >
        First
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Prev
      </Button>
      <div className="px-3 py-1 bg-slate-100 rounded text-sm">
        Page {page} / {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Next
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
      >
        Last
      </Button>
    </div>
  );
};

export default Pagination;
