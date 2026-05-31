const fs = require('fs');
const file = 'c:/Users/SIS/OneDrive/Desktop/IMPORTANT/Infofriyends Brain/src/components/IdeaAgreementHub.tsx';
let data = fs.readFileSync(file, 'utf8');

const fix2 = data.replace(
  `                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-zinc-500 font-bold">Expected Duration (Hours)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.5"
                    required
                    value={convertDuration}
                    onChange={(e) => setConvertDuration(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g., 5"
                    className="w-full bg-zinc-950/60 border border-emerald-500/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50" 
                  />
                  <p className="text-[8px] text-emerald-500/70 font-bold mt-1.5">*Points: 1h=1pt | 2-3h=2pt | 4h+=5pt</p>
                </div>`,
  `                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-zinc-500 font-bold">Expected Deadline</label>
                    <DateTimePicker 
                      value={convertDeadline}
                      onChange={setConvertDeadline}
                      placeholder="Select Deadline"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-zinc-500 font-bold">Expected Effort (Points)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="0"
                        required
                        value={convertExpectedDays}
                        onChange={(e) => setConvertExpectedDays(e.target.value ? Number(e.target.value) : '')}
                        placeholder="Days (1 Day = 5 Pts)"
                        className="w-full bg-zinc-950/60 border border-emerald-500/10 rounded-xl px-2 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50" 
                      />
                      <input 
                        type="number" 
                        min="0"
                        required
                        value={convertExpectedHours}
                        onChange={(e) => setConvertExpectedHours(e.target.value ? Number(e.target.value) : '')}
                        placeholder="Hours (1 Hr = 1 Pt)"
                        className="w-full bg-zinc-950/60 border border-emerald-500/10 rounded-xl px-2 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50" 
                      />
                    </div>
                    <p className="text-[8px] text-emerald-500/70 font-bold mt-1.5">*Total Points = (Days × 5) + Hours</p>
                  </div>
                </div>`
)

fs.writeFileSync(file, fix2);
console.log('Fixed IdeaAgreementHub UI');
