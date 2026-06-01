import { useCallback, useEffect, useMemo, useState } from 'react';

type UsePaginatedSelectionOptions<T> = {
  items: T[];
  getId: (item: T) => string | undefined;
  initialPageSize?: number;
  pageSizeOptions?: number[];
};

const clampPage = (page: number, totalPages: number) => {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, Math.max(totalPages, 1));
};

export const usePaginatedSelection = <T,>({
  items,
  getId,
  initialPageSize = 8,
  pageSizeOptions = [8, 16, 24, 50],
}: UsePaginatedSelectionOptions<T>) => {
  const [selectedId, setSelectedId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const selectedIndex = items.findIndex((item) => getId(item) === selectedId);
  const selectedItem = selectedIndex >= 0 ? items[selectedIndex] : null;

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [currentPage, items, pageSize]);

  useEffect(() => {
    if (selectedId && selectedIndex < 0) {
      setSelectedId('');
    }
  }, [selectedId, selectedIndex]);

  useEffect(() => {
    const clampedPage = clampPage(currentPage, totalPages);
    if (clampedPage !== currentPage) {
      setCurrentPage(clampedPage);
    }
  }, [currentPage, totalPages]);

  const selectItem = useCallback((item: T) => {
    const itemId = getId(item);
    if (!itemId) return;

    const itemIndex = items.findIndex((entry) => getId(entry) === itemId);
    const nextPage = itemIndex >= 0 ? Math.floor(itemIndex / pageSize) + 1 : currentPage;

    setSelectedId(itemId);
    setCurrentPage(nextPage);
  }, [currentPage, getId, items, pageSize]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(clampPage(page, totalPages));
  }, [totalPages]);

  const updatePageSize = useCallback((nextPageSize: number) => {
    if (!pageSizeOptions.includes(nextPageSize)) return;

    setPageSize(nextPageSize);
    setCurrentPage(1);
  }, [pageSizeOptions]);

  return {
    currentPage,
    pageSize,
    pageSizeOptions,
    paginatedItems,
    selectedId,
    selectedItem,
    selectItem,
    setPage,
    setPageSize: updatePageSize,
    totalPages,
    totalItems: items.length,
  };
};
