const fs = require('fs');
const file = 'c:/Users/SIS/OneDrive/Desktop/IMPORTANT/Infofriyends Brain/src/components/IdeaAgreementHub.tsx';
let data = fs.readFileSync(file, 'utf8');

const fix1 = data.replace(
  `        const res = await updateWorkStatus(ideaId, 'COMPLETED', undefined, 0)
        if (res.success) {
          setConvertModalId(null)
  async function handleConvertSubmit(e: React.FormEvent, ideaId: string) {
    e.preventDefault()
    setActionId(ideaId)
    const formData = new FormData()
    convertAssigneeIds.forEach(id => formData.append('assigneeIds', id))
    
    // Calculate total hours
    const days = convertExpectedDays !== '' ? Number(convertExpectedDays) : 0
    const hours = convertExpectedHours !== '' ? Number(convertExpectedHours) : 0
    const totalHours = (days * 5) + hours
    
    if (totalHours > 0) {
      formData.append('expectedDurationHours', totalHours.toString())
    }
    if (convertDeadline) {
      formData.append('dueDate', convertDeadline.toISOString())
    }
    
    try {
      const res = await convertIdeaToWork(ideaId, formData)
      if (res.success) {`,
  `        const res = await updateWorkStatus(ideaId, 'COMPLETED', undefined, 0)
        if (res.success) {
          setConvertModalId(null)
        } else alert(res.error || 'Failed to complete idea')
      } catch (err) { console.error(err) }
      finally { setActionId(null) }
      return
    }

    const formData = new FormData()
    convertAssigneeIds.forEach(id => formData.append('assigneeIds', id))
    
    // Calculate total hours
    const days = convertExpectedDays !== '' ? Number(convertExpectedDays) : 0
    const hours = convertExpectedHours !== '' ? Number(convertExpectedHours) : 0
    const totalHours = (days * 5) + hours
    
    if (totalHours > 0) {
      formData.append('expectedDurationHours', totalHours.toString())
    }
    if (convertDeadline) {
      formData.append('dueDate', convertDeadline.toISOString())
    }

    try {
      const res = await convertIdeaToWork(ideaId, formData)
      if (res.success) {`
)

fs.writeFileSync(file, fix1);
console.log('Fixed IdeaAgreementHub handleConvertSubmit');
