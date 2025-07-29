export interface Unit {
  id: string;
  name: string;
  parentId?: string;
}

export const demoUnits: Unit[] = [
  { id: 'a', name: 'Birim A' },
  { id: 'b', name: 'Birim B' },
];
