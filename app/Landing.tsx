'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle } from "lucide-react"
import { LoginSignupDialog } from "@/components/AuthComponents"
import { Button } from "@/components/ui/button"

// This is the landing page that shows when users are not logged in
// It has marketing content and login/signup options
export default function Landing() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl">MarketStep</span>
          <span className="sr-only">MarketStep</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <div className="hidden md:flex gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
              Features
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
              Pricing
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
              About
            </Link>
          </div>
          <div className="hidden md:flex gap-4">
            <LoginSignupDialog />
          </div>
          <div className="md:hidden">
            <LoginSignupDialog />
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your Financial Market Companion
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Track market movements, analyze SEC filings, and plan your investments with MarketStep.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <LoginSignupDialog buttonText="Get Started" />
                  <Button variant="outline">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  alt="Dashboard Preview"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                  src="/placeholder.svg"
                  width={550}
                  height={550}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Everything you need to stay on top of the market.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border p-4">
                  <div className="rounded-full bg-primary p-2 text-primary-foreground">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to get started?</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Join thousands of investors who use MarketStep daily.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <LoginSignupDialog buttonText="Sign Up Now" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 MarketStep Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

// Feature descriptions for the landing page
const features = [
  {
    title: "SEC Filing Alerts",
    description: "Get instant notifications when companies file important documents with the SEC.",
  },
  {
    title: "Calendar Integration",
    description: "Never miss important market events with our integrated calendar.",
  },
  {
    title: "Financial Analytics",
    description: "Analyze market trends and make informed investment decisions.",
  },
] 