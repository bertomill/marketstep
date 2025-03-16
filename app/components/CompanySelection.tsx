'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { User } from 'firebase/auth'
import { Loader2, Search, ArrowRight, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

// This is a list of major companies with their logos
// In a real app, you would fetch this from an API or database
const popularCompanies = [
  { id: 'AAPL', name: 'Apple Inc.', logo: 'https://logo.clearbit.com/apple.com', cik: '0000320193' },
  { id: 'MSFT', name: 'Microsoft Corporation', logo: 'https://logo.clearbit.com/microsoft.com', cik: '0000789019' },
  { id: 'GOOGL', name: 'Alphabet Inc.', logo: 'https://logo.clearbit.com/google.com', cik: '0001652044' },
  { id: 'AMZN', name: 'Amazon.com, Inc.', logo: 'https://logo.clearbit.com/amazon.com', cik: '0001018724' },
  { id: 'META', name: 'Meta Platforms, Inc.', logo: 'https://logo.clearbit.com/meta.com', cik: '0001326801' },
  { id: 'TSLA', name: 'Tesla, Inc.', logo: 'https://logo.clearbit.com/tesla.com', cik: '0001318605' },
  { id: 'NVDA', name: 'NVIDIA Corporation', logo: 'https://logo.clearbit.com/nvidia.com', cik: '0001045810' },
  { id: 'JPM', name: 'JPMorgan Chase & Co.', logo: 'https://logo.clearbit.com/jpmorganchase.com', cik: '0000019617' },
  { id: 'V', name: 'Visa Inc.', logo: 'https://logo.clearbit.com/visa.com', cik: '0001403161' },
  { id: 'WMT', name: 'Walmart Inc.', logo: 'https://logo.clearbit.com/walmart.com', cik: '0000104169' },
  { id: 'JNJ', name: 'Johnson & Johnson', logo: 'https://logo.clearbit.com/jnj.com', cik: '0000200406' },
  { id: 'PG', name: 'Procter & Gamble Company', logo: 'https://logo.clearbit.com/pg.com', cik: '0000080424' },
]

// List of occupation options for users to select from
const occupationOptions = [
  "Investor Relations",
  "Strategy/M&A",
  "Investment Banking",
  "Consultancy",
  "Private Investor",
  "Student",
  "Media",
  "Buy Side",
  "Sell Side",
  "Researcher",
  "Other"
]

// This component allows users to select companies they want to follow
export default function CompanySelection({ user, onComplete }: { user: User, onComplete: () => void }) {
  // State to track selected companies
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('')
  // State to track if we're saving the selection
  const [isSaving, setIsSaving] = useState(false)
  // State to track the current step (1: occupation, 2: companies)
  const [currentStep, setCurrentStep] = useState(1)
  // State to track selected occupation
  const [occupation, setOccupation] = useState<string | null>(null)

  // Filter companies based on search term
  const filteredCompanies = popularCompanies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Toggle company selection
  const toggleCompany = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  // Handle occupation selection
  const handleOccupationSelect = (selected: string) => {
    setOccupation(selected)
  }

  // Move to the next step
  const goToNextStep = () => {
    if (currentStep === 1 && !occupation) {
      alert('Please select your occupation')
      return
    }
    setCurrentStep(2)
  }

  // Go back to the previous step
  const goToPreviousStep = () => {
    setCurrentStep(1)
  }

  // Save the user's selections to Firestore
  const saveSelections = async () => {
    if (selectedCompanies.length === 0) {
      alert('Please select at least one company to follow')
      return
    }

    setIsSaving(true)
    try {
      // Convert selected company IDs to full company objects
      const followedCompanies = selectedCompanies.map(id => {
        const company = popularCompanies.find(c => c.id === id)
        return {
          ticker: company?.id || id,
          name: company?.name || id,
          cik: company?.cik || ''
        }
      })

      // Save the selected companies and occupation to the user's document
      await setDoc(doc(db, 'users', user.uid), {
        followedCompanies,
        occupation: occupation,
        hasCompletedOnboarding: true,
        updatedAt: new Date()
      }, { merge: true })
      
      // Call the onComplete callback to move to the main app
      onComplete()
    } catch (error) {
      console.error('Error saving user selections:', error)
      alert('There was an error saving your selections. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to MarketStep!</h1>
      
      {/* Step indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
          }`}>
            1
          </div>
          <div className="w-16 h-1 bg-gray-200">
            <div className={`h-full ${currentStep === 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
          }`}>
            2
          </div>
        </div>
      </div>
      
      {currentStep === 1 ? (
        /* Step 1: Occupation Selection */
        <div>
          <p className="text-lg text-gray-600 mb-8 text-center">
            What best describes your occupation?
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {occupationOptions.map((option) => (
              <button
                key={option}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  occupation === option 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => handleOccupationSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
              onClick={goToNextStep}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Step 2: Company Selection */
        <div>
          <p className="text-lg text-gray-600 mb-8 text-center">
            Select companies you want to follow for market updates and insights
          </p>
          
          {/* Search bar */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search for companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Company grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {filteredCompanies.map(company => (
              <div 
                key={company.id}
                className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${
                  selectedCompanies.includes(company.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleCompany(company.id)}
              >
                <div className="w-16 h-16 relative mb-3">
                  <Image 
                    src={company.logo} 
                    alt={company.name} 
                    fill
                    className="object-contain"
                    onError={(e) => {
                      // Fallback for logo loading errors
                      const target = e.target as HTMLImageElement
                      target.src = `https://ui-avatars.com/api/?name=${company.name}&background=random`
                    }}
                  />
                </div>
                <h3 className="font-medium text-center">{company.name}</h3>
                <p className="text-xs text-gray-500 text-center">{company.id}</p>
              </div>
            ))}
          </div>
          
          {/* Selected count and navigation buttons */}
          <div className="flex flex-col items-center">
            <p className="mb-4">
              {selectedCompanies.length} {selectedCompanies.length === 1 ? 'company' : 'companies'} selected
            </p>
            <div className="flex space-x-4">
              <button
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                onClick={goToPreviousStep}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                onClick={saveSelections}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 