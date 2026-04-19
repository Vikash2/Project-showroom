export type AccessoryCategory = 'Safety' | 'Protection' | 'Convenience' | 'Aesthetics' | 'Style';

export interface Accessory {
  id: string;
  name: string;
  description: string;
  price: number;
  installationCharges: number;
  category: AccessoryCategory;
  image?: string;
  inStock: boolean;
}
