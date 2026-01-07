"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Receipt, FileText, ArrowRightLeft, CreditCard, Package, Menu, X } from "lucide-react"
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
          "fixed left-0 top-0 z-40 h-full w-64 border-r border-black bg-white transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center gap-3 border-b border-black px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-xl font-bold text-primary-foreground">K</span>
            </div>
            <h1 className="text-lg font-bold text-black">
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
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "text-black hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}

