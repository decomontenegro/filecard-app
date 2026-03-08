export interface Figura {
  id: number;
  name: string;
  character: string;
  year: number;
  series: string;
  accessories: string[];
  variants: string[];
  image?: string;
  marketValueBRL?: number;
}

export interface ColecaoItem {
  id: number;
  figuraId: number;
  figura?: Figura;
  condition: string; // C1-C10
  pricePaid: number;
  purchaseDate?: string;
  notes?: string;
  photo?: string;
  marketValue?: number;
}

export interface ColecaoStats {
  totalItems: number;
  totalPaid: number;
  totalMarketValue: number;
  appreciationPct: number;
  topItems: ColecaoItem[];
}
