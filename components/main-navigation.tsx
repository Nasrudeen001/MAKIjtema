"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, UserPlus, Users, GraduationCap, Settings, BookOpen, MapPin, Menu, X } from "lucide-react"
import Image from "next/image"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Register",
    href: "/register",
    icon: UserPlus,
  },
  {
    title: "Participants",
    href: "/participants",
    icon: Users,
  },
  {
    title: "Contribution",
    href: "/contribution",
    icon: BookOpen,
  },
  {
    title: "Academics",
    href: "/academics",
    icon: GraduationCap,
  },
  {
    title: "Region-Majlis",
    href: "/region-majlis",
    icon: MapPin,
  },
  {
    title: "Event Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function MainNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/ansar-logo.jpeg"
                  alt="Majlis Ansarullah Kenya Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Majlis Ansarullah Kenya</h1>
                <p className="text-sm text-muted-foreground">Ijtema Management System</p>
              </div>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-2">
          <div className="hidden md:flex space-x-1 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center space-x-2 whitespace-nowrap",
                      isActive && "bg-primary text-primary-foreground",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          <div className={cn("md:hidden", isMobileMenuOpen ? "block" : "hidden")}>
            <div className="flex flex-col space-y-1 py-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start flex items-center space-x-2",
                        isActive && "bg-primary text-primary-foreground",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
