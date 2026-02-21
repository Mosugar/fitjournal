export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  sport: string | null
  created_at: string
}

export type Session = {
  id: string
  user_id: string
  title: string
  date: string
  feeling: number
  tags: string[] | null
  notes: string | null
  created_at: string
  exercises?: Exercise[]
}

export type Exercise = {
  id: string
  session_id: string
  name: string
  sets: number | null
  reps: number | null
  weight: number | null
}

export type Palmares = {
  id: string
  user_id: string
  year: string
  competition: string
  category: string | null
  result: string
  federation: string | null
  created_at: string
}

export type PersonalRecord = {
  id: string
  user_id: string
  lift: string
  weight: number
  unit: string
  validated: boolean
  created_at: string
}