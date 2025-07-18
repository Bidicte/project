/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Tarif } from "../../types/grilleTarifaire/tarif"
import type { PricingDetail } from "../../types/pricing"
import { authService } from "../authService"

const API_BASE_URL = import.meta.env.VITE_API_CLIENT_URL

function getAuthHeaders() {
  const token = authService.getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

const dayMap = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
} as const

class TarifService {
  async getTariffs(): Promise<Tarif[]> {
    const response = await fetch(`${API_BASE_URL}/grilletarifaire/all`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur lors du chargement des grilles")

    const data = await response.json()
    return data.map((t: any) => ({
      ...t,
      ttcactive: t.ttcactive === true ? 1 : 0,
    }))
  }

  async getDetailsTarifs(tarifid: string): Promise<PricingDetail[]> {
    const response = await fetch(`${API_BASE_URL}/tarifapplicable/allby-tarif/${tarifid}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Erreur de chargement des détails")

    const data = await response.json()

    return data.map((t: any): PricingDetail => {
      const dayNumbers = t.jourtarifapp
        .split(",")
        .map((n: string) => parseInt(n.trim(), 10))

      const days: PricingDetail["jourtarifapp"] = {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      }

      dayNumbers.forEach((num:any) => {
        const key = dayMap[num as keyof typeof dayMap]
        if (key) days[key] = true
      })

      return {
        tarifid: t.tarifid ,
        tarifappid: t.tarifappid,
        codetarifapp: t.codetarifapp,
        libtarifapp: t.libtarifapp,
        prixtarifapp: t.prixtarifapp,
        jourtarifapp: days,
      }
    })
  }

  async createTariff(tarif: Tarif): Promise<Tarif> {
    const payload = {
      ...tarif,
      ttcactive: tarif.ttcactive === 1 ? true : false,
    }
   // delete (payload as any).ttcactive
    const response = await fetch(`${API_BASE_URL}/grilletarifaire/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })
      // Si l'appel échoue, on tente de lire le corps de l'erreur
  if (!response.ok) {
    let errorMessage = "Erreur lors de la création du tarif"
    try {
      const errorData = await response.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      } else if (typeof errorData === "string") {
        errorMessage = errorData
      }
    } catch (e: any) {
      // Si on ne 
      // alert(response.body)
      // peut pas parser le corps, on garde le message générique
    }
    throw new Error(errorMessage)
  }
    return await response.json()
  }

  async updateTariff(tarif: Tarif): Promise<Tarif> {
    const payload = {
      ...tarif,
      ttcactive: tarif.ttcactive === 1 ? true : false,
    }
    const response = await fetch(`${API_BASE_URL}/grilletarifaire/update/${tarif.tarifid}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

        // Si l'appel échoue, on tente de lire le corps de l'erreur
  if (!response.ok) {
    let errorMessage = "Erreur lors de la mise à jour"
    try {
      const errorData = await response.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      } else if (typeof errorData === "string") {
        errorMessage = errorData
      }
    } catch (e) {
      // Si on ne peut pas parser le corps, on garde le message générique
    }
    throw new Error(errorMessage)
  }
    return await response.json()
  }

  async deleteTariff(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/grilletarifaire/delete/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
        // Si l'appel échoue, on tente de lire le corps de l'erreur
  if (!response.ok) {
    let errorMessage = "Erreur lors de la suppression du tarif"
    try {
      const errorData = await response.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      } else if (typeof errorData === "string") {
        errorMessage = errorData
      }
    } catch (e) {
      // Si on ne peut pas parser le corps, on garde le message générique
    }
    throw new Error(errorMessage)
  }
  }
}

//Details tarif api 
export async function createPricingDetail( tarifid: string,
  detail: Omit<PricingDetail, "tarifappid">): Promise<PricingDetail> {
  detail.tarifid = tarifid.trim()
  const payload = {
    ...detail,
    jourtarifapp: Object.entries(detail.jourtarifapp)
      .filter(([_, value]) => value)
      .map(([key]) =>
      Object.entries(dayMap).find(([, v]) => v === key)?.[0]
      )
      .filter(Boolean)
      .join(","),
      }
      delete (payload as any).tarifappid
  const response = await fetch(`${API_BASE_URL}/tarifapplicable/add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

      // Si l'appel échoue, on tente de lire le corps de l'erreur
  if (!response.ok) {
    let errorMessage = "Erreur lors de la création du détail de tarif"
    try {
      const errorData = await response.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      } else if (typeof errorData === "string") {
        errorMessage = errorData
      }
    } catch (e) {
      // Si on ne peut pas parser le corps, on garde le message générique
    }
    throw new Error(errorMessage)
  }
  return await response.json()
}

export async function updatePricingDetail(detail: PricingDetail): Promise<PricingDetail> {
  const payload = {
    ...detail,
    jourtarifapp: Object.entries(detail.jourtarifapp)
      .filter(([_, value]) => value)
      .map(([key]) =>
        Object.entries(dayMap).find(([, v]) => v === key)?.[0]
      )
      .filter(Boolean)
      .join(","),
  }

  const response = await fetch(`${API_BASE_URL}/tarifapplicable/update/${detail.tarifappid}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

      // Si l'appel échoue, on tente de lire le corps de l'erreur
  if (!response.ok) {
    let errorMessage = "Erreur lors de la mise à jour du détail de tarif"
    try {
      const errorData = await response.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      } else if (typeof errorData === "string") {
        errorMessage = errorData
      }
    } catch (e) {
      // Si on ne peut pas parser le corps, on garde le message générique
    }
    throw new Error(errorMessage)
  }
  return await response.json()
}

export async function deletePricingDetail(tarifappid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tarifapplicable/delete/${tarifappid}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  })

      // Si l'appel échoue, on tente de lire le corps de l'erreur
  if (!response.ok) {
    let errorMessage = "Erreur lors de la suppression du détail de tarif"
    try {
      const errorData = await response.json()
      if (errorData?.message) {
        errorMessage = errorData.message
      } else if (typeof errorData === "string") {
        errorMessage = errorData
      }
    } catch (e) {
      // Si on ne peut pas parser le corps, on garde le message générique
    }
    throw new Error(errorMessage)
  }
}

export const tarifService = new TarifService()
