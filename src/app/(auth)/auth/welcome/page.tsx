import { Suspense } from 'react'
import { WelcomeForm } from './WelcomeForm'
import { Loader2 } from 'lucide-react'

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted-50 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary-600" /></div>}>
      <WelcomeForm />
    </Suspense>
  )
}