const fs = require('fs');
const file = 'c:/Users/SIS/OneDrive/Desktop/IMPORTANT/Infofriyends Brain/src/components/WorkCard.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace state
data = data.replace(
  `  const [actualDuration, setActualDuration] = useState<number | ''>('')`,
  `  const [actualDays, setActualDays] = useState<number | ''>('')
  const [actualHours, setActualHours] = useState<number | ''>('')`
);

// Replace submitCompleteWork logic
const submitCompleteWorkLogic = `  async function submitCompleteWork(e: React.FormEvent) {
    e.preventDefault()
    if (!isAuthorized || (actualDays === '' && actualHours === '')) return
    setIsUpdating(true)
    
    const d = actualDays !== '' ? Number(actualDays) : 0
    const h = actualHours !== '' ? Number(actualHours) : 0
    const totalActual = (d * 5) + h
    
    try {
      await updateWorkStatus(work.id, 'COMPLETED', undefined, totalActual)
      setShowCompleteModal(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }`;

data = data.replace(
  /  async function submitCompleteWork\([\s\S]*?setIsUpdating\(false\)\n    \}\n  \}/,
  submitCompleteWorkLogic
);

// We need to calculate paused time and elapsed time.
// This is done inside the render.
const completeModalHtml = `      {/* Complete Work Form Dialog */}
      {showCompleteModal && (
        <form onSubmit={submitCompleteWork} className="mt-3 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-400" /> Confirm Completion
          </h4>
          <p className="text-[10px] text-emerald-300/80 leading-relaxed">
            Great job! Please specify the exact duration this task took to complete.
          </p>
          
          {work.startedAt && (
            <div className="bg-[#0c0d12]/50 p-3 rounded-xl border border-white/5 space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Started:</span>
                <span className="text-white font-medium">{new Date(work.startedAt).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
              </div>
              {work.totalBlockedHours > 0 && (
                <div className="flex justify-between text-[10px] text-orange-400/80">
                  <span>Paused Time:</span>
                  <span className="font-medium">{work.totalBlockedHours.toFixed(1)} Hours</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-emerald-400">Actual Effort (Days & Hours)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                min="0"
                required
                value={actualDays}
                onChange={(e) => setActualDays(e.target.value ? Number(e.target.value) : '')}
                placeholder="Days (1 Day = 5 Pts)"
                className="w-full bg-[#0c0d12]/60 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/70"
              />
              <input 
                type="number"
                min="0"
                required
                value={actualHours}
                onChange={(e) => setActualHours(e.target.value ? Number(e.target.value) : '')}
                placeholder="Hours (1 Hr = 1 Pt)"
                className="w-full bg-[#0c0d12]/60 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/70"
              />
            </div>
            <p className="text-[8px] text-emerald-500/70 font-bold mt-1.5">*Your final points will be (Days × 5) + Hours.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button"
              onClick={() => setShowCompleteModal(false)}
              className="px-2 py-1 text-[10px] text-emerald-400/70 hover:text-emerald-300"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isUpdating || (actualDays === '' && actualHours === '')}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isUpdating ? <Loader2 size={10} className="animate-spin" /> : null} Confirm Finish
            </button>
          </div>
        </form>
      )}`;

// Replace HTML
data = data.replace(
  /      \{\/\* Complete Work Form Dialog \*\/\}[\s\S]*?      \}\)\}/,
  completeModalHtml
);

fs.writeFileSync(file, data);
console.log('Fixed Complete Modal in WorkCard');
