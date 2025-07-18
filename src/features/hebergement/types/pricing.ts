export interface PricingDetail {
  tarifappid: string
  codetarifapp: string
  libtarifapp: string
  prixtarifapp: number
  tarifid: string
  jourtarifapp: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
}

export interface PricingGrid {
  id: string
  code: string
  description: string
  tva: string
  locationMode: string
  amount: "TTC" | "HT"
  details: PricingDetail[]
  createdAt: Date
  updatedAt: Date
}

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

export type ViewMode = "list" | "details" | "form" | "create" | "edit";
