export type SearchPropertyResult = {
  id: number;
  name: string;
};

export type LocalitySuggestData = {
  locality?: string[];
  properties?: SearchPropertyResult[];
};

export type LocalitySuggestResponse = {
  success: boolean;
  data?: LocalitySuggestData;
  message?: string;
};

export type SearchHistoryLocalityItem = {
  type: 'locality';
  id: string;
  label: string;
  locality: string;
};

export type SearchHistoryPropertyItem = {
  type: 'property';
  id: string;
  label: string;
  propertyId: number;
  propertyName: string;
};

export type SearchHistoryItem = SearchHistoryLocalityItem | SearchHistoryPropertyItem;
