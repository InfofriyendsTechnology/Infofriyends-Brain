const fs = require('fs');
const file = 'c:/Users/SIS/OneDrive/Desktop/IMPORTANT/Infofriyends Brain/src/components/WorkCard.tsx';
let data = fs.readFileSync(file, 'utf8');

const fix1 = data.replace(
  `<label className="text-[10px] font-black uppercase text-[#63BDF2] tracking-wider">Post Update & Log Time</label>`,
  `<label className="text-[10px] font-black uppercase text-[#63BDF2] tracking-wider">Post Update</label>`
);

const fix2 = fix1.replace(
  `                  {isActive && work.type === 'ACTION' && (
                    <div className="bg-[#63BDF2]/5 border border-[#63BDF2]/20 p-3 rounded-xl space-y-2">
                      <p className="text-[9px] text-[#63BDF2]/80 font-bold leading-relaxed">
                        <Clock size={10} className="inline mr-1" />
                        Log exact time to earn points. Select precise start and end times (Date & AM/PM matter).
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-muted-foreground">Start Date & Time</label>
                          <DateTimePicker 
                            value={updateStart}
                            onChange={(val) => setUpdateStart(val)}
                            placeholder="Select Start Time"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase text-muted-foreground">End Date & Time</label>
                          <DateTimePicker 
                            value={updateEnd}
                            onChange={(val) => setUpdateEnd(val)}
                            placeholder="Select End Time"
                          />
                        </div>
                      </div>
                    </div>
                  )}

`,
  ``
);

// We also need to fix handlePostUpdate to remove timeData parameter.
// Let's find handlePostUpdate in data
const fix3 = fix2.replace(
  `  async function handlePostUpdate() {
    if (!newUpdate.trim()) return
    setIsPostingUpdate(true)
    
    // Time data logic
    let timeData = undefined;
    if (isActive && work.type === 'ACTION' && updateStart && updateEnd) {
      const diffMs = updateEnd.getTime() - updateStart.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 0) {
        timeData = {
          startedAt: updateStart,
          endedAt: updateEnd,
          durationHours: diffHours
        };
      }
    }

    try {
      const res = await addWorkUpdate(work.id, newUpdate, timeData)
      if (res.success) {
        setNewUpdate('')
        setUpdateStart(null)
        setUpdateEnd(null)
      } else alert(res.error || 'Failed to post update')
    } catch (err) { console.error(err) }
    finally { setIsPostingUpdate(false) }
  }`,
  `  async function handlePostUpdate() {
    if (!newUpdate.trim()) return
    setIsPostingUpdate(true)

    try {
      const res = await addWorkUpdate(work.id, newUpdate)
      if (res.success) {
        setNewUpdate('')
      } else alert(res.error || 'Failed to post update')
    } catch (err) { console.error(err) }
    finally { setIsPostingUpdate(false) }
  }`
);

// And remove states
const fix4 = fix3.replace(
  `  const [updateStart, setUpdateStart] = useState<Date | null>(null)
  const [updateEnd, setUpdateEnd] = useState<Date | null>(null)`,
  ``
);

// Start Work Logic
const fix5 = fix4.replace(
  `            {!isActive && !isCompleted && !isArchived && (
              <button 
                onClick={() => handleStatusChange('ACTIVE')}
                disabled={isUpdating}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={10} className="animate-spin" /> : null} Start Active
              </button>
            )}`,
  `            {(!isActive || (isActive && !work.startedAt)) && !isCompleted && !isArchived && (
              <button 
                onClick={() => handleStatusChange('ACTIVE')}
                disabled={isUpdating}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={10} className="animate-spin" /> : null} {isActive ? 'Start Work' : 'Make Active'}
              </button>
            )}`
);

fs.writeFileSync(file, fix5);
console.log('Cleaned up WorkCard UI');
