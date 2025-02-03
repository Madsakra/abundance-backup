

export interface HealthProfileData {
  id: string;
  name: string;
  variation:string[];
};

export interface SelectedHealthProfile {
  id: string;
  name: string;
  variation: string; // Only one variation per selected condition
}