import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/activity')
}