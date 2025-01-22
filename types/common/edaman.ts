export interface DigestSubItem {
  label: string;
  tag: string;
  schemaOrgTag: string | null;
  total: number;
  hasRDI: boolean;
  daily: number;
  unit: string;
}

export interface DigestItem {
  label: string;
  tag: string;
  schemaOrgTag: string | null;
  total: number;
  hasRDI: boolean;
  daily: number;
  unit: string;
  sub?: DigestSubItem[];
}

export interface TotalNutrientItem {
  label: string;
  quantity: number;
  unit: string;
}

export interface ImageSize {
  height: number;
  width: number;
  url: string;
}

export interface EdamamItem {
  label: string;
  image: string;
  images: {
    THUMBNAIL: ImageSize;
    SMALL: ImageSize;
    REGULAR: ImageSize;
    LARGE: ImageSize;
  };
  source: string;
  url: string;
  shareAs: string;
  yield: number;
  calories: number;
  totalWeight: number;
  dietLabels: string[];
  healthLabels: string[];
  cautions: string[];
  cuisineType: string[];
  mealType: string[];
  dishType: string[];
  digest: DigestItem[];
  totalNutrients: {
    [key: string]: TotalNutrientItem;
  };
  totalDaily: {
    [key: string]: TotalNutrientItem;
  };
  glycemicIndex?: number;
  co2EmissionsClass?: string;
  totalCO2Emissions?: number;
}

export interface EdamamApiResponse {
  hits: {
    recipe: EdamamItem;
  }[];
}
