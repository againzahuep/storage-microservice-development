export class PaginationResultDto<T> {
  items: T[];

  meta: {
    currentPage: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
  };
}
