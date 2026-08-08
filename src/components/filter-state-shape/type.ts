export type DateRangeFilter = {
  type: "dateRange";
  columnId: string;
  from?: Date;
  to?: Date;
};

export type MultiSelectFilter = {
  type: "multiSelect";
  columnId: string;
  values: string[];
};

export type ActiveFilter = DateRangeFilter | MultiSelectFilter;
