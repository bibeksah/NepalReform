"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Menu, X, Home, Activity, ExternalLink, MessageSquarePlus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useHydration } from "@/hooks/use-hydration"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslation } from "react-i18next"

export function Header() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isHydrated = useHydration()
  const { t, ready } = useTranslation('common')

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (!ready || !isHydrated) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative"><Image src="/nepal-flag-logo.png" alt="NepalReforms Logo" fill className="object-contain" priority /></div>
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </header>
    )
  }

  const navItems: { href: string; label: string; icon: typeof Home; external?: boolean }[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/#agendas-section", label: "Agendas", icon: Activity },
    { href: "/tracker", label: "Tracker", icon: Activity },
    { href: "/testimonials", label: "Voices", icon: MessageSquarePlus },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 relative"><Image src="/nepal-flag-logo.png" alt="NepalReforms Logo" fill className="object-contain" /></div>
            <div>
              <div className="text-lg font-semibold text-foreground">NepalReforms</div>
              <div className="hidden sm:block text-xs text-muted-foreground">Public reform progress, with tracker-linked depth</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5">
            {navItems.map(({ href, label, icon: Icon, external }) => (
              <Link key={label} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="flex items-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-primary">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Dashboard">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline text-xs font-medium text-slate-700">Dashboard</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sm"><LogOut className="mr-2 h-4 w-4" />{t('header.signOut')}</Button>
              </div>
            ) : (
              <Button asChild size="sm"><Link href="/auth/login"><User className="mr-2 h-4 w-4" />{t('header.signIn')}</Link></Button>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="space-y-3">
              {navItems.map(({ href, label, icon: Icon, external }) => (
                <Link key={label} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Icon className="h-4 w-4" />{label}
                </Link>
              ))}
              <div className="pt-2"><LanguageToggle /></div>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-primary">
                    <User className="h-4 w-4" />Dashboard
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start"><LogOut className="mr-2 h-4 w-4" />{t('header.signOut')}</Button>
                </>
              ) : (
                <Button asChild size="sm" className="w-full"><Link href="/auth/login" onClick={() => setIsMenuOpen(false)}><User className="mr-2 h-4 w-4" />{t('header.signIn')}</Link></Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
