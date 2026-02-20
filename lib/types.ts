export type Profile = {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
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