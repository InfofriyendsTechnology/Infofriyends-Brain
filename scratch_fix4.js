const fs = require('fs');
const file = 'c:/Users/SIS/OneDrive/Desktop/IMPORTANT/Infofriyends Brain/src/components/IdeaAgreementHub.tsx';
let data = fs.readFileSync(file, 'utf8');

const fix3 = data.replace(
  `  const [editExpectedDuration, setEditExpectedDuration] = useState<number | ''>('')`,
  `  const [editExpectedDays, setEditExpectedDays] = useState<number | ''>('')
  const [editExpectedHours, setEditExpectedHours] = useState<number | ''>('')
  const [editDeadline, setEditDeadline] = useState<Date | null>(null)`
).replace(
  `    if (editExpectedDuration !== '') {
      formData.append('expectedDurationHours', editExpectedDuration.toString())
    }`,
  `    const days = editExpectedDays !== '' ? Number(editExpectedDays) : 0
    const hours = editExpectedHours !== '' ? Number(editExpectedHours) : 0
    const totalHours = (days * 5) + hours
    if (totalHours > 0) {
      formData.append('expectedDurationHours', totalHours.toString())
    }
    if (editDeadline) {
      formData.append('dueDate', editDeadline.toISOString())
    }`
).replace(
  `              <div className="space-y-1">
                <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Expected Duration (Hours)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.5"
                  value={editExpectedDuration}
                  onChange={(e) => setEditExpectedDuration(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#63BDF2]/50 transition-colors" 
                />
              </div>`,
  `              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Expected Deadline</label>
                  <DateTimePicker 
                    value={editDeadline}
                    onChange={setEditDeadline}
                    placeholder="Select Deadline"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Expected Effort (Points)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="0"
                      value={editExpectedDays}
                      onChange={(e) => setEditExpectedDays(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Days (1 Day = 5 Pts)"
                      className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#63BDF2]/50 transition-colors" 
                    />
                    <input 
                      type="number" 
                      min="0"
                      value={editExpectedHours}
                      onChange={(e) => setEditExpectedHours(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Hours (1 Hr = 1 Pt)"
                      className="w-full bg-[#0c0d12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#63BDF2]/50 transition-colors" 
                    />
                  </div>
                </div>
              </div>`
).replace(
  `setEditExpectedDuration(idea.expectedDurationHours || '')`,
  `setEditExpectedDays(idea.expectedDurationHours ? Math.floor(idea.expectedDurationHours / 5) : '')
      setEditExpectedHours(idea.expectedDurationHours ? idea.expectedDurationHours % 5 : '')
      setEditDeadline(idea.dueDate ? new Date(idea.dueDate) : null)`
)

fs.writeFileSync(file, fix3);
console.log('Fixed IdeaAgreementHub Edit Inline');
