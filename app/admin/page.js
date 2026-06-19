'use client'
/* eslint-disable react-hooks/immutability, react-hooks/preserve-manual-memoization, react-hooks/set-state-in-effect */

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Shield, Save, RefreshCw, LogOut, Users, FileText, Award, MessageSquare, BarChart3, Lock, Eye, Download, Trash2, Plus, Image as ImageIcon, Building2, FileImage, Sparkles, Upload, Edit, Heart, Megaphone, UserPlus, Globe, Settings, Layers, Play, BookOpen, CheckCircle2, Clock, Images, X, HelpCircle, Palette } from 'lucide-react'

const LANGS = ['en', 'hi', 'mr', 'kn', 'ta', 'te', 'or', 'pa', 'bn']
const LANG_NAMES = { en: 'English', hi: 'हिन्दी', mr: 'मराठी', kn: 'ಕನ್ನಡ', ta: 'தமிழ்', te: 'తెలుగు', or: 'ଓଡ଼ିଆ', pa: 'ਪੰਜਾਬੀ', bn: 'বাংলা' }

function MediaPicker({ value, onChange, label = 'Image' }) {
  const [open, setOpen] = useState(false)
  const [media, setMedia] = useState([])
  const [uploading, setUploading] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('bsv_token') : null

  const load = async () => {
    const r = await fetch('/api/media', { headers: { Authorization: `Bearer ${token}` } })
    if (r.ok) setMedia(await r.json())
  }

  useEffect(() => { if (open) load() }, [open])

  const upload = async (file) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', file.name)
    fd.append('alt', '')
    fd.append('category', 'general')
    try {
      const r = await fetch('/api/media', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (r.ok) { const data = await r.json(); onChange(data.url); toast.success('Uploaded'); setOpen(false) }
      else toast.error('Upload failed')
    } catch { toast.error('Error') }
    setUploading(false)
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 items-start mt-1">
        {value && (
          <div className="w-16 h-16 rounded border overflow-hidden bg-slate-100 flex items-center justify-center">
            <img
              src={value}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement.innerHTML =
                  '<div style="font-size:11px;color:#64748b;text-align:center;padding:4px;">File</div>'
              }}
            />
          </div>
        )}
        <div className="flex-1 flex gap-2">
          <Input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="URL or pick from library" />
          <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}><ImageIcon className="w-4 h-4" /></Button>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Media Library</DialogTitle></DialogHeader>
          <div className="mb-4 flex gap-2">
            <Input type="file" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} disabled={uploading} accept="image/*,application/pdf,video/*" />
            <Button onClick={load} variant="outline" size="sm"><RefreshCw className="w-4 h-4" /></Button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {media.map(m => (
              <button key={m.id} onClick={() => { onChange(m.url); setOpen(false) }} className="border rounded-lg overflow-hidden hover:ring-2 hover:ring-bsv-red text-left">
                {m.contentType?.startsWith('image/') ? (
                  <img src={m.url} alt={m.alt} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-slate-100 flex items-center justify-center"><FileText className="w-10 h-10 text-slate-400" /></div>
                )}
                <div className="p-2"><div className="text-xs font-medium truncate">{m.title}</div><div className="text-[10px] text-muted-foreground">{(m.size / 1024).toFixed(1)} KB</div></div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MultiMediaPicker({ values = [], onChange, label = 'Gallery Images', max = 30 }) {
  const [open, setOpen] = useState(false)
  const [media, setMedia] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const token = typeof window !== 'undefined' ? localStorage.getItem('bsv_token') : null

  const load = async () => {
    const r = await fetch('/api/media', { headers: { Authorization: `Bearer ${token}` } })
    if (r.ok) setMedia(await r.json())
  }
  useEffect(() => { if (open) load() }, [open])

  const uploadBatch = async (files) => {
    if (!files?.length) return
    setUploading(true)
    setUploadProgress(0)
    const newUrls = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fd = new FormData()
      fd.append('file', file)
      fd.append('title', file.name)
      fd.append('alt', '')
      fd.append('category', 'story-gallery')
      try {
        const r = await fetch('/api/media', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
        if (r.ok) {
          const data = await r.json()
          newUrls.push(data.url)
        }
      } catch (e) { /* ignore single error */ }
      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
    }
    if (newUrls.length) {
      onChange([...(values || []), ...newUrls].slice(0, max))
      toast.success(`Uploaded ${newUrls.length} image${newUrls.length > 1 ? 's' : ''}`)
    }
    setUploading(false)
  }

  const removeAt = (idx) => onChange(values.filter((_, i) => i !== idx))
  const addFromLibrary = (url) => {
    if (!values.includes(url)) onChange([...(values || []), url].slice(0, max))
  }

  return (
    <div>
      <Label>{label} ({values?.length || 0}/{max})</Label>
      <div className="mt-1 space-y-2">
        <div className="flex flex-wrap gap-2">
          {(values || []).map((url, idx) => (
            <div key={idx} className="relative group w-20 h-20 rounded-md overflow-hidden border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeAt(idx)} className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-bl opacity-0 group-hover:opacity-100 transition">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setOpen(true)} className="w-20 h-20 rounded-md border-2 border-dashed border-slate-300 hover:border-bsv-blue text-slate-500 hover:text-bsv-blue flex flex-col items-center justify-center text-xs gap-1">
            <Upload className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Images to Gallery</DialogTitle>
              <DialogDescription>Upload new images or choose from your media library. Multi-select supported.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs uppercase tracking-wider">Upload Multiple</Label>
                <Input type="file" multiple accept="image/*" disabled={uploading} onChange={e => uploadBatch(Array.from(e.target.files || []))} />
                {uploading && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Uploading... {uploadProgress}%</div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-bsv-red transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider">Or pick from library</Label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-2 max-h-96 overflow-y-auto">
                  {media.filter(m => m.contentType?.startsWith('image/')).map(m => {
                    const selected = values.includes(m.url)
                    return (
                      <button key={m.id} type="button" onClick={() => addFromLibrary(m.url)} className={`relative aspect-square rounded-md overflow-hidden border-2 transition ${selected ? 'border-bsv-red ring-2 ring-bsv-red/40' : 'border-transparent hover:border-slate-300'}`}>
                        <img src={m.url} alt={m.alt} className="w-full h-full object-cover" />
                        {selected && <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-bsv-red bg-white rounded-full" />}
                      </button>
                    )
                  })}
                </div>
              </div>
              <Button onClick={() => setOpen(false)} className="w-full" style={{ background: '#151f6d' }}>Done</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}


function AITranslateButton({ text, onResult }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState({})
  const [translations, setTranslations] = useState({})
  const token = typeof window !== 'undefined' ? localStorage.getItem('bsv_token') : null
  const translate = async (lang) => {
    setLoading(s => ({ ...s, [lang]: true }))
    try {
      const r = await fetch('/api/ai/translate', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ text, targetLang: lang }) })
      const data = await r.json()
      if (r.ok) setTranslations(s => ({ ...s, [lang]: data.translated }))
      else toast.error('Translation failed: ' + data.error)
    } catch { toast.error('Translation error') }
    setLoading(s => ({ ...s, [lang]: false }))
  }
  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}><Sparkles className="w-3 h-3 mr-1" />AI Translate</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>AI Translation to 9 Languages</DialogTitle></DialogHeader>
          <div className="text-sm bg-slate-50 p-3 rounded mb-2"><b>Source (English):</b> {text}</div>
          <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
            {LANGS.filter(l => l !== 'en').map(l => (
              <div key={l} className="border rounded p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{LANG_NAMES[l]}</span>
                  <Button size="sm" variant="ghost" onClick={() => translate(l)} disabled={loading[l]}>
                    {loading[l] ? '...' : <Sparkles className="w-3 h-3" />}
                  </Button>
                </div>
                {translations[l] && <p className="text-sm">{translations[l]}</p>}
              </div>
            ))}
          </div>
          <Button onClick={() => { onResult?.(translations); setOpen(false) }} className="bg-bsv-red">Apply Translations</Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [content, setContent] = useState(null)
  const [leads, setLeads] = useState([])
  const [quiz, setQuiz] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [media, setMedia] = useState([])
  const [stories, setStories] = useState([])
  const [ngos, setNgos] = useState([])
  const [reports, setReports] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [users, setUsers] = useState([])
  const [contacts, setContacts] = useState([])
  const [partnerships, setPartnerships] = useState([])
  const [gallery, setGallery] = useState([])
  const [videos, setVideos] = useState([])
  const [quizQuestions, setQuizQuestions] = useState([])
  const [token, setToken] = useState(null)
  const [settingsData, setSettingsData] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('bsv_token')
    const u = localStorage.getItem('bsv_user')
    if (t && u) {
      setToken(t)
      try { setUser(JSON.parse(u)); loadAll(t) } catch (e) { void e }
    }
  }, [])

  const login = async () => {
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) })
      const data = await r.json()
      if (r.ok) {
        setToken(data.token); setUser(data.user)
        localStorage.setItem('bsv_token', data.token); localStorage.setItem('bsv_user', JSON.stringify(data.user))
        loadAll(data.token)
        toast.success('Logged in')
      } else toast.error(data.error || 'Login failed')
    } catch { toast.error('Network error') }
  }

  const loadAll = async (t) => {
    const h = { Authorization: `Bearer ${t}` }
    const fetchOr = async (url, def = []) => { try { const r = await fetch(url, { headers: h }); return r.ok ? await r.json() : def } catch { return def } }
    const [c, l, q, a, m, s, n, r, v, us, ct, pt, gal, vid, quizQs, setg] = await Promise.all([
      fetchOr('/api/content', {}),
      fetchOr('/api/leads'),
      fetchOr('/api/quiz/results'),
      fetchOr('/api/analytics', {}),
      fetchOr('/api/media'),
      fetchOr('/api/impact-stories?all=true'),
      fetchOr('/api/ngos'),
      fetchOr('/api/reports'),
      fetchOr('/api/volunteers'),
      fetchOr('/api/users'),
      fetchOr('/api/contact'),
      fetchOr('/api/partnership'),
      fetchOr('/api/gallery'),
      fetchOr('/api/videos'),
      fetchOr('/api/quiz/questions'),
      fetchOr('/api/settings', {}),
    ])
    setContent(c); setLeads(l); setQuiz(q); setAnalytics(a); setMedia(m); setStories(s); setNgos(n); setReports(r); setVolunteers(v); setUsers(us); setContacts(ct); setPartnerships(pt); setGallery(Array.isArray(gal) ? gal : []); setVideos(Array.isArray(vid) ? vid : []); setQuizQuestions(Array.isArray(quizQs) ? quizQs : [])
    setSettingsData(setg)
  }

  const logout = () => { localStorage.removeItem('bsv_token'); localStorage.removeItem('bsv_user'); setUser(null); setToken(null) }

  const api = async (url, method = 'GET', body) => {
    const h = { Authorization: `Bearer ${token}` }
    const opts = { method, headers: h }
    if (body && !(body instanceof FormData)) { h['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body) }
    else if (body) opts.body = body
    return fetch(url, opts)
  }

  const saveContent = async () => {
    const r = await api('/api/content', 'PUT', content)
    if (r.ok) toast.success('Content saved!'); else toast.error('Save failed')
  }

  const resetContent = async () => {
    if (!confirm('Reset all content to defaults?')) return
    const r = await api('/api/content/reset', 'POST')
    if (r.ok) { const d = await r.json(); setContent(d.data); toast.success('Reset complete') }
  }

  const exportCSV = (data, name) => {
    if (!data?.length) { toast.error('No data'); return }
    const keys = Object.keys(data[0])
    const rows = [keys.join(','), ...data.map(d => keys.map(k => JSON.stringify(d[k] ?? '')).join(','))]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${name}_${Date.now()}.csv`; a.click()
  }

  // ----- LOGIN VIEW -----
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bsv-blue to-[#1e2a8a] p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-bsv-red flex items-center justify-center mb-3"><Lock className="w-8 h-8 text-white" /></div>
              <h1 className="font-display font-extrabold text-2xl text-bsv-blue">BSV Admin CMS</h1>
              <p className="text-sm text-muted-foreground">Role-based content management</p>
            </div>
            <div className="space-y-3">
              <div><Label>Email</Label><Input type="email" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="admin@bsv.com" /></div>
              <div><Label>Password</Label><Input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && login()} /></div>
              <Button onClick={login} className="w-full bg-bsv-blue hover:bg-bsv-blue/90">Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-bsv-blue text-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <img
              src={settingsData?.branding?.headerLogo}
              alt="BSV Mankind"
              className="h-12 sm:h-20 w-auto bg-white rounded-lg px-3 py-2"
            />
            <div>
              <div className="font-display font-extrabold text-sm sm:text-base">
                BSV Admin CMS
              </div>
              <div className="text-xs text-white/70">
                <span className="hidden sm:inline">
                  {user.name} • {user.role.replace('_', ' ')}
                </span>

                <span className="sm:hidden">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => loadAll(token)}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={logout}><LogOut className="w-4 h-4 mr-1" />Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="flex flex-wrap h-auto justify-start mb-4 bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="content"><FileText className="w-4 h-4 mr-1" />Sections</TabsTrigger>
            <TabsTrigger value="media"><ImageIcon className="w-4 h-4 mr-1" />Media</TabsTrigger>
            {/*<TabsTrigger value="stories"><Heart className="w-4 h-4 mr-1" />Stories</TabsTrigger> */}
            <TabsTrigger value="ngos"><Building2 className="w-4 h-4 mr-1" />NGOs</TabsTrigger>
            {/*<TabsTrigger value="gallery"><Images className="w-4 h-4 mr-1" />Gallery</TabsTrigger>*/}
            <TabsTrigger value="videos"><Play className="w-4 h-4 mr-1" />Videos</TabsTrigger>
            <TabsTrigger value="reports"><FileImage className="w-4 h-4 mr-1" />Reports</TabsTrigger>
            <TabsTrigger value="leads"><Users className="w-4 h-4 mr-1" />Leads</TabsTrigger>
            {/*<TabsTrigger value="quiz"><Award className="w-4 h-4 mr-1" />Quiz Results</TabsTrigger>
            <TabsTrigger value="quizq"><HelpCircle className="w-4 h-4 mr-1" />Quiz Q&amp;A</TabsTrigger>*/}
            <TabsTrigger value="contacts"><MessageSquare className="w-4 h-4 mr-1" />Contacts</TabsTrigger>
            <TabsTrigger value="partnerships"><Megaphone className="w-4 h-4 mr-1" />Partners</TabsTrigger>
            <TabsTrigger value="volunteers"><UserPlus className="w-4 h-4 mr-1" />Volunteers</TabsTrigger>
            <TabsTrigger value="footer"><Layers className="w-4 h-4 mr-1" />Footer</TabsTrigger>
            <TabsTrigger value="users"><Settings className="w-4 h-4 mr-1" />Users</TabsTrigger>
            <TabsTrigger value="translations"><Globe className="w-4 h-4 mr-1" />Translations</TabsTrigger>
            <TabsTrigger value="dictionary"><BookOpen className="w-4 h-4 mr-1" />Dictionary</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1" />Settings</TabsTrigger>
          </TabsList>

          {/* DASHBOARD */}
          <TabsContent value="dashboard">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Leads', value: analytics?.totals?.leads || 0, icon: Users, color: 'bg-blue-500' },
                { label: 'Quiz', value: analytics?.totals?.quiz || 0, icon: Award, color: 'bg-red-500' },
                { label: 'Contacts', value: analytics?.totals?.contacts || 0, icon: MessageSquare, color: 'bg-green-500' },
                { label: 'Partnerships', value: analytics?.totals?.partnerships || 0, icon: Shield, color: 'bg-purple-500' },
                { label: 'Volunteers', value: analytics?.totals?.volunteers || 0, icon: UserPlus, color: 'bg-orange-500' },
                { label: 'Media Files', value: analytics?.totals?.media || 0, icon: ImageIcon, color: 'bg-pink-500' },
                { label: 'Impact Stories', value: analytics?.totals?.impactStories || 0, icon: Heart, color: 'bg-rose-500' },
                { label: 'Languages', value: 9, icon: Globe, color: 'bg-cyan-500' },
              ].map((s, i) => {
                const Icon = s.icon
                return <Card key={i}><CardContent className="p-4"><div className={`w-10 h-10 rounded ${s.color} flex items-center justify-center mb-2`}><Icon className="w-5 h-5 text-white" /></div><div className="text-2xl font-display font-extrabold text-bsv-blue">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></CardContent></Card>
              })}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Card><CardContent className="p-5"><h3 className="font-display font-bold mb-3">Leads by State</h3>{analytics?.byState?.slice(0, 10).map(s => <div key={s._id} className="flex justify-between py-1 border-b last:border-0 text-sm"><span>{s._id || 'Unknown'}</span><Badge variant="outline">{s.count}</Badge></div>)}{!analytics?.byState?.length && <p className="text-sm text-muted-foreground">No data</p>}</CardContent></Card>
              <Card><CardContent className="p-5"><h3 className="font-display font-bold mb-3">Leads by Purpose</h3>{analytics?.byPurpose?.map(s => <div key={s._id} className="flex justify-between py-1 border-b last:border-0 text-sm"><span>{s._id || 'Unknown'}</span><Badge variant="outline">{s.count}</Badge></div>)}{!analytics?.byPurpose?.length && <p className="text-sm text-muted-foreground">No data</p>}</CardContent></Card>
              <Card><CardContent className="p-5"><h3 className="font-display font-bold mb-3">Myth Heatmap (Quiz)</h3>{analytics?.mythHeatmap?.slice(0, 5).map(s => <div key={s._id} className="py-1 border-b last:border-0"><div className="flex justify-between text-sm"><span className="font-medium">{s._id || '?'}</span><Badge>{s.count}</Badge></div></div>)}{!analytics?.mythHeatmap?.length && <p className="text-sm text-muted-foreground">No data</p>}</CardContent></Card>
            </div>
          </TabsContent>

          {/* SECTIONS / CONTENT */}
          <TabsContent value="content">
            {content && (
              <div className="space-y-4">
                <div className="flex justify-between sticky top-16 bg-slate-50 py-2 z-20">
                  <h2 className="font-display font-extrabold text-2xl text-bsv-blue">Every Section is Editable</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={async () => {
                      if (!confirm('This will use AI to translate ALL content to all 8 Indian languages. May take 1-2 minutes. Continue?')) return
                      toast.info('Translating to 8 languages... please wait')
                      try {
                        const r = await api('/api/ai/translate-all', 'POST', { content, targetLangs: ['hi', 'mr', 'kn', 'ta', 'te', 'or', 'pa', 'bn'] })
                        if (r.ok) { const d = await r.json(); setContent(d.content); toast.success(`Translated! ${Object.entries(d.results).map(([k, v]) => `${k}:${v}`).join(', ')}`) }
                        else toast.error('Translation failed')
                      } catch { toast.error('Network error') }
                    }} className="bg-purple-600 text-white hover:bg-purple-700"><Sparkles className="w-4 h-4 mr-1" />AI Translate All Content</Button>
                    <Button variant="outline" onClick={resetContent}><RefreshCw className="w-4 h-4 mr-1" />Reset</Button>
                    <Button onClick={saveContent} className="bg-bsv-red"><Save className="w-4 h-4 mr-1" />Save All</Button>
                  </div>
                </div>

                {/* SECTION VISIBILITY */}
                <Card><CardContent className="p-5">
                  <h3 className="font-display font-bold text-lg text-bsv-blue mb-3">Section Visibility & Order</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    {Object.entries(content.sections || {}).sort((a, b) => a[1].order - b[1].order).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between border rounded p-3">
                        <div><div className="font-medium capitalize">{key}</div><div className="text-xs text-muted-foreground">Order: {val.order}</div></div>
                        <Switch checked={val.enabled} onCheckedChange={c => setContent({ ...content, sections: { ...content.sections, [key]: { ...val, enabled: c } } })} />
                      </div>
                    ))}
                  </div>
                </CardContent></Card>

                {/* HERO */}
                <Card><CardContent className="p-5 space-y-3">
                  <h3 className="font-display font-bold text-lg text-bsv-blue">Hero Section</h3>
                  <MediaPicker label="Hero Background Image" value={content.hero.image} onChange={v => setContent({ ...content, hero: { ...content.hero, image: v } })} />
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Left Top Text</Label>
                      <Input
                        value={content.hero.leftTop || ''}
                        onChange={e => setContent({ ...content, hero: { ...content.hero, leftTop: e.target.value } })}
                        placeholder="INDIA LOSES"
                      />
                    </div>

                    <div>
                      <Label>Big Number</Label>
                      <Input
                        value={content.hero.bigNumber || ''}
                        onChange={e => setContent({ ...content, hero: { ...content.hero, bigNumber: e.target.value } })}
                        placeholder="50,000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Left Bottom Text</Label>
                    <Textarea
                      value={content.hero.leftBottom || ''}
                      onChange={e => setContent({ ...content, hero: { ...content.hero, leftBottom: e.target.value } })}
                      placeholder="LIVES TO SNAKE&#10;BITES EVERY YEAR"
                    />
                  </div>

                  <div>
                    <Label>Right Main Text</Label>
                    <Input
                      value={content.hero.rightMain || ''}
                      onChange={e => setContent({ ...content, hero: { ...content.hero, rightMain: e.target.value } })}
                      placeholder="SAANP KA VAAR,"
                    />
                  </div>

                  <div>
                    <Label>Right Sub Text</Label>
                    <Input
                      value={content.hero.rightSub || ''}
                      onChange={e => setContent({ ...content, hero: { ...content.hero, rightSub: e.target.value } })}
                      placeholder="ASPATAAL MEIN HI UPCHAAR!"
                    />
                  </div>

                  <div>
                    <Label>Tagline</Label>
                    <Input
                      value={content.hero.tagline || ''}
                      onChange={e => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })}
                      placeholder="Snake bite? Only hospital can treat it right."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3"><div><Label>Primary CTA</Label><Input value={content.hero.cta1} onChange={e => setContent({ ...content, hero: { ...content.hero, cta1: e.target.value } })} /></div><div><Label>Secondary CTA</Label><Input value={content.hero.cta2} onChange={e => setContent({ ...content, hero: { ...content.hero, cta2: e.target.value } })} /></div></div>
                </CardContent></Card>

                {/* IMPACT STATS */}
                <Card><CardContent className="p-5">
                  <h3 className="font-display font-bold text-lg text-bsv-blue mb-3">Impact Statistics (8)</h3>
                  <div className="grid md:grid-cols-2 gap-3">{content.impactStats.map((s, i) => (
                    <div key={s.id} className="border rounded p-3 space-y-1">
                      <Input value={s.label} onChange={e => { const a = [...content.impactStats]; a[i] = { ...a[i], label: e.target.value }; setContent({ ...content, impactStats: a }) }} />
                      <div className="grid grid-cols-3 gap-2">
                        <Input type="number" value={s.value} onChange={e => { const a = [...content.impactStats]; a[i] = { ...a[i], value: parseInt(e.target.value) || 0 }; setContent({ ...content, impactStats: a }) }} />
                        <Input value={s.suffix} placeholder="+" onChange={e => { const a = [...content.impactStats]; a[i] = { ...a[i], suffix: e.target.value }; setContent({ ...content, impactStats: a }) }} />
                        <Input value={s.icon} placeholder="Icon" onChange={e => { const a = [...content.impactStats]; a[i] = { ...a[i], icon: e.target.value }; setContent({ ...content, impactStats: a }) }} />
                      </div>
                    </div>))}</div>
                </CardContent></Card>

                {/* STATES */}
                <Card><CardContent className="p-5">
                  <h3 className="font-display font-bold text-lg text-bsv-blue mb-3">7 Target States</h3>
                  <div className="grid md:grid-cols-2 gap-3">{content.states.map((s, i) => (
                    <div key={s.code} className="border rounded p-3">
                      <div className="font-bold mb-2">{s.name}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input type="number" placeholder="Lives" value={s.lives} onChange={e => { const a = [...content.states]; a[i] = { ...a[i], lives: parseInt(e.target.value) || 0 }; setContent({ ...content, states: a }) }} />
                        <Input type="number" placeholder="Villages" value={s.villages} onChange={e => { const a = [...content.states]; a[i] = { ...a[i], villages: parseInt(e.target.value) || 0 }; setContent({ ...content, states: a }) }} />
                        <Input type="number" placeholder="Sessions" value={s.sessions} onChange={e => { const a = [...content.states]; a[i] = { ...a[i], sessions: parseInt(e.target.value) || 0 }; setContent({ ...content, states: a }) }} />
                      </div>
                    </div>))}</div>
                </CardContent></Card>

                {/* ABOUT */}
                <Card><CardContent className="p-5 space-y-3">
                  <h3 className="font-display font-bold text-lg text-bsv-blue">About Campaign</h3>
                  <div><Label>Story</Label><Textarea rows={4} value={content.about.story} onChange={e => setContent({ ...content, about: { ...content.about, story: e.target.value } })} /></div>
                  <div><Label>Mission</Label><Textarea rows={2} value={content.about.mission} onChange={e => setContent({ ...content, about: { ...content.about, mission: e.target.value } })} /></div>
                  <div><Label>Vision</Label><Textarea rows={2} value={content.about.vision} onChange={e => setContent({ ...content, about: { ...content.about, vision: e.target.value } })} /></div>
                  <div><Label>Burden</Label><Input value={content.about.burden} onChange={e => setContent({ ...content, about: { ...content.about, burden: e.target.value } })} /></div>
                </CardContent></Card>

                {/* EMERGENCY */}
                <Card><CardContent className="p-5">
                  <h3 className="font-display font-bold text-lg text-bsv-blue mb-3">Emergency Guide</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-bold mb-2 text-green-700">DO&apos;S</div>
                      {content.emergencyDos.map((item, i) => (
                        <div key={i} className="border rounded p-2 mb-2 space-y-1">
                          <Input value={item.title} onChange={e => { const a = [...content.emergencyDos]; a[i] = { ...a[i], title: e.target.value }; setContent({ ...content, emergencyDos: a }) }} />
                          <Textarea rows={2} value={item.desc} onChange={e => { const a = [...content.emergencyDos]; a[i] = { ...a[i], desc: e.target.value }; setContent({ ...content, emergencyDos: a }) }} />
                        </div>))}
                      <Button size="sm" variant="outline" onClick={() => setContent({ ...content, emergencyDos: [...content.emergencyDos, { title: 'New', desc: '' }] })}><Plus className="w-3 h-3 mr-1" />Add</Button>
                    </div>
                    <div>
                      <div className="font-bold mb-2 text-bsv-red">DON&apos;TS</div>
                      {content.emergencyDonts.map((item, i) => (
                        <div key={i} className="border rounded p-2 mb-2 space-y-1">
                          <Input value={item.title} onChange={e => { const a = [...content.emergencyDonts]; a[i] = { ...a[i], title: e.target.value }; setContent({ ...content, emergencyDonts: a }) }} />
                          <Textarea rows={2} value={item.desc} onChange={e => { const a = [...content.emergencyDonts]; a[i] = { ...a[i], desc: e.target.value }; setContent({ ...content, emergencyDonts: a }) }} />
                        </div>))}
                      <Button size="sm" variant="outline" onClick={() => setContent({ ...content, emergencyDonts: [...content.emergencyDonts, { title: 'New', desc: '' }] })}><Plus className="w-3 h-3 mr-1" />Add</Button>
                    </div>
                  </div>
                </CardContent></Card>

                {/* MYTHS */}
                <Card><CardContent className="p-5">
                  <div className="flex justify-between mb-3"><h3 className="font-display font-bold text-lg text-bsv-blue">Myths vs Facts</h3><Button size="sm" variant="outline" onClick={() => setContent({ ...content, myths: [...content.myths, { id: Date.now(), myth: '', fact: '' }] })}><Plus className="w-3 h-3 mr-1" />Add</Button></div>
                  {content.myths.map((m, i) => (
                    <div key={m.id} className="border rounded p-3 mb-2 space-y-2">
                      <div className="flex justify-between"><Badge className="bg-bsv-red">Myth #{i + 1}</Badge><Button size="sm" variant="ghost" onClick={() => setContent({ ...content, myths: content.myths.filter((_, idx) => idx !== i) })}><Trash2 className="w-3 h-3 text-red-500" /></Button></div>
                      <Input value={m.myth} placeholder="Myth statement" onChange={e => { const a = [...content.myths]; a[i] = { ...a[i], myth: e.target.value }; setContent({ ...content, myths: a }) }} />
                      <Textarea value={m.fact} placeholder="Scientific fact" onChange={e => { const a = [...content.myths]; a[i] = { ...a[i], fact: e.target.value }; setContent({ ...content, myths: a }) }} />
                    </div>))}
                </CardContent></Card>

                {/* RESOURCES */}
                <Card><CardContent className="p-5">
                  <div className="flex justify-between mb-3"><h3 className="font-display font-bold text-lg text-bsv-blue">Resources</h3><Button size="sm" variant="outline" onClick={() => setContent({ ...content, resources: [...content.resources, { id: `r${Date.now()}`, title: 'New', category: 'Posters', desc: '', preview: '', file: '#' }] })}><Plus className="w-3 h-3 mr-1" />Add</Button></div>
                  {content.resources.map((r, i) => (
                    <div key={r.id} className="border rounded p-3 mb-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={r.title} placeholder="Title" onChange={e => { const a = [...content.resources]; a[i] = { ...a[i], title: e.target.value }; setContent({ ...content, resources: a }) }} />
                        <Input value={r.category} placeholder="Category" onChange={e => { const a = [...content.resources]; a[i] = { ...a[i], category: e.target.value }; setContent({ ...content, resources: a }) }} />
                      </div>
                      <MediaPicker label="Preview" value={r.preview} onChange={v => { const a = [...content.resources]; a[i] = { ...a[i], preview: v }; setContent({ ...content, resources: a }) }} />
                      <MediaPicker
                        label="Upload File / PDF"
                        value={r.file}
                        onChange={v => {
                          const a = [...content.resources]
                          a[i] = { ...a[i], file: v }
                          setContent({ ...content, resources: a })
                        }}
                      />
                      <Textarea rows={2} value={r.desc} placeholder="Description" onChange={e => { const a = [...content.resources]; a[i] = { ...a[i], desc: e.target.value }; setContent({ ...content, resources: a }) }} />
                      <Button size="sm" variant="ghost" onClick={() => setContent({ ...content, resources: content.resources.filter((_, idx) => idx !== i) })}><Trash2 className="w-3 h-3 text-red-500" />Remove</Button>
                    </div>))}
                </CardContent></Card>

                {/* CONTACT */}
                <Card><CardContent className="p-5 space-y-3">
                  <h3 className="font-display font-bold text-lg text-bsv-blue">Contact Info</h3>
                  <div><Label>Email</Label><Input value={content.contact.email} onChange={e => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })} /></div>
                  <div><Label>Phone</Label><Input value={content.contact.phone} onChange={e => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })} /></div>
                  <div><Label>Address</Label><Textarea value={content.contact.address} onChange={e => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })} /></div>
                </CardContent></Card>
              </div>
            )}
          </TabsContent>

          {/* MEDIA LIBRARY */}
          <TabsContent value="media">
            <MediaLibraryView media={media} token={token} reload={() => loadAll(token)} />
          </TabsContent>

          {/* IMPACT STORIES */}
          <TabsContent value="stories">
            <ImpactStoriesView stories={stories} api={api} reload={() => loadAll(token)} />
          </TabsContent>

          {/* NGOS */}
          <TabsContent value="ngos">
            <NgosView ngos={ngos} api={api} reload={() => loadAll(token)} />
          </TabsContent>

          {/* REPORTS */}
          <TabsContent value="reports">
            <ReportsView reports={reports} api={api} reload={() => loadAll(token)} />
          </TabsContent>

          {/* VIDEOS */}
          <TabsContent value="videos">
            <VideosView api={api} token={token} reload={() => loadAll(token)} />
          </TabsContent>

          {/* GALLERY */}
          <TabsContent value="gallery">
            <GalleryView items={gallery} api={api} reload={() => loadAll(token)} />
          </TabsContent>

          {/* LEADS / QUIZ / CONTACT / PARTNERSHIPS / VOLUNTEERS */}
          <TabsContent value="leads"><TableTab data={leads} title="Leads" exportName="leads" exportCSV={exportCSV} cols={['name', 'email', 'phone', 'state', 'purpose', 'score', 'createdAt']} /></TabsContent>
          <TabsContent value="quiz"><TableTab data={quiz} title="Quiz Submissions" exportName="quiz" exportCSV={exportCSV} cols={['name', 'state', 'occupation', 'score', 'total', 'commonMyth', 'createdAt']} /></TabsContent>
          <TabsContent value="quizq"><QuizQuestionsView items={quizQuestions} api={api} reload={() => loadAll(token)} /></TabsContent>
          <TabsContent value="contacts"><TableTab data={contacts} title="Contact Messages" exportName="contacts" exportCSV={exportCSV} cols={['name', 'email', 'phone', 'message', 'createdAt']} /></TabsContent>
          <TabsContent value="partnerships"><TableTab data={partnerships} title="Partnership Inquiries" exportName="partnerships" exportCSV={exportCSV} cols={['organization', 'type', 'name', 'email', 'phone', 'state', 'status', 'createdAt']} /></TabsContent>
          <TabsContent value="volunteers"><TableTab data={volunteers} title="Volunteer Registrations" exportName="volunteers" exportCSV={exportCSV} cols={['name', 'email', 'phone', 'state', 'city', 'occupation', 'status', 'createdAt']} /></TabsContent>

          {/* FOOTER */}
          <TabsContent value="footer">
            {content && content.footer && (
              <div className="space-y-3">
                <div className="flex justify-end"><Button onClick={saveContent} className="bg-bsv-red"><Save className="w-4 h-4 mr-1" />Save</Button></div>
                <Card><CardContent className="p-5 space-y-3">
                  <h3 className="font-display font-bold text-lg text-bsv-blue">Footer Branding</h3>
                  <div><Label>Tagline</Label><Input value={content.footer.tagline} onChange={e => setContent({ ...content, footer: { ...content.footer, tagline: e.target.value } })} /></div>
                  <div><Label>Description</Label><Textarea value={content.footer.description} onChange={e => setContent({ ...content, footer: { ...content.footer, description: e.target.value } })} /></div>
                  <div><Label>Copyright</Label><Input value={content.footer.copyright} onChange={e => setContent({ ...content, footer: { ...content.footer, copyright: e.target.value } })} /></div>
                </CardContent></Card>
                <Card><CardContent className="p-5">
                  <h3 className="font-display font-bold text-lg text-bsv-blue mb-3">Footer Columns</h3>
                  {content.footer.columns?.map((col, i) => (
                    <div key={i} className="border rounded p-3 mb-3">
                      <Input value={col.title} className="font-bold mb-2" onChange={e => { const a = [...content.footer.columns]; a[i] = { ...a[i], title: e.target.value }; setContent({ ...content, footer: { ...content.footer, columns: a } }) }} />
                      {col.links?.map((lnk, j) => (
                        <div key={j} className="flex gap-2 mb-1">
                          <Input value={lnk.label} placeholder="Label" onChange={e => { const a = [...content.footer.columns]; a[i].links[j] = { ...lnk, label: e.target.value }; setContent({ ...content, footer: { ...content.footer, columns: a } }) }} />
                          <Input value={lnk.url} placeholder="URL" onChange={e => { const a = [...content.footer.columns]; a[i].links[j] = { ...lnk, url: e.target.value }; setContent({ ...content, footer: { ...content.footer, columns: a } }) }} />
                          <Button size="sm" variant="ghost" onClick={() => { const a = [...content.footer.columns]; a[i].links = a[i].links.filter((_, k) => k !== j); setContent({ ...content, footer: { ...content.footer, columns: a } }) }}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => { const a = [...content.footer.columns]; a[i].links = [...(a[i].links || []), { label: 'New', url: '#' }]; setContent({ ...content, footer: { ...content.footer, columns: a } }) }}><Plus className="w-3 h-3 mr-1" />Add Link</Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => setContent({ ...content, footer: { ...content.footer, columns: [...(content.footer.columns || []), { title: 'New', links: [] }] } })}><Plus className="w-3 h-3 mr-1" />Add Column</Button>
                </CardContent></Card>
                <Card><CardContent className="p-5 space-y-3">
                  <h3 className="font-display font-bold text-lg text-bsv-blue">Social Links</h3>
                  {Object.keys(content.footer.social || {}).map(k => (
                    <div key={k}><Label className="capitalize">{k}</Label><Input value={content.footer.social[k]} onChange={e => setContent({ ...content, footer: { ...content.footer, social: { ...content.footer.social, [k]: e.target.value } } })} /></div>
                  ))}
                </CardContent></Card>
              </div>
            )}
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <UsersView users={users} api={api} reload={() => loadAll(token)} />
          </TabsContent>

          {/* TRANSLATIONS REVIEW */}
          <TabsContent value="translations">
            <TranslationsView api={api} content={content} setContent={setContent} />
          </TabsContent>

          {/* DICTIONARY */}
          <TabsContent value="dictionary">
            <DictionaryView api={api} />
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings">
            <SettingsView api={api} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function TableTab({ data, title, exportName, exportCSV, cols }) {
  return (
    <Card><CardContent className="p-5">
      <div className="flex justify-between mb-3">
        <h3 className="font-display font-bold text-lg">{title} ({data.length})</h3>
        <Button size="sm" onClick={() => exportCSV(data, exportName)}><Download className="w-4 h-4 mr-1" />Export CSV</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left">{cols.map(c => <th key={c} className="p-2 capitalize">{c}</th>)}</tr></thead>
          <tbody>{data.map(d => (
            <tr key={d.id} className="border-b hover:bg-slate-50">
              {cols.map(c => <td key={c} className="p-2 max-w-xs truncate">{c === 'createdAt' ? new Date(d[c]).toLocaleDateString() : (typeof d[c] === 'object' ? JSON.stringify(d[c]) : String(d[c] ?? ''))}</td>)}
            </tr>))}</tbody>
        </table>
        {!data.length && <p className="text-center text-muted-foreground py-8">No data yet</p>}
      </div>
    </CardContent></Card>
  )
}

function MediaLibraryView({ media, token, reload }) {
  const [uploading, setUploading] = useState(false)
  const upload = async (file) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file); fd.append('title', file.name); fd.append('category', 'general')
    const r = await fetch('/api/media', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    if (r.ok) { toast.success('Uploaded'); reload() } else toast.error('Upload failed')
    setUploading(false)
  }
  const del = async (id) => {
    if (!confirm('Delete?')) return
    await fetch(`/api/media/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    reload()
  }
  return (
    <Card><CardContent className="p-5">
      <div className="flex justify-between mb-4">
        <h3 className="font-display font-bold text-lg">Media Library ({media.length})</h3>
        <div className="flex gap-2"><Input type="file" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} disabled={uploading} accept="image/*,application/pdf,video/*" className="max-w-xs" /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">{media.map(m => (
        <div key={m.id} className="border rounded-lg overflow-hidden group relative">
          {m.contentType?.startsWith('image/') ? <img src={m.url} alt={m.alt} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-slate-100 flex items-center justify-center"><FileText className="w-10 h-10 text-slate-400" /></div>}
          <div className="p-2">
            <div className="text-xs font-medium truncate">{m.title}</div>
            <div className="text-[10px] text-muted-foreground">{(m.size / 1024).toFixed(1)} KB</div>
            <div className="flex gap-1 mt-1">
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(m.url); toast.success('URL copied') }}>Copy</Button>
              <Button size="sm" variant="ghost" onClick={() => del(m.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
            </div>
          </div>
        </div>))}</div>
      {!media.length && <p className="text-center text-muted-foreground py-8">No media uploaded yet</p>}
    </CardContent></Card>
  )
}

