export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ReferenceItem {
  id: string;
  imageUrl: string;
  createdAt: string; // ISO String or custom formatted
  location: string;
  lat?: number;
  lng?: number;
  memo: string;
  tags: string[];
  checklist: ChecklistItem[];
}

export interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  selectedLocation: string;
  startDate: string;
  endDate: string;
}

