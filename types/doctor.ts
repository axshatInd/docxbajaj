export interface Doctor {
  id: string
  name: string
  name_initials: string
  photo: string
  doctor_introduction: string
  specialities: {
    name: string
  }[]
  fees: string
  experience: string
  languages: string[]
  clinic: {
    name: string
    address: {
      locality: string
      city: string
      address_line1: string
      location: string
      logo_url: string
    }
  }
  video_consult: boolean
  in_clinic: boolean
}