function ImpactStoriesView({ stories, api, reload }) {
  const [editing, setEditing] = useState(null)
  const save = async () => {
    if (!editing) return
    const method = editing.id ? 'PATCH' : 'POST'
    const url = editing.id ? `/api/impact-stories/${editing.id}` : '/api/impact-stories'
    const r = await api(url, method, editing)
    if (r.ok) { toast.success('Saved'); setEditing(null); reload() }
  }
  const del = async (id) => {
    if (!confirm('Delete?')) return
    await api(`/api/impact-stories/${id}`, 'DELETE'); reload()
  }
  return (
    <div className="space-y-3">
      <div className="flex justify-between"><h3 className="font-display font-bold text-lg">Impact Stories ({stories.length})</h3><Button onClick={() => setEditing({ title: '', description: '', category: 'General', state: '', beneficiary: '', ngo: '', published: false })} className="bg-bsv-red"><Plus className="w-4 h-4 mr-1" />New Story</Button></div>
      <div className="grid md:grid-cols-2 gap-3">{stories.map(s => (
        <Card key={s.id}><CardContent className="p-4">
          {s.heroImage && <img src={s.heroImage} alt="" className="w-full h-32 object-cover rounded mb-2" />}
          <div className="flex justify-between mb-1"><Badge>{s.category}</Badge>{s.published ? <Badge className="bg-green-500">Published</Badge> : <Badge variant="outline">Draft</Badge>}</div>
          <div className="font-bold">{s.title}</div>
          <div className="text-xs text-muted-foreground line-clamp-2">{s.description}</div>
          <div className="text-xs mt-1">{s.state} • {s.ngo}</div>
          <div className="flex gap-1 mt-2"><Button size="sm" variant="outline" onClick={() => setEditing(s)}><Edit className="w-3 h-3" /></Button><Button size="sm" variant="ghost" onClick={() => del(s.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button></div>
        </CardContent></Card>))}</div>
      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? 'Edit' : 'New'} Impact Story</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea rows={4} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Category</Label><Input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} /></div>
                <div><Label>State</Label><Input value={editing.state} onChange={e => setEditing({ ...editing, state: e.target.value })} /></div>
                <div><Label>Beneficiary</Label><Input value={editing.beneficiary} onChange={e => setEditing({ ...editing, beneficiary: e.target.value })} /></div>
                <div><Label>NGO</Label><Input value={editing.ngo} onChange={e => setEditing({ ...editing, ngo: e.target.value })} /></div>
              </div>
              <MediaPicker label="Hero Image" value={editing.heroImage} onChange={v => setEditing({ ...editing, heroImage: v })} />
              <MediaPicker label="Before Image" value={editing.beforeImage} onChange={v => setEditing({ ...editing, beforeImage: v })} />
              <MediaPicker label="After Image" value={editing.afterImage} onChange={v => setEditing({ ...editing, afterImage: v })} />
              <MultiMediaPicker label="Story Gallery (multiple images)" values={editing.gallery || []} onChange={v => setEditing({ ...editing, gallery: v })} max={30} />
              <div><Label>Video URL</Label><Input value={editing.video || ''} onChange={e => setEditing({ ...editing, video: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editing.published} onCheckedChange={c => setEditing({ ...editing, published: c })} /><Label>Published</Label></div>
              <Button onClick={save} className="w-full bg-bsv-red">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function NgosView({ ngos, api, reload }) {
  const [editing, setEditing] = useState(null)
  const save = async () => {
    if (!editing) return
    const method = editing.id ? 'PATCH' : 'POST'
    const url = editing.id ? `/api/ngos/${editing.id}` : '/api/ngos'
    const r = await api(url, method, editing)
    if (r.ok) { toast.success('Saved'); setEditing(null); reload() }
  }
  const del = async (id) => { if (confirm('Delete?')) { await api(`/api/ngos/${id}`, 'DELETE'); reload() } }
  return (
    <div className="space-y-3">
      <div className="flex justify-between"><h3 className="font-display font-bold text-lg">NGO Network ({ngos.length})</h3><Button onClick={() => setEditing({ name: '', description: '', logo: '', website: '', email: '', phone: '', stateCoverage: [], published: true })} className="bg-bsv-red"><Plus className="w-4 h-4 mr-1" />New NGO</Button></div>
      <div className="grid md:grid-cols-2 gap-3">{ngos.map(n => (
        <Card key={n.id}><CardContent className="p-4 flex gap-3">
          {n.logo && <img src={n.logo} alt="" className="w-16 h-16 object-cover rounded" />}
          <div className="flex-1">
            <div className="font-bold">{n.name}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">{n.description}</div>
            <div className="text-xs mt-1">{n.website}</div>
            <div className="flex gap-1 mt-2"><Button size="sm" variant="outline" onClick={() => setEditing(n)}><Edit className="w-3 h-3" /></Button><Button size="sm" variant="ghost" onClick={() => del(n.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button></div>
          </div>
        </CardContent></Card>))}</div>
      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? 'Edit' : 'New'} NGO</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
              <MediaPicker label="Logo" value={editing.logo} onChange={v => setEditing({ ...editing, logo: v })} />
              <div><Label>Description</Label><Textarea rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Website</Label><Input value={editing.website} onChange={e => setEditing({ ...editing, website: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} /></div>
                <div><Label>State Coverage (comma-separated)</Label><Input value={(editing.stateCoverage || []).join(', ')} onChange={e => setEditing({ ...editing, stateCoverage: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editing.published} onCheckedChange={c => setEditing({ ...editing, published: c })} /><Label>Published</Label></div>
              <Button onClick={save} className="w-full bg-bsv-red">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function ReportsView({ reports, api, reload }) {
  const [editing, setEditing] = useState(null)
  const save = async () => {
    const method = editing.id ? 'PATCH' : 'POST'
    const url = editing.id ? `/api/reports/${editing.id}` : '/api/reports'
    const r = await api(url, method, editing)
    if (r.ok) { toast.success('Saved'); setEditing(null); reload() }
  }
  const del = async (id) => { if (confirm('Delete?')) { await api(`/api/reports/${id}`, 'DELETE'); reload() } }
  return (
    <div className="space-y-3">
      <div className="flex justify-between"><h3 className="font-display font-bold text-lg">Reports & Publications ({reports.length})</h3><Button onClick={() => setEditing({ title: '', category: 'Annual Report', description: '', published: true, language: 'en' })} className="bg-bsv-red"><Plus className="w-4 h-4 mr-1" />New Report</Button></div>
      <div className="grid md:grid-cols-3 gap-3">{reports.map(r => (
        <Card key={r.id}><CardContent className="p-4">
          {r.thumbnail && <img src={r.thumbnail} alt="" className="w-full h-32 object-cover rounded mb-2" />}
          <Badge className="mb-1">{r.category}</Badge>
          <div className="font-bold">{r.title}</div>
          <div className="text-xs text-muted-foreground">Downloads: {r.downloadCount || 0}</div>
          <div className="flex gap-1 mt-2"><Button size="sm" variant="outline" onClick={() => setEditing(r)}><Edit className="w-3 h-3" /></Button><Button size="sm" variant="ghost" onClick={() => del(r.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button></div>
        </CardContent></Card>))}</div>
      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? 'Edit' : 'New'} Report</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Category</Label><Select value={editing.category} onValueChange={v => setEditing({ ...editing, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Annual Report', 'Campaign Report', 'Awareness Report', 'NGO Report', 'Research Publication', 'Whitepaper', 'Impact Assessment'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Description</Label><Textarea rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <MediaPicker label="Thumbnail" value={editing.thumbnail} onChange={v => setEditing({ ...editing, thumbnail: v })} />
              <MediaPicker label="PDF File" value={editing.file} onChange={v => setEditing({ ...editing, file: v })} />
              <div className="flex items-center gap-2"><Switch checked={editing.published} onCheckedChange={c => setEditing({ ...editing, published: c })} /><Label>Published</Label></div>
              <Button onClick={save} className="w-full bg-bsv-red">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function UsersView({ users, api, reload }) {
  const [editing, setEditing] = useState(null)
  const roles = ['super_admin', 'content_admin', 'campaign_manager', 'regional_manager', 'media_manager', 'lead_manager']
  const save = async () => {
    if (editing.id) await api(`/api/users/${editing.id}`, 'PATCH', { name: editing.name, role: editing.role, active: editing.active, ...(editing.password ? { password: editing.password } : {}) })
    else await api('/api/users', 'POST', editing)
    setEditing(null); reload(); toast.success('Saved')
  }
  const del = async (id) => { if (confirm('Delete user?')) { await api(`/api/users/${id}`, 'DELETE'); reload() } }
  return (
    <Card><CardContent className="p-5">
      <div className="flex justify-between mb-3"><h3 className="font-display font-bold text-lg">User Accounts ({users.length})</h3><Button onClick={() => setEditing({ email: '', password: '', name: '', role: 'content_admin', active: true })} className="bg-bsv-red"><UserPlus className="w-4 h-4 mr-1" />New User</Button></div>
      <table className="w-full text-sm">
        <thead><tr className="border-b text-left"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead>
        <tbody>{users.map(u => (
          <tr key={u.id} className="border-b">
            <td className="p-2 font-medium">{u.name}</td>
            <td className="p-2">{u.email}</td>
            <td className="p-2"><Badge variant="outline">{u.role}</Badge></td>
            <td className="p-2">{u.active ? <Badge className="bg-green-500">Active</Badge> : <Badge variant="outline">Disabled</Badge>}</td>
            <td className="p-2"><Button size="sm" variant="outline" onClick={() => setEditing(u)}><Edit className="w-3 h-3" /></Button><Button size="sm" variant="ghost" onClick={() => del(u.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button></td>
          </tr>))}</tbody>
      </table>
      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing.id ? 'Edit' : 'New'} User</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={editing.email} disabled={!!editing.id} onChange={e => setEditing({ ...editing, email: e.target.value })} /></div>
              <div><Label>{editing.id ? 'New Password (leave empty to keep)' : 'Password'}</Label><Input type="password" value={editing.password || ''} onChange={e => setEditing({ ...editing, password: e.target.value })} /></div>
              <div><Label>Role</Label><Select value={editing.role} onValueChange={v => setEditing({ ...editing, role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r.replace('_', ' ')}</SelectItem>)}</SelectContent></Select></div>
              <div className="flex items-center gap-2"><Switch checked={editing.active !== false} onCheckedChange={c => setEditing({ ...editing, active: c })} /><Label>Active</Label></div>
              <Button onClick={save} className="w-full bg-bsv-red">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </CardContent></Card>
  )
}


function VideosView({ api, token, reload }) {
  const [videos, setVideos] = useState([])
  const [editing, setEditing] = useState(null)
  const load = async () => {
    const r = await fetch('/api/videos')
    if (r.ok) setVideos(await r.json())
  }
  useEffect(() => { load() }, [])
  const save = async () => {
    if (!editing.title || !editing.url) { toast.error('Title and YouTube URL required'); return }
    const method = editing.id ? 'PATCH' : 'POST'
    const url = editing.id ? `/api/videos/${editing.id}` : '/api/videos'
    const r = await api(url, method, editing)
    if (r.ok) { toast.success('Saved'); setEditing(null); load() }
  }
  const del = async (id) => { if (confirm('Delete?')) { await api(`/api/videos/${id}`, 'DELETE'); load() } }
  return (
    <div className="space-y-3">
      <div className="flex justify-between"><h3 className="font-display font-bold text-lg">Videos ({videos.length})</h3><Button onClick={() => setEditing({ title: '', url: '', description: '', category: 'Campaign', featured: false, published: true, order: 0 })} className="bg-bsv-red"><Plus className="w-4 h-4 mr-1" />New Video</Button></div>
      <div className="grid md:grid-cols-3 gap-3">{videos.map(v => (
        <Card key={v.id}><CardContent className="p-4">
          {v.thumbnail && <img src={v.thumbnail} alt="" className="w-full h-32 object-cover rounded mb-2" />}
          <div className="flex gap-1 mb-1"><Badge className="bg-bsv-red">{v.category}</Badge>{v.featured && <Badge className="bg-yellow-500">FEATURED</Badge>}</div>
          <div className="font-bold text-sm line-clamp-2">{v.title}</div>
          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{v.description}</div>
          <div className="flex gap-1 mt-2"><Button size="sm" variant="outline" onClick={() => setEditing(v)}><Edit className="w-3 h-3" /></Button><Button size="sm" variant="ghost" onClick={() => del(v.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button></div>
        </CardContent></Card>))}</div>
      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing.id ? 'Edit' : 'New'} Video</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>YouTube URL</Label><Input value={editing.url} onChange={e => setEditing({ ...editing, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></div>
              <div><Label>Description</Label><Textarea rows={2} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><Label>Category</Label><Select value={editing.category} onValueChange={v => setEditing({ ...editing, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Campaign', 'Vox Pop', 'KOL', 'NGO Activity', 'Influencer', 'Myth Busting', 'Awareness'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Order</Label><Input type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={editing.featured} onCheckedChange={c => setEditing({ ...editing, featured: c })} /><Label>Featured</Label></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editing.published} onCheckedChange={c => setEditing({ ...editing, published: c })} /><Label>Published</Label></div>
              <Button onClick={save} className="w-full bg-bsv-red">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function GalleryView({ items, api, reload }) {
  const [editing, setEditing] = useState(null)
  const [newImage, setNewImage] = useState('')

  const blank = { title: '', description: '', category: 'Workshop', coverImage: '', images: [], published: true, order: 0 }

  const save = async () => {
    if (!editing.title || !editing.category) { toast.error('Title and category required'); return }
    const method = editing.id ? 'PATCH' : 'POST'
    const url = editing.id ? `/api/gallery/${editing.id}` : '/api/gallery'
    const r = await api(url, method, editing)
    if (r.ok) { toast.success('Album saved'); setEditing(null); reload() }
    else toast.error('Save failed')
  }
  const del = async (id) => {
    if (!confirm('Delete this album?')) return
    const r = await api(`/api/gallery/${id}`, 'DELETE')
    if (r.ok) { toast.success('Deleted'); reload() }
  }
  const addImage = () => {
    if (!newImage.trim()) return
    setEditing(e => ({ ...e, images: [...(e.images || []), newImage.trim()] }))
    setNewImage('')
  }
  const removeImage = (idx) => {
    setEditing(e => ({ ...e, images: e.images.filter((_, i) => i !== idx) }))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg" style={{ color: '#151f6d' }}>Gallery Albums ({items?.length || 0})</h3>
        <Button onClick={() => setEditing({ ...blank })} className="text-white" style={{ background: '#de2527' }}>
          <Plus className="w-4 h-4 mr-1" />New Album
        </Button>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
        {(items || []).map(a => (
          <Card key={a.id} className="overflow-hidden">
            <div className="aspect-square bg-slate-100 relative">
              {a.coverImage && <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover" />}
              <Badge className="absolute top-2 left-2 border-0" style={{ background: '#de2527' }}>{a.category}</Badge>
              {!a.published && <Badge className="absolute top-2 right-2 bg-slate-700 border-0">DRAFT</Badge>}
            </div>
            <CardContent className="p-3">
              <div className="font-display font-semibold text-sm line-clamp-2" style={{ color: '#151f6d' }}>{a.title}</div>
              <div className="text-xs text-slate-500 mt-1">{a.images?.length || 0} photos</div>
              <div className="flex gap-1 mt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing({ ...a })}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => del(a.id)}>
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing.id ? 'Edit' : 'New'} Album</DialogTitle>
              <DialogDescription>Manage album details, cover image and photos.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Title *</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Category *</Label>
                <Select value={editing.category} onValueChange={v => setEditing({ ...editing, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Workshop', 'Awareness Drive', 'School Initiative', 'NGO Event', 'Training', 'Community', 'Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea rows={2} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><Label>Cover Image URL</Label><Input value={editing.coverImage} onChange={e => setEditing({ ...editing, coverImage: e.target.value })} placeholder="https:// or /api/media/..." /></div>

              <div>
                <Label>Photos ({editing.images?.length || 0})</Label>
                <div className="flex gap-2 mb-2">
                  <Input value={newImage} onChange={e => setNewImage(e.target.value)} placeholder="Paste image URL" />
                  <Button type="button" onClick={addImage} size="sm" style={{ background: '#151f6d' }}>Add</Button>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {(editing.images || []).map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="" className="w-full h-20 object-cover rounded" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Order</Label><Input type="number" value={editing.order || 0} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={editing.published} onCheckedChange={c => setEditing({ ...editing, published: c })} /><Label>Published</Label></div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={save} className="flex-1 text-white" style={{ background: '#de2527' }}>{editing.id ? 'Update' : 'Create'}</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


function QuizQuestionsView({ items, api, reload }) {
  const [editing, setEditing] = useState(null)
  const blank = { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', category: 'general', order: (items?.length || 0) + 1, published: true }

  const save = async () => {
    if (!editing.question?.trim()) { toast.error('Question is required'); return }
    if (editing.options.some(o => !o.trim())) { toast.error('All 4 options required'); return }
    const method = editing.id ? 'PATCH' : 'POST'
    const url = editing.id ? `/api/quiz/questions/${editing.id}` : '/api/quiz/questions'
    const r = await api(url, method, editing)
    if (r.ok) { toast.success('Saved'); setEditing(null); reload() }
    else toast.error('Save failed')
  }
  const del = async (id) => {
    if (!confirm('Delete question?')) return
    const r = await api(`/api/quiz/questions/${id}`, 'DELETE')
    if (r.ok) { toast.success('Deleted'); reload() }
  }
  const setOpt = (i, v) => setEditing(e => { const o = [...e.options]; o[i] = v; return { ...e, options: o } })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg" style={{ color: '#151f6d' }}>Quiz Questions ({items?.length || 0})</h3>
        <Button onClick={() => setEditing({ ...blank })} className="text-white" style={{ background: '#de2527' }}><Plus className="w-4 h-4 mr-1" />New Question</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {(items || []).map(q => (
          <Card key={q.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge style={{ background: '#151f6d' }} className="border-0">{q.category || 'general'}</Badge>
                {q.published ? <Badge className="bg-green-600 border-0">Published</Badge> : <Badge variant="outline">Draft</Badge>}
              </div>
              <div className="font-semibold text-sm mb-2" style={{ color: '#151f6d' }}>Q{q.order}. {q.question}</div>
              <ul className="text-xs space-y-1 mb-2">
                {q.options.map((o, i) => (
                  <li key={i} className={i === q.correctIndex ? 'text-green-700 font-semibold' : 'text-slate-600'}>
                    {i === q.correctIndex ? '✓ ' : `${String.fromCharCode(65 + i)}. `}{o}
                  </li>
                ))}
              </ul>
              {q.explanation && <div className="text-xs text-slate-500 italic line-clamp-2 mb-2">{q.explanation}</div>}
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setEditing({ ...q })}><Edit className="w-3 h-3" /></Button>
                <Button size="sm" variant="ghost" onClick={() => del(q.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? 'Edit' : 'New'} Quiz Question</DialogTitle><DialogDescription>Quiz questions appear on the homepage quiz section.</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <div><Label>Question *</Label><Textarea rows={2} value={editing.question} onChange={e => setEditing({ ...editing, question: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Options (mark correct)</Label>
                {editing.options.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={editing.correctIndex === i} onChange={() => setEditing({ ...editing, correctIndex: i })} className="w-4 h-4 accent-green-600" />
                    <span className="w-6 text-xs font-semibold text-slate-500">{String.fromCharCode(65 + i)}.</span>
                    <Input value={o} onChange={e => setOpt(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                  </div>
                ))}
              </div>
              <div><Label>Explanation (shown after answer)</Label><Textarea rows={3} value={editing.explanation} onChange={e => setEditing({ ...editing, explanation: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Category</Label><Input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} placeholder="first-aid, myths, stats..." /></div>
                <div><Label>Order</Label><Input type="number" value={editing.order || 0} onChange={e => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={editing.published} onCheckedChange={c => setEditing({ ...editing, published: c })} /><Label>Published</Label></div>
              </div>
              <div className="flex gap-2">
                <Button onClick={save} className="flex-1 text-white" style={{ background: '#de2527' }}>{editing.id ? 'Update' : 'Create'}</Button>
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


const LANG_INFO = [
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
]

function TranslationsView({ api, content, setContent }) {
  const [status, setStatus] = useState({})
  const [audit, setAudit] = useState([])
  const [selectedLang, setSelectedLang] = useState('hi')
  const [editPath, setEditPath] = useState('')
  const [editValue, setEditValue] = useState('')

  const load = async () => {
    const [s, a] = await Promise.all([api('/api/translations/status').then(r => r.ok ? r.json() : {}), api('/api/translations/audit').then(r => r.ok ? r.json() : [])])
    setStatus(s); setAudit(a)
  }
  useEffect(() => { load() }, [])

  const approve = async (lang, newStatus) => {
    const r = await api('/api/translations/approve', 'POST', { lang, status: newStatus })
    if (r.ok) { toast.success(`${lang} → ${newStatus}`); load() }
  }

  const flatPairs = []
  const flatten = (obj, prefix = '') => {
    if (!obj) return
    if (typeof obj === 'string') { if (obj.trim() && !obj.startsWith('http') && !obj.startsWith('#')) flatPairs.push(prefix); return }
    if (Array.isArray(obj)) { obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`)); return }
    if (typeof obj === 'object') Object.entries(obj).forEach(([k, v]) => { if (['id', 'icon', 'image', 'preview', 'file', 'url', 'logo', 'thumbnail', 'social', 'translations', 'translationStatus', 'sections'].includes(k)) return; flatten(v, prefix ? `${prefix}.${k}` : k) })
  }
  if (content) { flatten(content.hero, 'hero'); flatten(content.about, 'about'); flatten(content.emergencyDos, 'emergencyDos'); flatten(content.emergencyDonts, 'emergencyDonts'); flatten(content.myths, 'myths'); flatten(content.resources, 'resources'); flatten(content.impactStats, 'impactStats'); flatten(content.footer, 'footer') }

  const getAtPath = (obj, path) => {
    if (!obj) return ''
    const parts = path.split(/\.|\[|\]/).filter(Boolean)
    let cur = obj
    for (const p of parts) { cur = cur?.[/^\d+$/.test(p) ? parseInt(p, 10) : p]; if (cur === undefined) return '' }
    return cur ?? ''
  }

  const saveOverride = async () => {
    const r = await api('/api/translations/override', 'POST', { lang: selectedLang, path: editPath, value: editValue })
    if (r.ok) { toast.success('Translation overridden — marked for re-approval'); setEditPath(''); setEditValue(''); load() }
  }

  return (
    <div className="space-y-4">
      <div><h2 className="font-display font-extrabold text-2xl text-bsv-blue mb-1">Translation Approval Workflow</h2><p className="text-sm text-muted-foreground">Only <b>approved</b> translations are served to the public site. AI-generated translations default to <b>pending_review</b>.</p></div>
      <Card><CardContent className="p-5">
        <h3 className="font-display font-bold text-lg text-bsv-blue mb-3">Language Approval Status</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">{LANG_INFO.map(l => {
          const s = status[l.code]
          const stColor = s?.status === 'approved' ? 'bg-green-500' : s?.status === 'pending_review' ? 'bg-amber-500' : 'bg-slate-400'
          return (
            <Card key={l.code} className="border-2"><CardContent className="p-4">
              <div className="flex justify-between items-start mb-2"><div><div className="font-bold">{l.native}</div><div className="text-xs text-muted-foreground">{l.label}</div></div><Badge className={stColor}>{s?.status || 'draft'}</Badge></div>
              {s?.approvedBy && <p className="text-xs">Approved by <b>{s.approvedBy}</b></p>}
              {s?.generatedByUser && <p className="text-xs text-muted-foreground">AI by {s.generatedByUser}</p>}
              <div className="flex gap-1 mt-2">
                {s?.status !== 'approved' && <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1" onClick={() => approve(l.code, 'approved')}><CheckCircle2 className="w-3 h-3 mr-1" />Approve</Button>}
                {s?.status === 'approved' && <Button size="sm" variant="outline" className="flex-1" onClick={() => approve(l.code, 'pending_review')}><Clock className="w-3 h-3 mr-1" />Unapprove</Button>}
              </div>
            </CardContent></Card>
          )
        })}</div>
      </CardContent></Card>
      <Card><CardContent className="p-5">
        <h3 className="font-display font-bold text-lg text-bsv-blue mb-3">Side-by-Side Translation Editor</h3>
        <div className="mb-3"><Label>Language</Label><Select value={selectedLang} onValueChange={setSelectedLang}><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger><SelectContent>{LANG_INFO.map(l => <SelectItem key={l.code} value={l.code}>{l.native} ({l.label})</SelectItem>)}</SelectContent></Select></div>
        <div className="max-h-[500px] overflow-y-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0"><tr className="border-b"><th className="text-left p-2">Field</th><th className="text-left p-2">English</th><th className="text-left p-2">{LANG_INFO.find(l => l.code === selectedLang)?.native}</th><th className="p-2"></th></tr></thead>
            <tbody>{flatPairs.slice(0, 60).map(p => {
              const en = getAtPath(content, p)
              const tr = getAtPath(content?.translations?.[selectedLang], p) || en
              return (
                <tr key={p} className="border-b hover:bg-slate-50">
                  <td className="p-2 text-xs text-muted-foreground max-w-[140px] truncate font-mono">{p}</td>
                  <td className="p-2 max-w-xs text-xs">{typeof en === 'string' ? en : ''}</td>
                  <td className="p-2 max-w-xs text-xs">{typeof tr === 'string' ? tr : ''}</td>
                  <td className="p-2"><Button size="sm" variant="ghost" onClick={() => { setEditPath(p); setEditValue(typeof tr === 'string' ? tr : '') }}><Edit className="w-3 h-3" /></Button></td>
                </tr>
              )
            })}</tbody>
          </table>
        </div>
        {editPath && (
          <Dialog open onOpenChange={() => setEditPath('')}>
            <DialogContent>
              <DialogHeader><DialogTitle>Override Translation</DialogTitle></DialogHeader>
              <div className="space-y-2">
                <div><Label>Field path</Label><Input value={editPath} disabled /></div>
                <div><Label>English</Label><div className="text-sm p-2 bg-slate-50 rounded">{String(getAtPath(content, editPath))}</div></div>
                <div><Label>{LANG_INFO.find(l => l.code === selectedLang)?.native} translation</Label><Textarea rows={4} value={editValue} onChange={e => setEditValue(e.target.value)} /></div>
                <p className="text-xs text-amber-700">Saving will mark this language as <b>pending_review</b> until re-approved.</p>
                <Button onClick={saveOverride} className="w-full bg-bsv-red">Save Override</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent></Card>
      <Card><CardContent className="p-5">
        <h3 className="font-display font-bold text-lg text-bsv-blue mb-3">Audit Log</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="p-2">Time</th><th className="p-2">Lang</th><th className="p-2">Action</th><th className="p-2">User</th><th className="p-2">Details</th></tr></thead>
          <tbody>{audit.slice(0, 20).map(a => (
            <tr key={a.id} className="border-b">
              <td className="p-2 text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</td>
              <td className="p-2"><Badge variant="outline">{a.lang}</Badge></td>
              <td className="p-2">{a.action}</td>
              <td className="p-2">{a.user}</td>
              <td className="p-2 text-xs text-muted-foreground max-w-xs truncate">{a.path || (a.fieldCount ? `${a.fieldCount} fields` : '')}</td>
            </tr>))}</tbody>
        </table>
        {!audit.length && <p className="text-sm text-muted-foreground py-4 text-center">No audit entries yet</p>}
      </CardContent></Card>
    </div>
  )
}

function DictionaryView({ api }) {
  const [terms, setTerms] = useState([])
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('')
  const load = async () => { const r = await api('/api/dictionary'); if (r.ok) setTerms(await r.json()) }
  useEffect(() => { load() }, [])
  const save = async () => {
    if (!editing.term) { toast.error('term required'); return }
    const method = editing.id ? 'PATCH' : 'POST'
    const url = editing.id ? `/api/dictionary/${editing.id}` : '/api/dictionary'
    const r = await api(url, method, editing)
    if (r.ok) { toast.success('Saved'); setEditing(null); load() }
  }
  const del = async (id) => { if (confirm('Delete?')) { await api(`/api/dictionary/${id}`, 'DELETE'); load() } }
  const filtered = filter ? terms.filter(t => t.term.toLowerCase().includes(filter.toLowerCase()) || t.category?.toLowerCase().includes(filter.toLowerCase())) : terms
  return (
    <div className="space-y-4">
      <div><h2 className="font-display font-extrabold text-2xl text-bsv-blue mb-1">Medical Terminology Dictionary</h2><p className="text-sm text-muted-foreground">Standardized translations for medical/snakebite terms. AI translator uses these for consistency across all content.</p></div>
      <div className="flex justify-between gap-3"><Input placeholder="Search terms or category..." value={filter} onChange={e => setFilter(e.target.value)} className="max-w-sm" /><Button onClick={() => setEditing({ term: '', category: 'medical', definition: '', doNotTranslate: false, translations: {} })} className="bg-bsv-red"><Plus className="w-4 h-4 mr-1" />Add Term</Button></div>
      <Card><CardContent className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-2">Term (EN)</th><th className="p-2">Category</th><th className="p-2">Definition</th><th className="p-2">Translations</th><th className="p-2">Flag</th><th className="p-2">Actions</th></tr></thead>
            <tbody>{filtered.map(t => (
              <tr key={t.id} className="border-b hover:bg-slate-50">
                <td className="p-2 font-medium">{t.term}</td>
                <td className="p-2"><Badge variant="outline">{t.category}</Badge></td>
                <td className="p-2 text-xs text-muted-foreground max-w-xs">{t.definition}</td>
                <td className="p-2 text-xs">{Object.keys(t.translations || {}).length} lang</td>
                <td className="p-2">{t.doNotTranslate ? <Badge className="bg-amber-500">Do not translate</Badge> : null}</td>
                <td className="p-2"><Button size="sm" variant="outline" onClick={() => setEditing(t)}><Edit className="w-3 h-3" /></Button><Button size="sm" variant="ghost" onClick={() => del(t.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button></td>
              </tr>))}</tbody>
          </table>
          {!filtered.length && <p className="text-center text-muted-foreground py-8">No terms</p>}
        </div>
      </CardContent></Card>
      {editing && (
        <Dialog open onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing.id ? 'Edit' : 'New'} Medical Term</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Term (English)</Label><Input value={editing.term} onChange={e => setEditing({ ...editing, term: e.target.value })} /></div>
                <div><Label>Category</Label><Select value={editing.category} onValueChange={v => setEditing({ ...editing, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['medical', 'abbreviation', 'snake_species', 'drug', 'procedure', 'organization', 'general'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div><Label>Definition / Notes</Label><Textarea rows={2} value={editing.definition} onChange={e => setEditing({ ...editing, definition: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editing.doNotTranslate} onCheckedChange={c => setEditing({ ...editing, doNotTranslate: c })} /><Label>Do not translate (use as-is, e.g. abbreviations like ASV, PHC)</Label></div>
              {!editing.doNotTranslate && (
                <div className="space-y-2">
                  <Label>Per-Language Translations</Label>
                  {LANG_INFO.map(l => (
                    <div key={l.code} className="flex gap-2 items-center"><div className="w-32 text-xs font-medium">{l.native} ({l.label})</div><Input value={editing.translations?.[l.code] || ''} onChange={e => setEditing({ ...editing, translations: { ...(editing.translations || {}), [l.code]: e.target.value } })} /></div>
                  ))}
                </div>
              )}
              <Button onClick={save} className="w-full bg-bsv-red">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


function SettingsView({ api }) {
  const [s, setS] = useState(null)
  const [section, setSection] = useState('branding')
  const [redirects, setRedirects] = useState([])
  const [newRedirect, setNewRedirect] = useState({ from: '', to: '' })

  const load = async () => {
    const r = await api('/api/settings')
    if (r.ok) setS(await r.json())
    const rr = await api('/api/redirects')
    if (rr.ok) setRedirects(await rr.json())
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    const r = await api('/api/settings', 'PUT', s)
    if (r.ok) { toast.success('Settings saved — applied site-wide'); setTimeout(() => window.location.reload(), 800) } else toast.error('Save failed')
  }
  const reset = async () => {
    if (!confirm('Reset all settings to defaults?')) return
    const r = await api('/api/settings/reset', 'POST')
    if (r.ok) { const d = await r.json(); setS(d.data); toast.success('Reset') }
  }
  const addRedirect = async () => {
    if (!newRedirect.from || !newRedirect.to) { toast.error('Both fields required'); return }
    const r = await api('/api/redirects', 'POST', { ...newRedirect, code: 301 })
    if (r.ok) { setNewRedirect({ from: '', to: '' }); load() }
  }
  const delRedirect = async (id) => { await api(`/api/redirects/${id}`, 'DELETE'); load() }

  if (!s) return <p className="text-muted-foreground">Loading settings...</p>

  const updateBranding = (k, v) => setS({ ...s, branding: { ...s.branding, [k]: v } })
  const updateSEO = (k, v) => setS({ ...s, seoHome: { ...s.seoHome, [k]: v } })
  const updateContact = (k, v) => setS({ ...s, contact: { ...s.contact, [k]: v } })
  const updateSocial = (k, v) => setS({ ...s, social: { ...s.social, [k]: v } })
  const updateTracking = (k, v) => setS({ ...s, tracking: { ...s.tracking, [k]: v } })
  const updateAdvanced = (k, v) => setS({ ...s, advanced: { ...s.advanced, [k]: v } })

  const sections = [
    { id: 'branding', label: 'Branding', icon: ImageIcon },
    { id: 'seo', label: 'Global SEO', icon: Globe },
    { id: 'per-page', label: 'Per-Page SEO', icon: FileText },
    { id: 'contact', label: 'Contact Info', icon: MessageSquare },
    { id: 'social', label: 'Social Links', icon: Megaphone },
    { id: 'tracking', label: 'Tracking & Analytics', icon: BarChart3 },
    { id: 'advanced', label: 'Advanced', icon: Settings },
    { id: 'redirects', label: 'Redirects (301)', icon: Edit },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between sticky top-16 bg-slate-50 py-2 z-20">
        <div><h2 className="font-display font-extrabold text-2xl text-bsv-blue">Global Website Settings</h2><p className="text-sm text-muted-foreground">Branding, SEO, analytics & site-wide configuration</p></div>
        <div className="flex gap-2"><Button variant="outline" onClick={reset}><RefreshCw className="w-4 h-4 mr-1" />Reset</Button><Button onClick={save} className="bg-bsv-red"><Save className="w-4 h-4 mr-1" />Save & Apply</Button></div>
      </div>
      <div className="grid lg:grid-cols-[200px_1fr] gap-4">
        <Card><CardContent className="p-2">
          {sections.map(sec => {
            const Icon = sec.icon
            return <button key={sec.id} onClick={() => setSection(sec.id)} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm ${section === sec.id ? 'bg-bsv-blue text-white' : 'hover:bg-slate-100'}`}><Icon className="w-4 h-4" />{sec.label}</button>
          })}
        </CardContent></Card>

        <div className="space-y-3">
          {section === 'branding' && (
            <Card><CardContent className="p-5 space-y-3">
              <h3 className="font-display font-bold text-lg text-bsv-blue">Branding</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>Website Name</Label><Input value={s.branding.websiteName} onChange={e => updateBranding('websiteName', e.target.value)} /></div>
                <div><Label>Campaign Name</Label><Input value={s.branding.campaignName} onChange={e => updateBranding('campaignName', e.target.value)} /></div>
                <div className="md:col-span-2"><Label>Tagline</Label><Input value={s.branding.tagline} onChange={e => updateBranding('tagline', e.target.value)} /></div>
              </div>
              <MediaPicker label="Header Logo (light backgrounds)" value={s.branding.headerLogo} onChange={v => updateBranding('headerLogo', v)} />
              <MediaPicker label="Footer Logo" value={s.branding.footerLogo} onChange={v => updateBranding('footerLogo', v)} />
              <MediaPicker label="Mobile Logo (small)" value={s.branding.mobileLogo} onChange={v => updateBranding('mobileLogo', v)} />
              <MediaPicker label="Dark Mode Logo" value={s.branding.darkLogo} onChange={v => updateBranding('darkLogo', v)} />
              <MediaPicker label="Favicon (32x32 ICO/PNG)" value={s.branding.favicon} onChange={v => updateBranding('favicon', v)} />
              <MediaPicker label="Apple Touch Icon (180x180)" value={s.branding.appleTouchIcon} onChange={v => updateBranding('appleTouchIcon', v)} />
              <MediaPicker label="Social Sharing Image (1200x630)" value={s.branding.socialSharingImage} onChange={v => updateBranding('socialSharingImage', v)} />

              {/* Color Scheme Manager */}
              <hr className="my-3" />
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5" style={{ color: '#de2527' }} />
                <h4 className="font-display font-semibold text-base" style={{ color: '#151f6d' }}>Brand Color Scheme</h4>
              </div>
              <p className="text-xs text-slate-500 -mt-2">These colors are applied across the website (buttons, badges, hero, headings).</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { key: 'primary', label: 'Primary (Brand Blue)', def: '#151f6d' },
                  { key: 'accent', label: 'Accent (Brand Red)', def: '#de2527' },
                  { key: 'background', label: 'Page Background', def: '#ffffff' },
                  { key: 'surface', label: 'Section Alt Background', def: '#f8fafc' },
                  { key: 'headingColor', label: 'Heading Text', def: '#151f6d' },
                  { key: 'textColor', label: 'Body Text', def: '#334155' },
                ].map(c => (
                  <div key={c.key}>
                    <Label className="text-xs">{c.label}</Label>
                    <div className="flex gap-2 items-center mt-1">
                      <div className="relative">
                        <input
                          type="color"
                          value={s.branding.colors?.[c.key] || c.def}
                          onChange={e => updateBranding('colors', { ...(s.branding.colors || {}), [c.key]: e.target.value })}
                          className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={s.branding.colors?.[c.key] || c.def}
                        onChange={e => updateBranding('colors', { ...(s.branding.colors || {}), [c.key]: e.target.value })}
                        placeholder={c.def}
                        className="flex-1 font-mono text-sm"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => updateBranding('colors', { ...(s.branding.colors || {}), [c.key]: c.def })} title="Reset to default">
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live preview */}
              <div className="rounded-xl p-5 mt-3 border" style={{ background: s.branding.colors?.background || '#fff', color: s.branding.colors?.textColor || '#334155' }}>
                <div className="text-xs uppercase tracking-wider mb-2 opacity-60">Live Preview</div>
                <div className="font-display text-2xl font-semibold mb-2" style={{ color: s.branding.colors?.headingColor || '#151f6d' }}>Sample Heading</div>
                <p className="text-sm mb-3">Some body text to preview the color combinations.</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="text-white" style={{ background: s.branding.colors?.primary || '#151f6d' }}>Primary Button</Button>
                  <Button size="sm" className="text-white" style={{ background: s.branding.colors?.accent || '#de2527' }}>Accent Button</Button>
                  <Badge style={{ background: s.branding.colors?.primary || '#151f6d', color: '#fff' }} className="border-0">Primary Badge</Badge>
                  <Badge style={{ background: s.branding.colors?.accent || '#de2527', color: '#fff' }} className="border-0">Accent Badge</Badge>
                </div>
              </div>
            </CardContent></Card>
          )}

          {section === 'seo' && (
            <Card><CardContent className="p-5 space-y-3">
              <h3 className="font-display font-bold text-lg text-bsv-blue">Homepage SEO (Global)</h3>
              <div><Label>Meta Title</Label><Input value={s.seoHome.metaTitle} onChange={e => updateSEO('metaTitle', e.target.value)} /></div>
              <div><Label>Meta Description</Label><Textarea rows={2} value={s.seoHome.metaDescription} onChange={e => updateSEO('metaDescription', e.target.value)} /></div>
              <div><Label>Meta Keywords</Label><Input value={s.seoHome.metaKeywords} onChange={e => updateSEO('metaKeywords', e.target.value)} /></div>
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>Canonical URL</Label><Input value={s.seoHome.canonicalUrl} onChange={e => updateSEO('canonicalUrl', e.target.value)} placeholder="https://bsvindia.com/" /></div>
                <div><Label>Robots</Label><Select value={s.seoHome.robots} onValueChange={v => updateSEO('robots', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['index, follow', 'noindex, nofollow', 'index, nofollow', 'noindex, follow'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <hr className="my-3" />
              <h4 className="font-display font-bold text-sm text-bsv-blue">Open Graph (Facebook, LinkedIn, WhatsApp)</h4>
              <div><Label>OG Title</Label><Input value={s.seoHome.ogTitle} onChange={e => updateSEO('ogTitle', e.target.value)} /></div>
              <div><Label>OG Description</Label><Textarea rows={2} value={s.seoHome.ogDescription} onChange={e => updateSEO('ogDescription', e.target.value)} /></div>
              <MediaPicker label="OG Image (1200x630 recommended)" value={s.seoHome.ogImage} onChange={v => updateSEO('ogImage', v)} />
              <hr className="my-3" />
              <h4 className="font-display font-bold text-sm text-bsv-blue">Twitter / X Card</h4>
              <div><Label>Twitter Card Type</Label><Select value={s.seoHome.twitterCardType} onValueChange={v => updateSEO('twitterCardType', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['summary', 'summary_large_image', 'app', 'player'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Twitter Title</Label><Input value={s.seoHome.twitterTitle} onChange={e => updateSEO('twitterTitle', e.target.value)} /></div>
              <div><Label>Twitter Description</Label><Textarea rows={2} value={s.seoHome.twitterDescription} onChange={e => updateSEO('twitterDescription', e.target.value)} /></div>
              <MediaPicker label="Twitter Image" value={s.seoHome.twitterImage} onChange={v => updateSEO('twitterImage', v)} />
            </CardContent></Card>
          )}

          {section === 'per-page' && (
            <Card><CardContent className="p-5">
              <h3 className="font-display font-bold text-lg text-bsv-blue mb-3">Per-Page SEO</h3>
              <p className="text-sm text-muted-foreground mb-3">Override meta tags for each page individually.</p>
              {Object.entries(s.perPage || {}).map(([key, page]) => (
                <details key={key} className="border rounded p-3 mb-2">
                  <summary className="font-medium cursor-pointer capitalize">{key.replace('_', ' ')} <span className="text-xs text-muted-foreground">({page.slug})</span></summary>
                  <div className="space-y-2 mt-3">
                    <div><Label className="text-xs">Slug</Label><Input value={page.slug} onChange={e => setS({ ...s, perPage: { ...s.perPage, [key]: { ...page, slug: e.target.value } } })} /></div>
                    <div><Label className="text-xs">Meta Title</Label><Input value={page.metaTitle} onChange={e => setS({ ...s, perPage: { ...s.perPage, [key]: { ...page, metaTitle: e.target.value } } })} /></div>
                    <div><Label className="text-xs">Meta Description</Label><Textarea rows={2} value={page.metaDescription} onChange={e => setS({ ...s, perPage: { ...s.perPage, [key]: { ...page, metaDescription: e.target.value } } })} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label className="text-xs">OG Title</Label><Input value={page.ogTitle || ''} onChange={e => setS({ ...s, perPage: { ...s.perPage, [key]: { ...page, ogTitle: e.target.value } } })} /></div>
                      <div><Label className="text-xs">Schema Type</Label><Input value={page.schemaType} onChange={e => setS({ ...s, perPage: { ...s.perPage, [key]: { ...page, schemaType: e.target.value } } })} /></div>
                    </div>
                    <MediaPicker label="OG Image" value={page.ogImage} onChange={v => setS({ ...s, perPage: { ...s.perPage, [key]: { ...page, ogImage: v } } })} />
                  </div>
                </details>
              ))}
            </CardContent></Card>
          )}

          {section === 'contact' && (
            <Card><CardContent className="p-5 space-y-3">
              <h3 className="font-display font-bold text-lg text-bsv-blue">Contact Information</h3>
              <p className="text-sm text-muted-foreground">Single source of truth — reflects across header, footer, contact page.</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>Email</Label><Input value={s.contact.email} onChange={e => updateContact('email', e.target.value)} /></div>
                <div><Label>Phone</Label><Input value={s.contact.phone} onChange={e => updateContact('phone', e.target.value)} /></div>
                <div><Label>WhatsApp Number</Label><Input value={s.contact.whatsappNumber} onChange={e => updateContact('whatsappNumber', e.target.value)} placeholder="+91..." /></div>
                <div><Label>Helpline Number</Label><Input value={s.contact.helplineNumber} onChange={e => updateContact('helplineNumber', e.target.value)} /></div>
              </div>
              <div><Label>Office Address</Label><Textarea rows={2} value={s.contact.address} onChange={e => updateContact('address', e.target.value)} /></div>
              <div><Label>Google Maps URL</Label><Input value={s.contact.googleMapsUrl} onChange={e => updateContact('googleMapsUrl', e.target.value)} /></div>
            </CardContent></Card>
          )}

          {section === 'social' && (
            <Card><CardContent className="p-5 space-y-3">
              <h3 className="font-display font-bold text-lg text-bsv-blue">Social Media Links</h3>
              {Object.entries(s.social || {}).map(([k, v]) => (
                <div key={k}><Label className="capitalize">{k}</Label><Input value={v} onChange={e => updateSocial(k, e.target.value)} placeholder={`https://${k}.com/bsv`} /></div>
              ))}
            </CardContent></Card>
          )}

          {section === 'tracking' && (
            <Card><CardContent className="p-5 space-y-3">
              <h3 className="font-display font-bold text-lg text-bsv-blue">Tracking & Analytics</h3>
              <p className="text-sm text-muted-foreground">Tracking scripts are auto-injected when IDs are entered. Save & reload to apply.</p>
              <div><Label>Google Analytics 4 ID</Label><Input value={s.tracking.googleAnalyticsId} onChange={e => updateTracking('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" /></div>
              <div><Label>Google Tag Manager ID</Label><Input value={s.tracking.googleTagManagerId} onChange={e => updateTracking('googleTagManagerId', e.target.value)} placeholder="GTM-XXXXXXX" /></div>
              <div><Label>Meta Pixel ID</Label><Input value={s.tracking.metaPixelId} onChange={e => updateTracking('metaPixelId', e.target.value)} /></div>
              <div><Label>LinkedIn Insight Tag ID</Label><Input value={s.tracking.linkedinInsightTag} onChange={e => updateTracking('linkedinInsightTag', e.target.value)} /></div>
              <div><Label>Microsoft Clarity ID</Label><Input value={s.tracking.microsoftClarityId} onChange={e => updateTracking('microsoftClarityId', e.target.value)} /></div>
              <div><Label>Hotjar ID</Label><Input value={s.tracking.hotjarId} onChange={e => updateTracking('hotjarId', e.target.value)} /></div>
              <hr />
              <div><Label>Google Search Console Verification</Label><Input value={s.tracking.googleSearchConsoleVerification} onChange={e => updateTracking('googleSearchConsoleVerification', e.target.value)} /></div>
              <div><Label>Bing Verification</Label><Input value={s.tracking.bingVerification} onChange={e => updateTracking('bingVerification', e.target.value)} /></div>
              <div><Label>Facebook Domain Verification</Label><Input value={s.tracking.facebookDomainVerification} onChange={e => updateTracking('facebookDomainVerification', e.target.value)} /></div>
            </CardContent></Card>
          )}

          {section === 'advanced' && (
            <Card><CardContent className="p-5 space-y-3">
              <h3 className="font-display font-bold text-lg text-bsv-blue">Advanced</h3>
              <div className="flex items-center gap-2"><Switch checked={s.advanced.sitemapEnabled} onCheckedChange={c => updateAdvanced('sitemapEnabled', c)} /><Label>Generate XML Sitemap (available at /api/sitemap.xml)</Label></div>
              <div className="flex items-center gap-2"><Switch checked={s.advanced.enableSchema} onCheckedChange={c => updateAdvanced('enableSchema', c)} /><Label>Inject JSON-LD Schema markup</Label></div>
              <div><Label>robots.txt content</Label><Textarea rows={6} value={s.advanced.robotsTxt} onChange={e => updateAdvanced('robotsTxt', e.target.value)} className="font-mono text-xs" /></div>
              <div><Label>Custom Head Scripts (use with caution)</Label><Textarea rows={4} value={s.advanced.customHeadScripts} onChange={e => updateAdvanced('customHeadScripts', e.target.value)} className="font-mono text-xs" placeholder="// Custom JS to inject in <head>" /></div>
              <div><Label>Custom Body Scripts</Label><Textarea rows={4} value={s.advanced.customBodyScripts} onChange={e => updateAdvanced('customBodyScripts', e.target.value)} className="font-mono text-xs" /></div>
              <div className="text-xs text-muted-foreground">
                <p>• <a href="/api/sitemap.xml" target="_blank" className="text-bsv-red hover:underline">View live sitemap.xml</a></p>
                <p>• <a href="/api/robots.txt" target="_blank" className="text-bsv-red hover:underline">View live robots.txt</a></p>
              </div>
            </CardContent></Card>
          )}

          {section === 'redirects' && (
            <Card><CardContent className="p-5 space-y-3">
              <h3 className="font-display font-bold text-lg text-bsv-blue">301 Redirects</h3>
              <div className="flex gap-2"><Input placeholder="From path /old-url" value={newRedirect.from} onChange={e => setNewRedirect({ ...newRedirect, from: e.target.value })} /><Input placeholder="To URL /new-url" value={newRedirect.to} onChange={e => setNewRedirect({ ...newRedirect, to: e.target.value })} /><Button onClick={addRedirect} className="bg-bsv-red"><Plus className="w-4 h-4 mr-1" />Add</Button></div>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="p-2">From</th><th className="p-2">To</th><th className="p-2">Hits</th><th className="p-2"></th></tr></thead>
                <tbody>{redirects.map(r => (
                  <tr key={r.id} className="border-b"><td className="p-2 font-mono text-xs">{r.from}</td><td className="p-2 font-mono text-xs">{r.to}</td><td className="p-2">{r.hits}</td><td className="p-2"><Button size="sm" variant="ghost" onClick={() => delRedirect(r.id)}><Trash2 className="w-3 h-3 text-red-500" /></Button></td></tr>
                ))}</tbody>
              </table>
              {!redirects.length && <p className="text-xs text-muted-foreground py-4 text-center">No redirects configured</p>}
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  )
}

// (icon placeholder removed)

