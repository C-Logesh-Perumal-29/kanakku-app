export type CategoryKey =
  | 'grocery'
  | 'food'
  | 'householdExpense'
  | 'maintenance'
  | 'petrol'
  | 'electricity'
  | 'water'
  | 'mobile'
  | 'medical'
  | 'education'
  | 'travel'
  | 'loan'
  | 'clothing'
  | 'festival'
  | 'entertainment'
  | 'temple'

export type SubcategoryKey =
  | 'rice'
  | 'vegetables'
  | 'fruits'
  | 'groceryItems'
  | 'oil'
  | 'milk'
  | 'egg'
  | 'snacks'
  | 'hotel'
  | 'teaCoffee'
  | 'juice'
  | 'meat'
  | 'cleaning'
  | 'lpg'
  | 'furniture'
  | 'kitchen'
  | 'bikeService'
  | 'carService'
  | 'homeRepair'
  | 'electricalRepair'

export interface SubcategoryDef {
  key: SubcategoryKey
  /** Key into `categoryImageUrl` */
  imageKey: string
}

export interface CategoryDef {
  key: CategoryKey
  imageKey: string
  subcategories?: SubcategoryDef[]
}

export const CATEGORY_TREE: readonly CategoryDef[] = [
  {
    key: 'grocery',
    imageKey: 'grocery',
    subcategories: [
      { key: 'rice', imageKey: 'rice' },
      { key: 'vegetables', imageKey: 'vegetables' },
      { key: 'fruits', imageKey: 'fruits' },
      { key: 'groceryItems', imageKey: 'groceryItems' },
      { key: 'oil', imageKey: 'oil' },
      { key: 'milk', imageKey: 'milk' },
      { key: 'egg', imageKey: 'egg' },
      { key: 'snacks', imageKey: 'snacks' },
    ],
  },
  {
    key: 'food',
    imageKey: 'food',
    subcategories: [
      { key: 'hotel', imageKey: 'hotel' },
      { key: 'teaCoffee', imageKey: 'tea' },
      { key: 'juice', imageKey: 'juice' },
      { key: 'meat', imageKey: 'chicken' },
    ],
  },
  {
    key: 'householdExpense',
    imageKey: 'household',
    subcategories: [
      { key: 'cleaning', imageKey: 'cleaning' },
      { key: 'lpg', imageKey: 'cylinder' },
      { key: 'furniture', imageKey: 'furniture' },
      { key: 'kitchen', imageKey: 'kitchen' },
    ],
  },
  {
    key: 'maintenance',
    imageKey: 'homeRepair',
    subcategories: [
      { key: 'bikeService', imageKey: 'bikeService' },
      { key: 'carService', imageKey: 'carService' },
      { key: 'homeRepair', imageKey: 'homeRepair' },
      { key: 'electricalRepair', imageKey: 'electricalRepair' },
    ],
  },
  { key: 'petrol', imageKey: 'petrol' },
  { key: 'electricity', imageKey: 'electricity' },
  { key: 'water', imageKey: 'water' },
  { key: 'mobile', imageKey: 'mobileRecharge' },
  { key: 'medical', imageKey: 'medical' },
  { key: 'education', imageKey: 'education' },
  { key: 'travel', imageKey: 'travel' },
  { key: 'loan', imageKey: 'loan' },
  { key: 'clothing', imageKey: 'clothing' },
  { key: 'festival', imageKey: 'festival' },
  { key: 'entertainment', imageKey: 'entertainment' },
  { key: 'temple', imageKey: 'temple' },
] as const

const CATEGORY_TAMIL: Record<CategoryKey, string> = {
  grocery: 'மளிகை',
  food: 'உணவு',
  householdExpense: 'வீட்டு செலவு',
  maintenance: 'பராமரிப்பு',
  petrol: 'பெட்ரோல்',
  electricity: 'மின்சாரம்',
  water: 'தண்ணீர்',
  mobile: 'மொபைல்',
  medical: 'மருத்துவம்',
  education: 'கல்வி',
  travel: 'பயணம்',
  loan: 'கடன்',
  clothing: 'ஆடை',
  festival: 'விழா',
  entertainment: 'பொழுதுபோக்கு',
  temple: 'கோவில்',
}

const SUBCATEGORY_TAMIL: Record<SubcategoryKey, string> = {
  rice: 'அரிசி',
  vegetables: 'காய்கறி',
  fruits: 'பழங்கள்',
  groceryItems: 'மளிகை பொருட்கள்',
  oil: 'எண்ணெய்',
  milk: 'பால்',
  egg: 'முட்டை',
  snacks: 'ஸ்நாக்ஸ்',
  hotel: 'ஹோட்டல்',
  teaCoffee: 'டீ / காபி',
  juice: 'ஜூஸ்',
  meat: 'இறைச்சி',
  cleaning: 'சுத்தம் செய்தல்',
  lpg: 'எரிவாயு',
  furniture: 'மரச்சாமான்கள்',
  kitchen: 'சமையலறை',
  bikeService: 'பைக் சேவை',
  carService: 'கார் சேவை',
  homeRepair: 'வீட்டு பழுது',
  electricalRepair: 'மின் பழுது',
}

export function getCategoryDefinition(key: CategoryKey): CategoryDef | undefined {
  return CATEGORY_TREE.find((c) => c.key === key)
}

export function categoryLabelTamil(key: CategoryKey): string {
  return CATEGORY_TAMIL[key]
}

export function subcategoryLabelTamil(key: SubcategoryKey): string {
  return SUBCATEGORY_TAMIL[key]
}

export function expenseDisplayLabel(
  category: CategoryKey,
  subcategory?: string | null,
): string {
  const main = categoryLabelTamil(category)
  if (subcategory && subcategory in SUBCATEGORY_TAMIL) {
    return `${main} · ${subcategoryLabelTamil(subcategory as SubcategoryKey)}`
  }
  return main
}
