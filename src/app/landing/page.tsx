"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Recycle, DollarSign, Users, Upload, Handshake, Award, Twitter, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setIsVisible(true)

    // Create intersection observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1, rootMargin: "50px" },
    )

    // Observe all sections
    const sections = document.querySelectorAll("[data-animate]")
    sections.forEach((section) => {
      if (observerRef.current) {
        observerRef.current.observe(section)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const isAnimated = (id: string) => visibleSections.has(id)

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden relative">
      {/* Unified Cool Background */}
      <div className="fixed inset-0 z-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-teal-500/6 rounded-full blur-3xl animate-pulse delay-2000" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.01),transparent_70%)]" />
      </div>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 z-10">
        <div className="absolute inset-0 bg-slate-800/20 backdrop-blur-sm border-b border-slate-700/30" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className={`space-y-8 transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
            >
              <div className="space-y-6">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-sm transition-all duration-700 delay-200 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                  <span className="text-green-400 text-sm font-medium">Sustainable Technology Platform</span>
                </div>

                <h1
                  className={`text-5xl lg:text-6xl font-bold leading-tight transition-all duration-1000 delay-300 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                >
                  Give Electronics a{" "}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                      Second Life
                    </span>
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transform scale-x-0 animate-[scaleX_1s_ease-out_1.5s_forwards] origin-left" />
                  </span>{" "}
                  — Join the{" "}
                  <span className="bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                    ReCircuit
                  </span>{" "}
                  Movement
                </h1>

                <p
                  className={`text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-2xl transition-all duration-1000 delay-500 ${
                    isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  Connect electronics & waste recyclers to responsible device disposal, and earn rewards while making a
                  positive environmental impact.
                </p>
              </div>

              <div
                className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-700 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <Button
                  asChild
                  size="lg"
                  className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group border-2 border-slate-600 hover:border-green-400 bg-transparent hover:bg-green-400/10 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300"
                >
                  <Link href="/browse">
                    Learn More
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              {/* <div
                className={`grid grid-cols-3 gap-6 pt-8 border-t border-slate-700/50 transition-all duration-1000 delay-900 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                <div className="text-center group cursor-pointer">
                  <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">
                    10K+
                  </div>
                  <div className="text-sm text-slate-400">Devices Recycled</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">
                    ₹2M+
                  </div>
                  <div className="text-sm text-slate-400">Rewards Earned</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-300">
                    500+
                  </div>
                  <div className="text-sm text-slate-400">Active Recyclers</div>
                </div>
              </div> */}
            </div>

            <div
              className={`relative transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
            >
              <div className="relative w-full max-w-lg mx-auto">
                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-green-400/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-400/20 rounded-full blur-xl animate-pulse delay-1000" />

                <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-12 shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-500 group">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm group-hover:rotate-180 transition-transform duration-700">
                      <Recycle className="h-10 w-10 text-white animate-spin-slow" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-center space-x-3">
                        <div className="w-10 h-16 bg-slate-700 rounded-lg transform -rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-300 cursor-pointer animate-float" />
                        <div className="w-16 h-10 bg-slate-600 rounded-lg transform rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-300 cursor-pointer delay-100 animate-float-delayed" />
                        <div className="w-8 h-14 bg-slate-800 rounded-lg transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-300 cursor-pointer delay-200 animate-float-delayed-2" />
                      </div>
                      <p className="text-green-100 font-medium animate-pulse-text">Ready for Second Life</p>
                      <div className="flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-slate-800/20 backdrop-blur-sm border-y border-slate-700/30" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div
            id="features-header"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${
              isAnimated("features-header") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent animate-gradient">
              Why Choose ReCircuit?
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto animate-expand" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div
              id="feature-1"
              data-animate
              className={`group text-center space-y-6 p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-green-500/50 hover:bg-slate-800/50 transition-all duration-1000 transform hover:scale-105 hover:-translate-y-2 ${
                isAnimated("feature-1") ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Recycle className="h-10 w-10 text-green-400 group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <h3 className="text-2xl font-semibold group-hover:text-green-400 transition-colors duration-300 animate-text-glow">
                Eco-Friendly Disposal
              </h3>
              <p className="text-slate-300 leading-relaxed animate-fade-in-up">
                Responsively manage devices for sustainable reapplication and environmental protection.
              </p>
            </div>

            <div
              id="feature-2"
              data-animate
              className={`group text-center space-y-6 p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-yellow-500/50 hover:bg-slate-800/50 transition-all duration-1000 delay-200 transform hover:scale-105 hover:-translate-y-2 ${
                isAnimated("feature-2") ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-10 w-10 text-yellow-400 group-hover:animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <h3 className="text-2xl font-semibold group-hover:text-yellow-400 transition-colors duration-300 animate-text-glow">
                Earn While Recycling
              </h3>
              <p className="text-slate-300 leading-relaxed animate-fade-in-up">
                Enrich financial management for user recyclers with rewarding compensation systems.
              </p>
            </div>

            <div
              id="feature-3"
              data-animate
              className={`group text-center space-y-6 p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-1000 delay-400 transform hover:scale-105 hover:-translate-y-2 ${
                isAnimated("feature-3") ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}
            >
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-10 w-10 text-blue-400 group-hover:animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <h3 className="text-2xl font-semibold group-hover:text-blue-400 transition-colors duration-300 animate-text-glow">
                Community Driven
              </h3>
              <p className="text-slate-300 leading-relaxed animate-fade-in-up">
                Enthusiastically support community-driven environmental initiatives and partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-slate-800/20 backdrop-blur-sm border-y border-slate-700/30" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div
            id="how-it-works-header"
            data-animate
            className={`text-center mb-16 transition-all duration-1000 ${
              isAnimated("how-it-works-header") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent animate-gradient">
              How It Works
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto animate-expand" />
          </div>

          <div
            id="steps-container"
            data-animate
            className={`grid md:grid-cols-5 gap-8 items-center transition-all duration-1000 delay-300 ${
              isAnimated("steps-container") ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
          >
            {/* Step 1 */}
            <div className="group text-center space-y-6 animate-step-1">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full animate-badge-glow">
                  <span className="text-green-400 font-semibold">Step 1</span>
                </div>
                <h4 className="text-xl font-semibold group-hover:text-green-400 transition-colors duration-300 animate-text-shimmer">
                  Submit Your Device
                </h4>
                <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center group-hover:bg-slate-700 group-hover:scale-110 transition-all duration-300 shadow-lg animate-icon-float">
                  <Upload className="h-10 w-10 text-slate-400 group-hover:text-green-400 group-hover:-translate-y-1 transition-all duration-300" />
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center animate-arrow-flow">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-slate-600 to-green-400 rounded-full animate-flow" />
                <ArrowRight className="h-6 w-6 text-green-400 animate-pulse" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="group text-center space-y-6 animate-step-2">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full animate-badge-glow delay-200">
                  <span className="text-blue-400 font-semibold">Connect</span>
                </div>
                <h4 className="text-xl font-semibold group-hover:text-blue-400 transition-colors duration-300 animate-text-shimmer delay-200">
                  Sell/Donate/Buy as NGO
                </h4>
                <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center group-hover:bg-slate-700 group-hover:scale-110 transition-all duration-300 shadow-lg animate-icon-float delay-200">
                  <Handshake className="h-10 w-10 text-blue-400 group-hover:animate-pulse" />
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex justify-center animate-arrow-flow delay-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full animate-flow delay-200" />
                <ArrowRight className="h-6 w-6 text-yellow-400 animate-pulse delay-200" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="group text-center space-y-6 animate-step-3">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full animate-badge-glow delay-400">
                  <span className="text-yellow-400 font-semibold">Earn</span>
                </div>
                <h4 className="text-xl font-semibold group-hover:text-yellow-400 transition-colors duration-300 animate-text-shimmer delay-400">
                  Rewards
                </h4>
                <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center group-hover:bg-slate-700 group-hover:scale-110 transition-all duration-300 shadow-lg animate-icon-float delay-400">
                  <Award className="h-10 w-10 text-yellow-400 group-hover:animate-bounce" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="absolute inset-0 bg-slate-800/20 backdrop-blur-sm border-y border-slate-700/30" />
        <div
          id="cta-section"
          data-animate
          className={`max-w-4xl mx-auto text-center px-6 transition-all duration-1000 relative ${
            isAnimated("cta-section") ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent animate-gradient-text">
            Every device counts — start today!
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-300">
            Join thousands of environmentally conscious users making a real difference while earning rewards.
          </p>
          <Button
            asChild
            size="lg"
            className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-12 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-cta-pulse"
          >
            <Link href="/signup">
              Join Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md border-t border-slate-700/30" />
        <div className="relative py-16">
          <div
            id="footer-content"
            data-animate
            className={`max-w-7xl mx-auto px-6 transition-all duration-1000 ${
              isAnimated("footer-content") ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="grid md:grid-cols-3 gap-8">
              {/* Quick Links */}
              <div className="space-y-4 animate-fade-in-left">
                <h3 className="text-lg font-semibold text-green-400">Quick Links</h3>
                <ul className="space-y-3">
                  {["Home", "About", "Features", "Contact"].map((link, index) => (
                    <li key={link} className="animate-fade-in-left" style={{ animationDelay: `${index * 100}ms` }}>
                      <Link
                        href={`/${link.toLowerCase()}`}
                        className="text-slate-400 hover:text-green-400 transition-colors duration-300 flex items-center group"
                      >
                        <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow Us */}
              <div className="space-y-4 animate-fade-in-up delay-200">
                <h3 className="text-lg font-semibold text-green-400">Follow Us</h3>
                <ul className="space-y-3">
                  {["Home", "About", "Features", "Contact"].map((link, index) => (
                    <li key={link} className="animate-fade-in-up" style={{ animationDelay: `${200 + index * 100}ms` }}>
                      <Link
                        href={`/${link.toLowerCase()}`}
                        className="text-slate-400 hover:text-green-400 transition-colors duration-300 flex items-center group"
                      >
                        <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Media */}
              <div className="space-y-4 animate-fade-in-right delay-400">
                <h3 className="text-lg font-semibold text-green-400">Follow us</h3>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="group w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-all duration-300 transform hover:scale-110 animate-social-bounce"
                  >
                    <Twitter className="h-5 w-5 text-green-400 group-hover:text-white transition-colors duration-300" />
                  </a>
                  <a
                    href="#"
                    className="group w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-all duration-300 transform hover:scale-110 animate-social-bounce delay-100"
                  >
                    <Facebook className="h-5 w-5 text-green-400 group-hover:text-white transition-colors duration-300" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-12 pt-8 text-center animate-fade-in-up delay-600">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center animate-logo-glow">
                  <span className="text-slate-900 font-bold text-sm">RC</span>
                </div>
                <span className="text-xl font-bold animate-text-shimmer">
                  <span className="text-green-400">Re</span>Circuit
                </span>
              </div>
              <p className="text-slate-400 animate-fade-in-up delay-700">
                © 2024 ReCircuit. All rights reserved. Making electronics sustainable, one device at a time.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
