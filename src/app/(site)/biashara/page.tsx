'use client'

import Link from 'next/link'
import { Calculator, TrendingUp, FileText, Users, Target, Shield, ArrowRight, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatKSH } from '@/lib/utils'

const tools = [
  {
    name: 'Profit Calculator',
    description: 'Calculate margins, break-even points, and profitability for any business',
    icon: Calculator,
    features: ['Revenue vs Cost analysis', 'Break-even units', 'Profit margin %', 'M-PESA fee deduction'],
    cta: 'Calculate Profit',
    href: '/biashara/profit-calculator',
  },
  {
    name: 'Inventory Tracker',
    description: 'Track stock levels, reorder points, and valuation in real-time',
    icon: FileText,
    features: ['Low stock alerts', 'Stock valuation (FIFO/LIFO)', 'Reorder recommendations', 'Expiry tracking'],
    cta: 'Track Inventory',
    href: '/biashara/inventory',
    comingSoon: true,
  },
  {
    name: 'Sales Analytics',
    description: 'Visualize daily, weekly, monthly sales trends with KSh formatting',
    icon: TrendingUp,
    features: ['Revenue charts', 'Top products', 'Peak hours analysis', 'Comparison periods'],
    cta: 'View Analytics',
    href: '/biashara/analytics',
    comingSoon: true,
  },
  {
    name: 'Customer Manager',
    description: 'Manage contacts, purchase history, and loyalty rewards',
    icon: Users,
    features: ['Contact database', 'Purchase history', 'Loyalty points', 'SMS/WhatsApp integration'],
    cta: 'Manage Customers',
    href: '/biashara/customers',
    comingSoon: true,
  },
  {
    name: 'Expense Tracker',
    description: 'Categorize and monitor business expenses for tax compliance',
    icon: Target,
    features: ['Category budgets', 'Receipt capture (OCR)', 'KRA-ready reports', 'M-PESA sync'],
    cta: 'Track Expenses',
    href: '/biashara/expenses',
    comingSoon: true,
  },
  {
    name: 'Business Health Score',
    description: 'Get a comprehensive health score with actionable insights',
    icon: Shield,
    features: ['Financial health rating', 'Cash flow forecast', 'Risk indicators', 'Improvement plan'],
    cta: 'Check Health',
    href: '/biashara/health-score',
    comingSoon: true,
  },
]

const features = [
  { title: 'KSh Native', description: 'All calculations in Kenyan Shillings with proper formatting (KSh 1,234.56)' },
  { title: 'M-PESA Aware', description: 'Built-in M-PESA transaction fee calculations and reconciliation' },
  { title: 'KRA Compliant', description: 'Reports formatted for Kenya Revenue Authority requirements' },
  { title: 'Offline First', description: 'Works on 2G/3G networks, syncs when online' },
  { title: 'Data Privacy', description: 'Your business data stays yours — never sold or shared' },
  { title: 'Free Forever', description: 'Core tools free. Advanced features via affordable subscription' },
]

const profitDemo = {
  revenue: 150000,
  cogs: 90000,
  expenses: 25000,
  mpesaFees: 2250,
}

const grossProfit = profitDemo.revenue - profitDemo.cogs
const netProfit = grossProfit - profitDemo.expenses - profitDemo.mpesaFees
const margin = ((netProfit / profitDemo.revenue) * 100).toFixed(1)

export default function BiasharaPage() {
  return (
    <div className="min-h-screen bg-muted-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 via-white to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 text-sm sm:text-base">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Free Business Tools for Kenyan Entrepreneurs
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-muted-900 mb-6">
              Smart Tools for{' '}
              <span className="text-primary-600">Biashara</span> Growth
            </h1>
            <p className="text-lg sm:text-xl text-muted-600 mb-8 max-w-2xl mx-auto">
              Calculate profits, track inventory, manage customers, and monitor expenses — all in KSh, built for Kenyan businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/biashara/profit-calculator" className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                Try Profit Calculator
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </a>
              <a href="#tools" className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-xl border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors">
                View All Tools
              </a>
            </div>
          </div>

          {/* Live Profit Demo */}
          <div className="mt-16 max-w-2xl mx-auto">
            <Card variant="elevated" className="bg-primary-50 border-primary-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" aria-hidden="true" />
                  Live Profit Calculation Demo
                </h3>
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="text-muted-600">Revenue</span>
                    <span className="font-medium">{formatKSH(profitDemo.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-muted-500">
                    <span>− Cost of Goods</span>
                    <span>{formatKSH(profitDemo.cogs)}</span>
                  </div>
                  <div className="flex justify-between text-muted-500">
                    <span>− Operating Expenses</span>
                    <span>{formatKSH(profitDemo.expenses)}</span>
                  </div>
                  <div className="flex justify-between text-muted-500">
                    <span>− M-PESA Fees (1.5%)</span>
                    <span>{formatKSH(profitDemo.mpesaFees)}</span>
                  </div>
                  <div className="border-t border-primary-200 pt-3 flex justify-between text-lg font-bold text-primary-700">
                    <span>Net Profit</span>
                    <span>{formatKSH(netProfit)} ({margin}%)</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-primary-600">
                  Try it yourself with your own numbers in the Profit Calculator.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-muted-900 mb-4">
              Available Business Tools
            </h2>
            <p className="text-muted-600 max-w-2xl mx-auto">
              Start with the Profit Calculator — it's fully functional. Other tools are in active development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.name} variant="outlined" className="h-full hover:shadow-card-hover transition-shadow">
                <div className="p-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                    <tool.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-muted-900 mb-2">{tool.name}</h3>
                  <p className="text-muted-600 mb-4">{tool.description}</p>
                  <ul className="space-y-2 mb-6">
                    {tool.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-600">
                        <span className="text-primary-500 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a href={tool.href} className={`inline-flex items-center justify-center w-full px-4 py-2 text-base font-medium rounded-xl transition-colors ${tool.comingSoon
                    ? 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 cursor-not-allowed opacity-50'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}>
                    {tool.cta}
                    {!tool.comingSoon && <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />}
                    {tool.comingSoon && <span className="ml-2 text-xs text-muted-400">(Coming Soon)</span>}
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 bg-muted-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-muted-900 mb-4">
              Built for Kenyan Business
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} variant="outlined" className="text-center p-6">
                <h3 className="text-lg font-semibold text-muted-900 mb-2">{feature.title}</h3>
                <p className="text-muted-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16 bg-white border-t border-muted-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="outlined" className="bg-muted-50 border-muted-200">
            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-muted-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-600" aria-hidden="true" />
                Important Disclaimer
              </h3>
              <div className="prose prose-sm text-muted-700 max-w-none">
                <p className="mb-4">
                  <strong>Biashara tools provide estimates and calculations for informational purposes only.</strong> They do not constitute financial, tax, or legal advice.
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Profit calculations exclude variable costs specific to your business</li>
                  <li>M-PESA fees are estimates based on published rates (subject to change by Safaricom)</li>
                  <li>KRA compliance features are helpers — consult a tax professional for filing</li>
                  <li>Inventory valuation methods (FIFO/LIFO) may have different tax implications</li>
                </ul>
                <p className="text-sm text-muted-500">
                  Always consult with a qualified accountant or financial advisor for decisions affecting your business.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Ready to Grow Your Biashara?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Start with the Profit Calculator — it's free, functional, and built for Kenyan entrepreneurs.
          </p>
          <a href="/biashara/profit-calculator" className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-xl bg-secondary-500 text-white hover:bg-secondary-600 transition-colors w-auto">
            Calculate Your Profit Now
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  )
}