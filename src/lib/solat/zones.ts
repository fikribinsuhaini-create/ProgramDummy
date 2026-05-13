export type SolatZone = {
  code: string;
  label: string;
  state: string;
};

// MVP: load full list from solat.my/api/locations at runtime (fallback here).
export const SOLAT_ZONES_FALLBACK: SolatZone[] = [
  { code: "SGR01", state: "Selangor", label: "Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Shah Alam" },
  { code: "SGR02", state: "Selangor", label: "Kuala Selangor, Sabak Bernam" },
  { code: "SGR03", state: "Selangor", label: "Klang, Kuala Langat" }
];

export const DEFAULT_ZONE = "SGR01";
