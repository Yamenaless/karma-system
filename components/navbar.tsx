"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Receipt, FileText, ArrowRightLeft, CreditCard, Package, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/transformations",
      label: "Transformations",
      icon: ArrowRightLeft,
    },
    {
      href: "/expenses",
      label: "Expenses",
      icon: Receipt,
    },
    {
      href: "/paraniz",
      label: "Paraniz",
      icon: FileText,
    },
    {
      href: "/debts",
      label: "Debts",
      icon: CreditCard,
    },
    {
      href: "/products",
      label: "Products",
      icon: Package,
    },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-blue-200 bg-white/95 backdrop-blur-xl shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200">
              <span className="text-xl font-bold text-white">K</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-blue-900">
              <span className="hidden sm:inline">Karama System</span>
              <span className="sm:hidden">Karama</span>
            </h1>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "gap-2 transition-all duration-200",
                      isActive 
                        ? "bg-blue-700 text-white shadow-md hover:bg-blue-800" 
                        : "hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-200 py-2">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-2 transition-all duration-200",
                        isActive 
                          ? "bg-blue-700 text-white shadow-md" 
                          : "hover:bg-blue-50 hover:text-blue-700"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

