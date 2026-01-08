"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Receipt, FileText, ArrowRightLeft, CreditCard, Package, Menu, X, StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
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
    {
      href: "/notes",
      label: "Notes",
      icon: StickyNote,
    },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-white border border-black"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 border-r border-gray-200 bg-white transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <span className="text-xl font-bold text-white">K</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">
              <span className="hidden sm:inline">Karama System</span>
              <span className="sm:hidden">Karama</span>
            </h1>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-primary"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-600")} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

