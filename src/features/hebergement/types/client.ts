export interface RegularClient {
  idcltreg: string
  nomcltreg: string
  prenomcltreg: string
  adressecltreg: string
  emailcltreg: string
  telcltreg: string
  typecomptecltreg: string
  villecltreg: string
  payscltreg: string
  numcomptcltreg: string
}

export interface BusinessClient {
  idcltbusiness: string
  raisoncltbusiness: string
  adrcltbusiness: string
  payscltbusiness: string
  villecltbusiness: string
  emailcltbusiness: string
  telcltbusiness: string
  numfisccltbusiness: string
  numcomptcltbusiness: string
  typecomptcltbusiness: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
}
