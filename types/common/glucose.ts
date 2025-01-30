export type GlucoseUnit = 'mmol/L' | 'mg/dL';

export interface GlucoseReading {
  reading: number;
  timestamp: any;
  unit: GlucoseUnit;
}
