export type Statut = 'actif' | 'maintenance' | 'reserve'
export type StatutChauffeur = 'actif' | 'conge' | 'suspendu'
export type StatutProgramme = 'prevu' | 'en_cours' | 'termine' | 'annule'

export interface Gare {
  id: string
  nom: string
  region: string | null
  created_at: string
}

export interface Vehicule {
  id: string
  plaque: string
  modele: string
  nb_places: number
  statut: Statut
  gare_id: string | null
  notes: string | null
  created_at: string
  gare?: Gare
}

export interface Chauffeur {
  id: string
  nom: string
  prenoms: string
  contact: string | null
  photo_url: string | null
  statut: StatutChauffeur
  gare_id: string | null
  created_at: string
  gare?: Gare
}

export interface Recette {
  id: string
  date_recette: string
  vehicule_id: string
  gare_id: string | null
  recette_gare: number
  recette_route: number
  nb_passagers: number
  observations: string | null
  created_at: string
  vehicule?: Vehicule
  gare?: Gare
}

export interface Carburant {
  id: string
  date_dep: string
  vehicule_id: string
  montant: number
  litres: number | null
  station: string | null
  created_at: string
  vehicule?: Vehicule
}

export interface VueCumulJour {
  date_recette: string
  cumul_gare: number
  cumul_route: number
  cumul_brut: number
  cumul_carburant: number
  cumul_net: number
}