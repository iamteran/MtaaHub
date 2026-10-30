'use client'

import { useState, FormEvent } from 'react'
import { MessageSquare, Shield, Zap, Brain, Globe, Lock, Send, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const capabilities = [
  {
    name: 'Property Search',
    description: 'Find nyumba by budget, location, and amenities using natural language',
    icon: MessageSquare,
    available: true,
  },
  {
    name: 'Job Matching',
    description: 'Match skills to kazi opportunities with salary estimates',
    icon: Briefcase,
    available: true,
  },
  {
    name: 'Price Comparison',
    description: 'Compare bei across markets and shops for groceries, building materials',
    icon: Tag,
    available: true,
  },
  {
    name: 'Safety Checklist',
    description: 'Generate verification checklists for landlords, employers, services',
    icon: Shield,
    available: true,
  },
  {
    name: 'Business Advice',
    description: 'Biashara tips: licensing, KRA, M-PESA, marketing for Kenyan context',
    icon: Brain,
    available: false,
    comingSoon: true,
  },
  {
    name: 'Multi-language',
    description: 'Chat in English, Kiswahili, or Sheng — replies in your language',
    icon: Globe,
    available: false,
    comingSoon: true,
  },
]

const limitations = [
  'AI can make mistakes — always verify critical info (prices, legal requirements, safety)',
  'No access to your private data unless you explicitly share it in chat',
  'Cannot make bookings, payments, or submissions on your behalf',
  'Knowledge cutoff: training data up to 2024 — may not know latest regulations',
  'Not a substitute for professional legal, financial, or medical advice',
]

const privacyNotes = [
  'Conversations are not used to train models',
  'Chat history stored locally in your browser (not on our servers)',
  'No personal data sent to AI unless you type it',
  'You can clear history anytime from browser settings',
]

import { Briefcase, Tag } from 'lucide-react'

export default function MtaaAIPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: "Jambo! 👋 I'm Mtaa AI. Ask me about nyumba, kazi, bei, safety, or biashara. Try: 'What's a fair rent for a 2-bed in Kilimani?'" },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const responses: Record<string, string> = {
      rent: "For a 2-bed in Kilimani, expect KSh 45,000–80,000/month depending on amenities. NyumbaHub has live listings — want me to search?",
      job: "Tech roles in Nairobi: Junior dev KSh 80k–150k, Mid 150k–300k, Senior 300k+. KaziHub lists verified employers. What's your field?",
      price: "Unga (2kg): KSh 180–220. Cement (50kg): KSh 650–750. BeiSmart compares 50+ shops. What item?",
      safety: "Landlord verification: 1) ID copy 2) Title deed search 3) KRA PIN 4) Physical visit 5) Neighbour reference. Thibitisha has full checklist.",
      default: "I can help with nyumba search, job matching, price comparison, or safety checklists. What do you need?",
    }

    let reply = responses.default
    const lower = userMessage.toLowerCase()
    if (lower.includes('rent') || lower.includes('nyumba') || lower.includes('house')) reply = responses.rent
    else if (lower.includes('job') || lower.includes('kazi') || lower.includes('salary')) reply = responses.job
    else if (lower.includes('price') || lower.includes('bei') || lower.includes('cost') || lower.includes('ung') || lower.includes('cement')) reply = responses.price
    else if (lower.includes('safe') || lower.includes('verify') || lower.includes('landlord') || lower.includes('thibitisha')) reply = responses.safety

    setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-muted-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 via-white to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 text-sm sm:text-base">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Beta Feature — Free During Preview
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-muted-900 mb-6">
              <span className="text-primary-600">Mtaa</span> AI Assistant
            </h1>
            <p className="text-lg sm:text-xl text-muted-600 mb-8 max-w-2xl mx-auto">
              Ask about housing, jobs, prices, safety, or business in plain English or Kiswahili. Powered by AI, grounded in Kenyan context.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#demo" className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                Try Demo Chat
              </a>
              <a href="#capabilities" className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-xl border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors">
                See Capabilities
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-muted-900 mb-4">
              What Mtaa AI Can Do
            </h2>
            <p className="text-muted-600 max-w-2xl mx-auto">
              Each capability connects to live MtaaHub data — not just generic AI knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => (
              <Card key={cap.name} variant="outlined" className="relative">
                <div className="p-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <cap.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  {cap.comingSoon && (
                    <Badge variant="outline" className="mb-3 inline-block">
                      Coming Soon
                    </Badge>
                  )}
                  <h3 className="text-xl font-semibold text-muted-900 mb-2">{cap.name}</h3>
                  <p className="text-muted-600 mb-4">{cap.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`h-4 w-4 ${cap.available ? 'text-green-500' : 'text-muted-300'}`} aria-hidden="true" />
                    <span className={cap.available ? 'text-green-600' : 'text-muted-400'}>
                      {cap.available ? 'Available now' : 'In development'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Chat */}
      <section id="demo" className="py-16 sm:py-24 bg-muted-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-muted-900 mb-4">
                Try It Now (Demo)
              </h2>
              <p className="text-muted-600">
                Simulated responses — connects to live data in production.
              </p>
            </div>

            <Card variant="elevated" className="h-[500px] flex flex-col">
              <div className="p-4 border-b border-muted-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-muted-900">Mtaa AI</h3>
                  <p className="text-xs text-muted-500">Beta • Free preview</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Demo Mode</Badge>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-label="Chat messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-md'
                          : 'bg-white text-muted-900 rounded-bl-md shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-2">
                      <span className="text-muted-500 text-sm">Mtaa AI is thinking</span>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="p-4 border-t border-muted-200">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about nyumba, kazi, bei, safety, biashara..."
                    disabled={isLoading}
                    aria-label="Your message"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()} aria-label="Send message">
                    <Send className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>
                <p className="text-xs text-muted-500 mt-2 text-center">
                  Demo: tries 'rent', 'job', 'price', 'safety' keywords. Full AI in production.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy & Limitations */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card variant="outlined">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-muted-900 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  Privacy First
                </h3>
                <ul className="space-y-3">
                  {privacyNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-600">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card variant="outlined">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-muted-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  Limitations & Disclaimer
                </h3>
                <ul className="space-y-3">
                  {limitations.map((limitation, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-600">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {limitation}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Ready for Smarter Decisions?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Mtaa AI learns from every interaction. Start chatting now — it's free during beta.
          </p>
          <a href="#demo" className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-xl bg-secondary-500 text-white hover:bg-secondary-600 transition-colors w-auto">
            Open Demo Chat
            <Sparkles className="ml-2 h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  )
}