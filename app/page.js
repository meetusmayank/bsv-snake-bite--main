'use client'
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Heart, GraduationCap, MapPin, Users, Megaphone, Building2, Stethoscope, Globe, Menu, X, Phone, Mail, ChevronRight, Lightbulb, Shield, ShieldAlert, Sparkles, Play, ArrowRight, BookOpen, Video, ImageIcon, Search, FileText, Activity, TrendingUp, Award } from 'lucide-react'
import { LANGUAGES, getT } from '@/lib/translations'
import AnimatedCounter from '@/components/AnimatedCounter'
import MiniIndiaMap from '@/components/MiniIndiaMap'
import QuizSection from '@/components/QuizSection'
import Link from 'next/link'

const ICONS = { Heart, GraduationCap, MapPin, Users, Megaphone, Building2, Stethoscope }
const DEFAULT_BRAND = { blue: '#151f6d', red: '#de2527', white: '#ffffff', surface: '#f8fafc', heading: '#151f6d', text: '#334155' }
let BRAND = { ...DEFAULT_BRAND }

/* =============================================================
   STYLIZED INDIA STATE GRID — each card has a mini India map
   with the active state highlighted in campaign gradient
   ============================================================= */
function StatesGrid({ states = [], t }) {
  const active = states.filter(s => s.enabled !== false)
  const maxLives = Math.max(1, ...active.map(s => s.beneficiaries || 0))
  const totals = active.reduce((acc, s) => ({
    lives: acc.lives + (s.beneficiaries || 0),
    campaigns: acc.campaigns + (s.campaigns || 0),
    workshops: acc.workshops + (s.workshops || 0),
  }), { lives: 0, campaigns: 0, workshops: 0 })

  return (
    <div className="space-y-8">
      {/* Aggregate strip */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 rounded-2xl bg-gradient-to-r from-[#151f6d] to-[#1e2a8a] p-5 md:p-7 shadow-xl">
        {[
          { label: t.outreach.activeStates, value: active.length, icon: MapPin },
          { label: t.outreach.livesImpacted, value: totals.lives, icon: Heart, suffix: '+' },
          { label: t.outreach.campaignsRun, value: totals.campaigns, icon: Megaphone, suffix: '+' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="text-center text-white">
              <Icon className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 opacity-80" />
              <div className="font-display text-2xl md:text-4xl font-semibold"><AnimatedCounter value={s.value} suffix={s.suffix || ''} /></div>
              <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-80 mt-1">{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* State cards with mini India map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {active.map((s, i) => {
          const pct = Math.min(100, Math.round(((s.beneficiaries || 0) / maxLives) * 100))
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-2xl transition-all duration-300"
            >
              {/* Top accent bar */}
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${BRAND.red} 0%, ${BRAND.blue} 100%)` }} />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: BRAND.red }} />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: BRAND.red }} />
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{t.outreach.active}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold mt-1" style={{ color: BRAND.blue }}>{s.name}</h3>
                  </div>
                  {/* Mini India map with this state highlighted */}
                  <div className="ml-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2">
                    <MiniIndiaMap activeCode={s.code} size="md" />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.outreach.lives}</div>
                    <div className="font-display font-semibold text-base" style={{ color: BRAND.red }}>
                      <AnimatedCounter value={s.beneficiaries || 0} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.outreach.camps}</div>
                    <div className="font-display font-semibold text-base" style={{ color: BRAND.blue }}>
                      <AnimatedCounter value={s.campaigns || 0} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-500">{t.outreach.workshops}</div>
                    <div className="font-display font-semibold text-base" style={{ color: BRAND.blue }}>
                      <AnimatedCounter value={s.workshops || 0} />
                    </div>
                  </div>
                </div>

                {/* Progress vs largest state */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="uppercase tracking-wide">{t.outreach.reach}</span>
                    <span className="font-semibold" style={{ color: BRAND.blue }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${BRAND.blue} 0%, ${BRAND.red} 100%)` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hover ribbon */}
              <div className="absolute -bottom-px left-0 right-0 h-0 group-hover:h-1 transition-all duration-300" style={{ background: BRAND.red }} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function Header({ lang, setLang, t, settings }) {
  const [open, setOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(null)
  const [megaLeft, setMegaLeft] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const megaMenus = {
    awareness: {
      label: t.nav.awareness,
      groups: [
        {
          title: 'On-Ground Activations',
          items: [
            { label: 'Nukkad Natak, Wall Paintings, Bus Branding', href: '#awareness', desc: 'Community outreach programs' },
            { label: 'Campaign Moments', href: '#gallery', desc: 'See campaign in action' },
          ]
        },
        {
          title: 'NGO Collaborations',
          items: [
            { label: 'Partner Network Across India', href: '/ngo-network', desc: 'Our NGO partners' },
            { label: 'Real-life Impact Stories', href: '#stories', desc: 'Stories from the field' },
          ]
        },
        {
          title: 'Mass & Digital Media',
          items: [
            { label: 'Campaign Films & Interviews', href: '#video', desc: 'Watch our videos' },
            { label: 'Bust the Myths', href: '#myths', desc: 'Myth vs Fact' },
          ]
        },
      ]
    },
    access: {
      label: t.nav.access,
      groups: [
        {
          title: 'Workshops & Training',
          items: [
            { label: 'Clinician Training Programs', href: '#access', desc: 'Hands-on training for clinicians, RMPs, ASHAs' },
            { label: 'State-wise Campaign Reach', href: '#outreach', desc: 'Our outreach across India' },
          ]
        },
        {
          title: 'Clinician Engagement',
          items: [
            { label: 'Beyond Monsoons Program', href: '#access', desc: 'Venom to Vial initiative' },
            { label: 'Field Stories', href: '#stories', desc: 'Stories from clinicians' },
          ]
        },
        {
          title: 'Training Modules',
          items: [
            { label: 'ASV Protocols', href: '#resources', desc: 'Clinical education materials' },
            { label: 'Download Library', href: '#resources', desc: 'All resources in one place' },
          ]
        },
      ]
    },
    communication: {
      label: t.nav.communication,
      groups: [
        {
          title: 'Print Materials',
          items: [
            { label: 'Posters & Brochures', href: '#resources', desc: 'Multilingual print materials' },
            { label: 'All Downloads', href: '#resources', desc: 'Complete resource library' },
          ]
        },
        {
          title: 'Video Content',
          items: [
            { label: 'Awareness Videos', href: '#video', desc: 'Vox pops, myth-busting reels' },
            { label: 'Watch the Campaign', href: '#video', desc: 'Campaign in action' },
          ]
        },
        {
          title: 'Visual Stories',
          items: [
            { label: 'Comic & Visual Stories', href: '#gallery', desc: 'Engaging visual content' },
            { label: 'Browse Gallery', href: '#gallery', desc: 'Photo gallery' },
          ]
        },
      ]
    },
  }

  const menu = [
    { id: 'home', label: t.nav.home, href: '#home' },
    { id: 'video', label: t.nav.watch, href: '#video' },
    { id: 'awareness', label: t.nav.awareness, href: '#awareness' },
    { id: 'access', label: t.nav.access, href: '#access' },
    { id: 'communication', label: t.nav.communication, href: '#communication' },
    { id: 'outreach', label: t.nav.outreach, href: '#outreach' },
    { id: 'contact', label: t.nav.contact, href: '#contact' },
  ]

  const go = (href) => {
    setMegaOpen(null)
    setOpen(false)
    if (href.startsWith('#')) {
      const id = href.slice(1)
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else if (typeof window !== 'undefined') {
      window.location.href = href
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${scrolled
        ? 'bg-white backdrop-blur-lg border-b border-slate-200/80 shadow-lg'
        : 'bg-white backdrop-blur-md border-b border-slate-200/50 shadow-sm'
        }`}
      onMouseLeave={() => setMegaOpen(null)}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Logo - Original + Tagline same color as brand */}
          <button
            onClick={() => go('#home')}
            className="flex items-center gap-2 flex-1 min-w-0"
            style={{ transform: open ? 'scale(0.95)' : 'scale(1)' }}
          >
            <img
              src={settings?.branding?.bsvLogo}
              alt="BSV"
              className="h-8 sm:h-12 md:h-14 w-auto flex-shrink-0"
              draggable={false}
            />

            <div className="min-w-0 flex-1">
              <div
                className="text-[8px] sm:text-[11px] md:text-xs font-medium leading-tight"
                style={{ color: BRAND.blue }}
              >
                Saap Ka Vaar, Aspataal Mein Hi Upchaar
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button onClick={() => go('#home')} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#de2527] hover:bg-slate-50/80 rounded-lg transition-all duration-200">
              {t.nav.home}
            </button>
            <button onClick={() => go('#video')} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#de2527] hover:bg-slate-50/80 rounded-lg transition-all duration-200">
              {t.nav.watch}
            </button>

            {['awareness', 'access', 'communication'].map(key => (
              <div
                key={key}
                className="relative"
                onMouseEnter={(e) => {
                  setMegaOpen(key)
                  setMegaLeft(e.currentTarget.getBoundingClientRect().left)
                }}
              >
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 inline-flex items-center gap-1.5 ${megaOpen === key
                    ? 'text-[#de2527] bg-red-50/80'
                    : 'text-slate-600 hover:text-[#de2527] hover:bg-slate-50/80'
                    }`}
                >
                  {megaMenus[key].label}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${megaOpen === key ? 'rotate-90 text-[#de2527]' : ''}`} />
                </button>
              </div>
            ))}

            <button onClick={() => go('#outreach')} className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#de2527] hover:bg-slate-50/80 rounded-lg transition-all duration-200">
              {t.nav.outreach}
            </button>

            <button onClick={() => go('#contact')} className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.red})` }}>
              {t.nav.contact}
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src={settings?.branding?.mankindLogo}
              alt="Mankind"
              className="h-8 sm:h-10 md:h-12 w-auto flex-shrink-0"
              draggable={false}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-2 border-slate-200 hover:border-[#de2527] hover:bg-red-50/50 transition-all duration-200 rounded-xl px-1 sm:px-3"
                >
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline text-sm font-medium text-slate-600">
                    {LANGUAGES.find(l => l.code === lang)?.native}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto rounded-xl shadow-xl border-slate-200/80 z-[9999]">
                {LANGUAGES.map(l => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`${lang === l.code ? 'bg-red-50 font-semibold text-[#de2527]' : ''} cursor-pointer`}
                  >
                    {l.native}
                    <span className="text-slate-400 ml-2 text-xs">({l.label})</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button - Animated */}
            <button
              className="lg:hidden p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-all duration-300"
              onClick={() => setOpen(!open)}
            >
              <motion.div
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {open ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mega Menu Panel - Desktop */}
        {megaOpen && megaMenus[megaOpen] && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="hidden lg:block absolute left-0 right-0 top-full bg-white backdrop-blur-lg border-t border-slate-200/80 shadow-2xl rounded-b-2xl z-[99999]"
            onMouseEnter={() => setMegaOpen(megaOpen)}
          >
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-4 gap-8">
                <div className="col-span-1 rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: `linear-gradient(145deg, ${BRAND.blue}, ${BRAND.red})` }}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="text-xs uppercase tracking-wider opacity-80 mb-3 font-semibold">
                      {t.badges?.[megaOpen] || megaMenus[megaOpen].label}
                    </div>
                    <div className="font-display font-bold text-2xl mb-3 leading-tight">
                      {megaOpen === 'awareness' ? 'Creating Informed Communities' :
                        megaOpen === 'access' ? 'Bridging the Gap' :
                          'Spreading the Message'}
                    </div>
                    <div className="text-sm text-white/85 leading-relaxed">
                      {megaOpen === 'awareness' ? 'Through education, outreach, and action — turning fear into facts.' :
                        megaOpen === 'access' ? 'Ensuring every snakebite victim gets the right care at the right time.' :
                          'Using every medium to reach every corner of India.'}
                    </div>
                    <button onClick={() => go(`#${megaOpen}`)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold hover:underline underline-offset-2 transition-all group">
                      Learn More
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                {megaMenus[megaOpen].groups.map((g, gi) => (
                  <div key={gi} className="col-span-1">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-4 border-b border-slate-100 pb-3">
                      {g.title}
                    </div>
                    <ul className="space-y-3">
                      {g.items.map((it, ii) => (
                        <li key={ii}>
                          <button onClick={() => go(it.href)} className="w-full text-left group p-2 rounded-xl hover:bg-slate-50 transition-all duration-200">
                            <div className="font-display font-semibold text-sm group-hover:text-[#de2527] transition-colors" style={{ color: BRAND.blue }}>
                              {it.label}
                            </div>
                            <div className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors leading-relaxed">
                              {it.desc}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile Menu - Solid Background, Items Clearly Visible */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="lg:hidden absolute left-0 right-0 top-full border-t border-white/10 shadow-2xl rounded-b-2xl z-[99999] max-h-[80vh] overflow-y-auto"
            style={{ background: BRAND.blue }}
          >
            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-1 bg-white/30 rounded-full" />
              </div>

              {menu.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => go(item.href)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className={`w-full text-left py-3.5 sm:py-3 px-3 rounded-xl text-sm font-medium text-white hover:bg-white/10 hover:text-white active:bg-white/20 transition-all duration-200 flex items-center justify-between group ${i > 0 ? 'border-t border-white/10 mt-1 pt-3.5 sm:pt-3' : ''
                    }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}

function Hero({ content, t }) {
  const stats = content?.heroStats || []

  const slides = Array.isArray(content?.heroSlides)
    ? content.heroSlides
      .filter(slide => (slide?.desktopImage || slide?.mobileImage) && slide.active !== false)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    : []

  const sliderRef = useRef(null)
  const [activeSlide, setActiveSlide] = useState(0)

  const scrollToSlide = (index) => {
    if (!sliderRef.current) return

    const slider = sliderRef.current
    const card = slider.querySelector('[data-hero-card]')
    if (!card) return

    const gap = 20
    const left = index * (card.offsetWidth + gap)

    slider.scrollTo({
      left,
      behavior: 'smooth',
    })

    setActiveSlide(index)
  }

  const scrollHero = (direction) => {
    if (!slides.length) return

    const nextIndex =
      direction === 'next'
        ? Math.min(activeSlide + 1, slides.length - 1)
        : Math.max(activeSlide - 1, 0)

    scrollToSlide(nextIndex)
  }

  if (!slides.length) return null

  return (
    <section
      id="home"
      className="relative overflow-hidden pt-20 sm:pt-24 pb-8 sm:pb-12 bg-gradient-to-b from-slate-50 via-white to-slate-50"
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="relative">

          {/* Desktop Left Arrow */}
          {slides.length > 1 && (
            <button
              type="button"
              onClick={() => scrollHero('prev')}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg text-2xl font-bold items-center justify-center"
              style={{ color: BRAND.blue }}
            >
              ‹
            </button>
          )}

          <div
            ref={sliderRef}
            className="overflow-x-auto no-scrollbar scroll-smooth pb-4"
          >
            <div className="flex gap-4 sm:gap-5 w-max">
              {slides.map((slide, i) => (
                <div
                  key={slide.id || i}
                  data-hero-card
                  className="relative w-[82vw] sm:w-[46vw] lg:w-[47vw] h-[260px] sm:h-[320px] lg:h-[360px] overflow-hidden rounded-[1.5rem] shadow-xl bg-white flex-shrink-0"
                >
                  <picture>
                    <source
                      media="(max-width: 768px)"
                      srcSet={slide.mobileImage || slide.desktopImage}
                    />

                    <img
                      src={slide.desktopImage || slide.mobileImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Right Arrow */}
          {slides.length > 1 && (
            <button
              type="button"
              onClick={() => scrollHero('next')}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg text-2xl font-bold items-center justify-center"
              style={{ color: BRAND.blue }}
            >
              ›
            </button>
          )}

          {/* Dots */}
          {slides.length > 1 && (
            <div className="hidden md:flex justify-center gap-2 mt-4">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToSlide(i)}
                  className={`h-2 rounded-full transition-all ${i === activeSlide
                    ? 'w-8 bg-bsv-red'
                    : 'w-2 bg-slate-300'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 max-w-5xl mx-auto mt-6 relative z-10">
          {stats.map((s, i) => {
            const Icon = ICONS[s.icon] || Heart

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-white/95 backdrop-blur shadow-xl hover:-translate-y-1 transition border-0">
                  <CardContent className="p-3 sm:p-4">
                    <Icon
                      className="w-5 h-5 sm:w-6 sm:h-6 mb-1.5"
                      style={{ color: BRAND.red }}
                    />

                    <div
                      className="font-display font-bold text-xl md:text-2xl mb-0.5 leading-tight"
                      style={{ color: BRAND.blue }}
                    >
                      <AnimatedCounter value={s.value} suffix={s.suffix} />
                    </div>

                    <div className="text-[11px] md:text-xs text-slate-700 font-semibold leading-tight">
                      {s.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function VideoSection({ videos, t }) {
  const [active, setActive] = useState(null)
  const published = (videos || []).filter(v => v.published !== false)
  const featured = published.find(v => v.featured) || published[0]
  const others = published.filter(v => v.id !== featured?.id).slice(0, 6)

  if (!featured) return null

  return (
    <section id="video" className="section-pad bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-3" style={{ color: BRAND.red, borderColor: BRAND.red }}>{t.badges.watch}</Badge>
          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-3" style={{ color: BRAND.blue }}>{t.video.title}</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">{t.video.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          {/* Featured video */}
          <button onClick={() => setActive(featured)} className="group relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-slate-900">
            {featured.thumbnail && <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition" style={{ background: BRAND.red }}>
                <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-left text-white">
              <Badge className="border-0 mb-2" style={{ background: BRAND.red }}>{featured.category || t.video.featured}</Badge>
              <h3 className="font-display text-xl md:text-3xl font-semibold drop-shadow-md">{featured.title}</h3>
              {featured.description && <p className="text-sm md:text-base text-white/85 mt-1 line-clamp-2 max-w-2xl">{featured.description}</p>}
            </div>
          </button>

          {/* Side list */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{t.video.more}</div>
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {others.length === 0 && <div className="text-sm text-slate-500">{t.video.soon}</div>}
              {others.map(v => (
                <button key={v.id} onClick={() => setActive(v)} className="group w-full flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition text-left">
                  <div className="relative flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden bg-slate-200">
                    {v.thumbnail && <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-medium text-sm line-clamp-2" style={{ color: BRAND.blue }}>{v.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{v.category || 'Campaign'}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {active && (
          <Dialog open onOpenChange={() => setActive(null)}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black">
              <DialogHeader className="sr-only"><DialogTitle>{active.title}</DialogTitle><DialogDescription>{active.description}</DialogDescription></DialogHeader>
              <div className="aspect-video w-full">
                {active.youtubeId ? (
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1&rel=0`} title={active.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                ) : active.url ? (
                  <video src={active.url} controls autoPlay className="w-full h-full" />
                ) : null}
              </div>
              <div className="p-4 bg-white">
                <div className="font-display font-semibold text-lg" style={{ color: BRAND.blue }}>{active.title}</div>
                {active.description && <p className="text-sm text-slate-600 mt-1">{active.description}</p>}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  )
}

function SectionHeader({ badge, title, subtitle }) {
  return (
    <div className="text-center mb-12">
      <Badge variant="outline" className="mb-3" style={{ color: BRAND.red, borderColor: BRAND.red }}>{badge}</Badge>
      <h2 className="font-display text-3xl md:text-5xl font-semibold mb-3" style={{ color: BRAND.blue }}>{title}</h2>
      <p className="text-slate-600 text-lg max-w-2xl mx-auto">{subtitle}</p>
    </div>
  )
}

function PillarCard({ icon: Icon, title, desc, reverseGradient, href }) {
  const bg = reverseGradient ? `linear-gradient(135deg, ${BRAND.red}, ${BRAND.blue})` : `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.red})`
  const onClick = () => {
    if (!href) return
    if (href.startsWith('#')) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    else if (typeof window !== 'undefined') window.location.href = href
  }
  return (
    <Card onClick={onClick} className="border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition group cursor-pointer relative overflow-hidden">
      {/* Hover gradient accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500" style={{ background: `linear-gradient(135deg, ${BRAND.blue}05, ${BRAND.red}10)` }} />
      <CardContent className="p-6 relative">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition" style={{ background: bg }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-display font-semibold text-xl mb-2 transition group-hover:text-[#de2527]" style={{ color: BRAND.blue }}>{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed font-normal">{desc}</p>
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition duration-300" style={{ color: BRAND.red }}>
          Explore <ArrowRight className="w-3 h-3" />
        </div>
      </CardContent>
    </Card>
  )
}

function AwarenessSection({ t }) {
  const icons = [Megaphone, Users, Video]
  const hrefs = ['#gallery', '/ngo-network', '#video']
  return (
    <section id="awareness" className="section-pad bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.awareness} title={t.awareness.title} subtitle={t.awareness.subtitle} />
        <div className="grid md:grid-cols-3 gap-6">
          {t.awareness.items.map((it, i) => <PillarCard key={i} icon={icons[i] || Megaphone} title={it.title} desc={it.desc} href={hrefs[i]} />)}
        </div>
      </div>
    </section>
  )
}

function AccessSection({ t }) {
  const icons = [BookOpen, Stethoscope, GraduationCap]
  const hrefs = ['#stories', '#outreach', '#resources']
  return (
    <section id="access" className="section-pad bg-slate-50">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.access} title={t.access.title} subtitle={t.access.subtitle} />
        <div className="grid md:grid-cols-3 gap-6">
          {t.access.items.map((it, i) => <PillarCard key={i} reverseGradient icon={icons[i] || BookOpen} title={it.title} desc={it.desc} href={hrefs[i]} />)}
        </div>
      </div>
    </section>
  )
}

function CommunicationSection({ t }) {
  const icons = [FileText, Video, ImageIcon]
  const hrefs = ['#resources', '#video', '#gallery']
  return (
    <section id="communication" className="section-pad bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.communication} title={t.communication.title} subtitle={t.communication.subtitle} />
        <div className="grid md:grid-cols-3 gap-6">
          {t.communication.items.map((it, i) => <PillarCard key={i} icon={icons[i] || FileText} title={it.title} desc={it.desc} href={hrefs[i]} />)}
        </div>
      </div>
    </section>
  )
}

function OutreachSection({ content, t }) {
  const states = (content?.states || []).map(s => ({
    name: s.name,
    code: s.code,
    campaigns: s.sessions,
    beneficiaries: s.lives,
    workshops: Math.round((s.sessions || 0) / 3),
    enabled: true,
  }))
  return (
    <section id="outreach" className="section-pad bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.outreach} title={t.outreach.title} subtitle={t.outreach.subtitle} />
        <StatesGrid states={states} t={t} />
      </div>
    </section>
  )
}

function StoriesSection({ stories, t }) {
  if (!stories?.length) return null
  return (
    <section id="stories" className="section-pad bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.stories} title={t.stories.title} subtitle={t.stories.subtitle} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.filter(s => s.published !== false).slice(0, 6).map(s => (
            <Link key={s.id} href={`/impact-stories/${s.id}`}>
              <Card className="overflow-hidden group cursor-pointer h-full hover:-translate-y-2 transition duration-300 border-0 shadow-lg hover:shadow-2xl">
                <div className="relative h-72 overflow-hidden bg-slate-100">
                  {s.heroImage && <img src={s.heroImage} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <Badge className="mb-2 border-0" style={{ background: BRAND.red }}>{s.category}</Badge>
                    <h3 className="font-display font-semibold text-xl drop-shadow-lg line-clamp-2">{s.title}</h3>
                    {s.state && <p className="text-xs text-white/80 mt-1"><MapPin className="w-3 h-3 inline mr-1" />{s.state}</p>}
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600 line-clamp-2">{s.description}</p>
                  <div className="mt-2 inline-flex items-center text-sm font-semibold group-hover:translate-x-1 transition" style={{ color: BRAND.red }}>{t.stories.readMore}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/impact-stories"><Button variant="outline" className="border-[#151f6d] text-[#151f6d]">{t.stories.viewAll} <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>
      </div>
    </section>
  )
}

function GallerySection({ albums, t }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [lightbox, setLightbox] = useState(null)
  const published = (albums || []).filter(a => a.published !== false)
  const categories = ['all', ...new Set(published.map(a => a.category).filter(Boolean))]
  const filtered = published.filter(a => (filter === 'all' || a.category === filter) && (!q || `${a.title} ${a.description}`.toLowerCase().includes(q.toLowerCase())))
  if (!published.length) return null
  return (
    <section id="gallery" className="section-pad bg-slate-50">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.gallery} title={t.gallery.title} subtitle={t.gallery.subtitle} />
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input placeholder={t.gallery.search} value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
          </div>
          {categories.map(c => (
            <Button key={c} size="sm" variant={filter === c ? 'default' : 'outline'} onClick={() => setFilter(c)} className={filter === c ? '' : ''} style={filter === c ? { background: BRAND.blue } : undefined}>
              {c === 'all' ? t.gallery.all : c}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(a => (
            <button key={a.id} onClick={() => setLightbox(a)} className="group relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition">
              {a.coverImage && <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white text-left">
                <Badge className="text-xs mb-1 border-0" style={{ background: BRAND.red }}>{a.category}</Badge>
                <div className="font-semibold text-sm drop-shadow-md line-clamp-2">{a.title}</div>
                <div className="text-xs text-white/80">{a.images?.length || 0} {t.gallery.photos}</div>
              </div>
            </button>
          ))}
        </div>
        {lightbox && (
          <Dialog open onOpenChange={() => setLightbox(null)}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{lightbox.title}</DialogTitle><DialogDescription>{lightbox.description}</DialogDescription></DialogHeader>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(lightbox.images || []).map((img, i) => <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-lg" />)}
                {!lightbox.images?.length && lightbox.coverImage && <img src={lightbox.coverImage} alt="" className="w-full h-96 object-cover rounded-lg col-span-full" />}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  )
}

function MythsSection({ content, t }) {
  const [flipped, setFlipped] = useState(null)
  return (
    <section id="myths" className="section-pad bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.myths} title={t.myths.title} subtitle={t.myths.subtitle} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(content?.myths || []).map(m => (
            <div key={m.id} onClick={() => setFlipped(flipped === m.id ? null : m.id)} className="cursor-pointer" style={{ perspective: '1000px' }}>
              <div className="relative w-full min-h-[280px] transition-transform duration-700" style={{ transformStyle: 'preserve-3d', transform: flipped === m.id ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                  <Card className="h-full border-2 bg-gradient-to-br from-red-50 to-white shadow-lg hover:shadow-2xl" style={{ borderColor: BRAND.red }}>
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-3"><ShieldAlert className="w-6 h-6" style={{ color: BRAND.red }} /><Badge className="border-0" style={{ background: BRAND.red }}>{t.myths.myth}</Badge></div>
                      <p className="font-display font-semibold text-lg mb-4 flex-1" style={{ color: BRAND.blue }}>&ldquo;{m.myth}&rdquo;</p>
                      <div className="flex items-center text-sm font-semibold" style={{ color: BRAND.red }}>{t.myths.tap} <ChevronRight className="w-4 h-4 ml-1" /></div>
                    </CardContent>
                  </Card>
                </div>
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <Card className="h-full border-2 border-green-600 bg-gradient-to-br from-green-50 to-white shadow-lg">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-6 h-6 text-green-600" /><Badge className="bg-green-600 border-0">{t.myths.fact}</Badge></div>
                      <p className="text-slate-700 leading-relaxed text-sm flex-1">{m.fact}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LeadForm({ open, onOpenChange, resource, lang }) {
  const [form, setForm] = useState({ name: '', phone: '', city: '' })
  const [submitting, setSubmitting] = useState(false)
  const submit = async () => {
    if (!form.name || !form.phone || !form.city) { toast.error('All fields required'); return }
    setSubmitting(true)
    try {
      await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, email: '', resourceId: resource?.id, resourceTitle: resource?.title, language: lang, source: 'resource_download', purpose: 'Resource Download' }) })
      toast.success('Download starting...')
      if (resource?.file && resource.file !== '#') {
        const a = document.createElement('a'); a.href = resource.file; a.download = resource.title; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a)
      }
      onOpenChange(false); setForm({ name: '', phone: '', city: '' })
    } catch { toast.error('Error') }
    setSubmitting(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl" style={{ color: BRAND.blue }}>Download &ldquo;{resource?.title}&rdquo;</DialogTitle>
          <DialogDescription>Quick details — file downloads immediately after submit.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Phone Number *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>City *</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
        </div>
        <Button onClick={submit} disabled={submitting} className="w-full text-white" style={{ background: BRAND.red }}>{submitting ? 'Processing...' : 'Download Now'}</Button>
      </DialogContent>
    </Dialog>
  )
}

function ResourcesSection({ content, lang, t }) {
  const [filter, setFilter] = useState('All')
  const [leadOpen, setLeadOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const categories = useMemo(() => [t.resources.all, ...new Set(content?.resources?.map(r => r.category) || [])], [content, t])
  const filtered = filter === t.resources.all || filter === 'All' ? (content?.resources || []) : (content?.resources || []).filter(r => r.category === filter)
  return (
    <section id="resources" className="section-pad bg-slate-50">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.resources} title={t.resources.title} subtitle={t.resources.subtitle} />
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(c => (
            <Button key={c} variant={filter === c ? 'default' : 'outline'} size="sm" onClick={() => setFilter(c)} style={filter === c ? { background: BRAND.blue } : undefined}>{c}</Button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(r => (
            <Card key={r.id} className="group overflow-hidden hover:shadow-2xl transition hover:-translate-y-1">
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                {r.preview && <img src={r.preview} alt={r.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />}
                <Badge className="absolute top-3 left-3 border-0" style={{ background: BRAND.red }}>{r.category}</Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="font-display font-semibold mb-1" style={{ color: BRAND.blue }}>{r.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{r.desc}</p>
                <Button size="sm" className="w-full text-white" style={{ background: BRAND.blue }} onClick={() => { setSelected(r); setLeadOpen(true) }}>{t.resources.download}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <LeadForm open={leadOpen} onOpenChange={setLeadOpen} resource={selected} lang={lang} t={t} />
    </section>
  )
}

function ContactSection({ content, t }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const submit = async () => {
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { toast.success('Message sent! We will respond within 24 hours.'); setForm({ name: '', email: '', phone: '', message: '' }) }
    } catch { toast.error('Error') }
    setSubmitting(false)
  }
  return (
    <section id="contact" className="section-pad bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader badge={t.badges.contact} title={t.contact.title} subtitle={t.contact.subtitle} />
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.red}1a` }}><Mail className="w-5 h-5" style={{ color: BRAND.red }} /></div>
                <div><div className="font-display font-semibold" style={{ color: BRAND.blue }}>{t.contact.email}</div><div className="text-slate-600">{content?.contact?.email}</div></div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.red}1a` }}><Phone className="w-5 h-5" style={{ color: BRAND.red }} /></div>
                <div><div className="font-display font-semibold" style={{ color: BRAND.blue }}>{t.contact.phone}</div><div className="text-slate-600">{content?.contact?.phone}</div></div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.red}1a` }}><MapPin className="w-5 h-5" style={{ color: BRAND.red }} /></div>
                <div><div className="font-display font-semibold" style={{ color: BRAND.blue }}>{t.contact.office}</div><div className="text-slate-600 text-sm">{content?.contact?.address}</div></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 space-y-4">
              <h3 className="font-display font-semibold text-2xl" style={{ color: BRAND.blue }}>{t.contact.send}</h3>
              <div><Label>{t.contact.name} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>{t.contact.email} *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>{t.contact.phone}</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>{t.contact.message} *</Label><Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} /></div>
              <Button onClick={submit} disabled={submitting} className="w-full text-white" style={{ background: BRAND.blue }}>{submitting ? t.contact.sending : t.contact.sendMessage}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function Footer({ content, t, settings }) {
  const f = content?.footer || {}
  return (
    <footer className="text-white" style={{ background: BRAND.blue }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="font-display font-semibold text-xl mb-2">BSV Campaign</div>
            <div className="text-sm text-white/70 mb-4">{f.tagline || 'Saap Ka Vaar, Aspataal Mein Hi Upchaar'}</div>
            {settings?.branding?.footerLogo && (
              <img
                src={settings.branding.footerLogo}
                alt="BSV Mankind"
                className="bg-white p-2 rounded-lg max-w-[200px]"
              />
            )}
          </div>
          <div>
            <div className="font-display font-semibold mb-3">{t.footer.quickLinks}</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#awareness" className="hover:text-white">{t.nav.awareness}</a></li>
              <li><a href="#access" className="hover:text-white">{t.nav.access}</a></li>
              <li><a href="#communication" className="hover:text-white">{t.nav.communication}</a></li>
              <li><a href="#stories" className="hover:text-white">{t.nav.stories}</a></li>
              <li><a href="#gallery" className="hover:text-white">{t.nav.gallery}</a></li>
              <li><a href="#resources" className="hover:text-white">{t.nav.resources}</a></li>
            </ul>
          </div>
          <div>
            <div className="font-display font-semibold mb-3">{t.footer.contact}</div>
            <ul className="space-y-2 text-sm text-white/80">
              <li>{content?.contact?.email}</li>
              <li>{content?.contact?.phone}</li>
              <li>Mumbai, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-white/60">
          <div>{f.copyright || '© 2025 Bharat Serums and Vaccines Ltd. All rights reserved.'}</div>
          <div><a href="/admin" className="hover:text-white">{t.footer.admin}</a></div>
        </div>
      </div>
    </footer>
  )
}

function App() {
  const [lang, setLang] = useState('en')
  const [content, setContent] = useState(null)
  const [stories, setStories] = useState([])
  const [albums, setAlbums] = useState([])
  const [videos, setVideos] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  // Apply dynamic brand colors from settings.branding.colors
  useEffect(() => {
    const c = settings?.branding?.colors
    if (!c) return
    BRAND = {
      blue: c.primary || DEFAULT_BRAND.blue,
      red: c.accent || DEFAULT_BRAND.red,
      white: c.background || DEFAULT_BRAND.white,
      surface: c.surface || DEFAULT_BRAND.surface,
      heading: c.headingColor || DEFAULT_BRAND.heading,
      text: c.textColor || DEFAULT_BRAND.text,
    }
    // Inject CSS vars for any utility class that relies on them
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.style.setProperty('--brand-primary', BRAND.blue)
      root.style.setProperty('--brand-accent', BRAND.red)
      root.style.setProperty('--brand-bg', BRAND.white)
      root.style.setProperty('--brand-surface', BRAND.surface)
      root.style.setProperty('--brand-heading', BRAND.heading)
      root.style.setProperty('--brand-text', BRAND.text)
    }
  }, [settings])

  const t = getT(lang)

  const resolved = (() => {
    if (!content) return null
    if (lang === 'en' || !content.translations?.[lang]) return content
    // Use translations regardless of approval status (since admin can refresh as needed)
    const trans = content.translations[lang]
    const merge = (base, tv) => {
      if (tv === undefined || tv === null) return base
      if (typeof base === 'string') return typeof tv === 'string' ? tv : base
      if (Array.isArray(base)) return base.map((item, i) => tv[i] !== undefined ? merge(item, tv[i]) : item)
      if (typeof base === 'object' && base !== null) {
        const out = { ...base }
        Object.keys(base).forEach(k => { if (tv[k] !== undefined) out[k] = merge(base[k], tv[k]) })
        return out
      }
      return base
    }
    return merge(content, trans)
  })()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('bsv_lang')
    let next = null
    if (saved && LANGUAGES.find(l => l.code === saved)) next = saved
    else { const browser = navigator.language?.split('-')[0]; if (LANGUAGES.find(l => l.code === browser)) next = browser }
    if (next) setLang(next)
    fetch('/api/content').then(r => r.json()).then(d => { setContent(d); setLoading(false) }).catch(() => setLoading(false))
    fetch('/api/impact-stories').then(r => r.ok ? r.json() : []).then(d => setStories(Array.isArray(d) ? d : [])).catch(() => { })
    fetch('/api/gallery').then(r => r.ok ? r.json() : []).then(d => setAlbums(Array.isArray(d) ? d : [])).catch(() => { })
    fetch('/api/videos').then(r => r.ok ? r.json() : []).then(d => setVideos(Array.isArray(d) ? d : [])).catch(() => { })
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(d => d && setSettings(d)).catch(() => { })
  }, [])

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('bsv_lang', lang) }, [lang])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center" style={{ color: BRAND.blue }}>
        <div className="flex items-center gap-3">
          <img
            src={settings?.branding?.headerLogo}
            alt="BSV"
            className="h-10 sm:h-14 md:h-16 w-auto flex-shrink-0"
          />
        </div>

        <div className="font-display font-semibold text-xl">
          Saap Ka Vaar, Aspataal Mein Hi Upchaar
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header lang={lang} setLang={setLang} t={t} settings={settings} />
      <main>
        <Hero content={resolved} t={t} />
        <VideoSection videos={videos} t={t} />
        <AwarenessSection t={t} />
        <AccessSection t={t} />
        <CommunicationSection t={t} />
        <OutreachSection content={resolved} t={t} />
        <StoriesSection stories={stories} t={t} />
        <GallerySection albums={albums} t={t} />
        <MythsSection content={resolved} t={t} />
        <QuizSection t={t} lang={lang} />
        <ResourcesSection content={resolved} lang={lang} t={t} />
        <ContactSection content={resolved} t={t} />
      </main>
      <Footer content={resolved} t={t} settings={settings} />
    </div>
  )
}

export default App
