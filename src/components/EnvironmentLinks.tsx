import { ExternalLink, Globe } from 'lucide-react'

export default function EnvironmentLinks() {
  const links = [
    { name: 'Alpha', url: 'https://infofriyends-brain-git-alpha-infofriyendstechnologys-projects.vercel.app/', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { name: 'Beta', url: 'https://infofriyends-brain-git-beta-infofriyendstechnologys-projects.vercel.app/', color: 'text-[#63BDF2]', bg: 'bg-[#63BDF2]/10', border: 'border-[#63BDF2]/20' },
    { name: 'Main', url: 'https://infofriyends-brain.vercel.app/', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ]

  return (
    <div className="bg-secondary/10 border border-border/30 rounded-3xl p-6 backdrop-blur-xl space-y-6 mt-8">
      <div className="flex items-center gap-2 pb-4 border-b border-border/30">
        <Globe className="text-primary" size={20} />
        <h2 className="text-lg font-bold text-white tracking-tight">Environments</h2>
      </div>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:bg-white/5 active:scale-[0.98] ${link.border} ${link.bg}`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black uppercase tracking-wider ${link.color}`}>{link.name}</span>
            </div>
            <ExternalLink size={16} className={link.color} />
          </a>
        ))}
      </div>
    </div>
  )
}
