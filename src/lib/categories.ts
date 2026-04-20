export const CATEGORIES: Record<string, string[]> = {
  'Hardware': ['General Hardware', 'Nuts & Bolts', 'Screws', 'Nails', 'Hinges', 'Locks & Latches', 'Hooks & Hangers', 'Chains & Wires'],
  'Plastic Items': ['Buckets & Mugs', 'Containers', 'Pipes & Fittings', 'Covers & Caps', 'Clips & Holders'],
  'Fasteners': ['Bolts & Nuts', 'Screws', 'Nails & Pins', 'Washers', 'Rivets', 'Anchors'],
  'Tools': ['Hand Tools', 'Cutting Tools', 'Measuring Tools', 'Safety Equipment'],
  'Stationery': ['Pens & Pencils', 'Notebooks & Pads', 'Files & Folders', 'Tape & Adhesive', 'Office Supplies'],
  'Packaging': ['Plastic Bags', 'Boxes & Cartons', 'Tapes', 'Wrapping', 'Labels'],
  'Electrical': ['Switches & Sockets', 'Wires & Cables', 'Bulbs & Lights', 'Fittings', 'Insulation Tape'],
  'Cleaning': ['Brushes & Brooms', 'Mops', 'Detergents', 'Wipes & Cloths', 'Gloves'],
  'General Goods': ['Miscellaneous', 'Seasonal Items', 'Promotional'],
}

export const UNITS = [
  'Pcs', 'Doz', 'Pkt', 'Kg', 'Gm', 'Litre', 'Box', 'Set', 'Pair', 'Roll', 'Mtr', 'Nos', 'Bundle',
] as const

export type VTUnit = typeof UNITS[number]

export function getCategoryNames(): string[] {
  return Object.keys(CATEGORIES)
}

export function getSubcategories(category: string): string[] {
  return CATEGORIES[category] || []
}
