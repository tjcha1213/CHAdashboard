import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Home,
  Send,
  Trash2,
  UploadCloud,
  UserRound,
} from 'lucide-react'
import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type StageState = 'complete' | 'current' | 'upcoming'
type DocumentState = 'approved' | 'uploaded' | 'needed' | 'optional' | 'changes'
type SlotId = 'photo-id' | 'income' | 'household' | 'residency' | 'lease' | 'accommodation'

type UploadSlot = {
  id: SlotId
  title: string
  description: string
  state: DocumentState
  due: string
  owner: string
  required: boolean
  accepted: string
  fileName?: string
  fileSize?: string
  updated: string
}

type ActivityItem = {
  date: string
  note: string
}

const initialSlots: UploadSlot[] = [
  {
    id: 'photo-id',
    title: 'Photo ID',
    description: 'Driver license, passport, state ID, or other government-issued identification.',
    state: 'approved',
    due: 'Approved Oct 1',
    owner: 'Primary applicant',
    required: true,
    accepted: '.pdf,.jpg,.jpeg,.png',
    fileName: 'santos-driver-license.pdf',
    fileSize: '1.2 MB',
    updated: 'Oct 1',
  },
  {
    id: 'income',
    title: 'Proof of income',
    description: 'Recent pay stubs, benefit letter, Social Security award, or employer statement.',
    state: 'needed',
    due: 'Due Oct 8',
    owner: 'Household income',
    required: true,
    accepted: '.pdf,.jpg,.jpeg,.png',
    updated: 'Oct 3',
  },
  {
    id: 'household',
    title: 'Household members',
    description: 'Birth certificates, custody documentation, or school records for household members.',
    state: 'uploaded',
    due: 'Uploaded Oct 2',
    owner: 'Family composition',
    required: true,
    accepted: '.pdf,.jpg,.jpeg,.png',
    fileName: 'household-documents.pdf',
    fileSize: '2.4 MB',
    updated: 'Oct 2',
  },
  {
    id: 'residency',
    title: 'Residency preference',
    description: 'Cambridge address, employment record, school enrollment, or preference verification.',
    state: 'needed',
    due: 'Due Oct 8',
    owner: 'Preference review',
    required: true,
    accepted: '.pdf,.jpg,.jpeg,.png',
    updated: 'Oct 3',
  },
  {
    id: 'lease',
    title: 'Lease or housing history',
    description: 'Current lease, shelter letter, landlord contact, or recent housing history statement.',
    state: 'optional',
    due: 'Optional',
    owner: 'Housing history',
    required: false,
    accepted: '.pdf,.jpg,.jpeg,.png',
    updated: 'Sep 29',
  },
  {
    id: 'accommodation',
    title: 'Reasonable accommodation',
    description: 'Upload only if requesting an accommodation for disability-related housing needs.',
    state: 'optional',
    due: 'Optional',
    owner: 'Accessibility',
    required: false,
    accepted: '.pdf,.jpg,.jpeg,.png',
    updated: 'Sep 29',
  },
]

const initialActivity: ActivityItem[] = [
  { date: 'Oct 3', note: 'Proof of income reminder sent' },
  { date: 'Oct 2', note: 'Household member documents uploaded' },
  { date: 'Oct 1', note: 'Photo ID approved by intake staff' },
]

const stateLabel: Record<DocumentState, string> = {
  approved: 'Approved',
  uploaded: 'Submitted',
  needed: 'Needed',
  optional: 'Optional',
  changes: 'Needs fix',
}

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function App() {
  const [uploadSlots, setUploadSlots] = useState(initialSlots)
  const [activity, setActivity] = useState(initialActivity)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const requiredDocs = uploadSlots.filter((slot) => slot.required)
  const readyDocs = requiredDocs.filter((slot) => slot.state === 'approved' || slot.state === 'uploaded')
  const openTasks = requiredDocs.filter((slot) => slot.state === 'needed' || slot.state === 'changes')
  const optionalDocs = uploadSlots.filter((slot) => !slot.required)
  const allDocsReady = openTasks.length === 0
  const applicationProgress = Math.min(100, Math.round(40 + (readyDocs.length / requiredDocs.length) * 50))
  const timelineProgress = allDocsReady ? 75 : 50
  const reviewEta = allDocsReady ? '2 days' : `${openTasks.length + 3} days`
  const documentsToShow = [
    ...openTasks,
    ...requiredDocs.filter((slot) => !openTasks.includes(slot)),
    ...optionalDocs,
  ]

  const stages: Array<{ title: string; detail: string; state: StageState }> = [
    { title: 'Submitted', detail: 'Application received', state: 'complete' },
    { title: 'Verified', detail: 'Identity confirmed', state: 'complete' },
    {
      title: 'Documents',
      detail: allDocsReady ? 'All required docs ready' : `${openTasks.length} item${openTasks.length === 1 ? '' : 's'} left`,
      state: allDocsReady ? 'complete' : 'current',
    },
    {
      title: 'Review',
      detail: allDocsReady ? 'Ready for CHA' : 'Starts after documents',
      state: allDocsReady ? 'current' : 'upcoming',
    },
    { title: 'Placement', detail: 'Waitlist update', state: 'upcoming' },
  ]

  const addActivity = (note: string) => {
    setActivity((items) => [{ date: 'Today', note }, ...items].slice(0, 5))
  }

  const updateSlot = (slotId: SlotId, updater: (slot: UploadSlot) => UploadSlot) => {
    setUploadSlots((slots) => slots.map((slot) => (slot.id === slotId ? updater(slot) : slot)))
  }

  const handleFileUpload = (slotId: SlotId, fileList: FileList | null) => {
    const file = fileList?.[0]
    if (!file) return

    const title = uploadSlots.find((slot) => slot.id === slotId)?.title ?? 'Document'
    updateSlot(slotId, (slot) => ({
      ...slot,
      fileName: file.name,
      fileSize: fileSize(file.size),
      state: 'uploaded',
      due: 'Submitted today',
      updated: 'Today',
    }))
    addActivity(`${title} submitted`)
  }

  const removeUpload = (slotId: SlotId) => {
    const title = uploadSlots.find((slot) => slot.id === slotId)?.title ?? 'Document'
    updateSlot(slotId, (slot) => ({
      ...slot,
      fileName: undefined,
      fileSize: undefined,
      state: slot.required ? 'needed' : 'optional',
      due: slot.required ? 'Due Oct 8' : 'Optional',
      updated: 'Today',
    }))
    addActivity(`${title} removed`)
  }

  return (
    <main className="app-shell">
      <section className="dashboard">
        <header className="topbar">
          <div>
            <span className="eyebrow">Cambridge Housing Authority</span>
            <h1>Applicant dashboard</h1>
          </div>
          <button className="icon-button" type="button" aria-label="Open applicant profile">
            <UserRound aria-hidden="true" size={20} />
          </button>
        </header>

        <section className="hero simple-hero">
          <div className="hero-main">
            <span className="status-pill">Application ID CHA-2026-1842</span>
            <h2>{allDocsReady ? 'Ready for review' : `${openTasks.length} document${openTasks.length === 1 ? '' : 's'} left`}</h2>
            <p>{allDocsReady ? 'Maria’s required documents are complete. CHA can begin eligibility review.' : 'Finish the items below so CHA can start eligibility review.'}</p>
            <div className="hero-actions">
              <button type="button" onClick={() => inputRefs.current[openTasks[0]?.id ?? 'income']?.click()}>
                <UploadCloud aria-hidden="true" size={18} /> Upload next
              </button>
              <button className="secondary" type="button" onClick={() => addActivity('Message sent to CHA intake team')}>
                <Send aria-hidden="true" size={18} /> Message CHA
              </button>
            </div>
          </div>
          <aside className="quick-card" aria-label="Application summary">
            <strong>{readyDocs.length}/{requiredDocs.length}</strong>
            <span>required documents ready</span>
            <div className="mini-progress" style={{ '--progress': `${applicationProgress}%` } as CSSProperties}>
              <i />
            </div>
            <small>{applicationProgress}% complete · Review ETA {reviewEta}</small>
          </aside>
        </section>

        <section className="panel task-panel" aria-label="Document checklist">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Next steps</span>
              <h3>Document checklist</h3>
            </div>
            <b>{allDocsReady ? 'Ready' : `${openTasks.length} left`}</b>
          </div>

          <div className="simple-doc-list">
            {documentsToShow.map((slot) => (
              <article key={slot.id} className={`simple-doc ${slot.state}`}>
                <input
                  ref={(node) => {
                    inputRefs.current[slot.id] = node
                  }}
                  type="file"
                  accept={slot.accepted}
                  onChange={(event) => handleFileUpload(slot.id, event.target.files)}
                />
                <div className="doc-status-icon">
                  {slot.state === 'approved' ? <CheckCircle2 size={20} /> : slot.fileName ? <FileText size={20} /> : <UploadCloud size={20} />}
                </div>
                <div className="doc-main">
                  <div>
                    <span>{slot.required ? 'Required' : 'Optional'}</span>
                    <h4>{slot.title}</h4>
                  </div>
                  <p>{slot.description}</p>
                  <small>{slot.fileName ? `${slot.fileName} · ${slot.fileSize}` : slot.due}</small>
                </div>
                <div className="doc-actions">
                  <strong>{stateLabel[slot.state]}</strong>
                  <button type="button" onClick={() => inputRefs.current[slot.id]?.click()}>
                    <UploadCloud aria-hidden="true" size={16} /> {slot.fileName ? 'Replace' : 'Upload'}
                  </button>
                  {slot.fileName ? (
                    <button className="quiet-danger" type="button" onClick={() => removeUpload(slot.id)} aria-label={`Remove ${slot.title}`}>
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-grid">
          <section className="panel process-panel" aria-label="Application process status">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Application process</span>
                <h3>Progress</h3>
              </div>
              <b>{applicationProgress}%</b>
            </div>
            <div className="process-axis" style={{ '--progress': `${timelineProgress}%` } as CSSProperties}>
              <i />
            </div>
            <div className="process-steps">
              {stages.map((stage, index) => (
                <article key={stage.title} className={stage.state}>
                  <span>{stage.state === 'complete' ? <CheckCircle2 aria-hidden="true" size={16} /> : index + 1}</span>
                  <strong>{stage.title}</strong>
                  <small>{stage.detail}</small>
                </article>
              ))}
            </div>
          </section>

          <section className="panel summary-panel" aria-label="Application summary">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">At a glance</span>
                <h3>Status</h3>
              </div>
            </div>
            <div className="summary-list">
              <article>
                <FileCheck2 aria-hidden="true" size={20} />
                <div>
                  <strong>{readyDocs.length} of {requiredDocs.length} ready</strong>
                  <p>Required documents</p>
                </div>
              </article>
              <article>
                <Clock3 aria-hidden="true" size={20} />
                <div>
                  <strong>{reviewEta}</strong>
                  <p>Estimated review timing</p>
                </div>
              </article>
              <article>
                <AlertCircle aria-hidden="true" size={20} />
                <div>
                  <strong>{allDocsReady ? 'No action needed' : `${openTasks.length} action${openTasks.length === 1 ? '' : 's'} needed`}</strong>
                  <p>{allDocsReady ? 'Waiting for CHA review' : 'Upload or correct documents'}</p>
                </div>
              </article>
            </div>
          </section>
        </section>

        <section className="lower-grid">
          <section className="panel program-panel" aria-label="Program applications">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Programs</span>
                <h3>Application tracks</h3>
              </div>
            </div>
            <article>
              <Building2 aria-hidden="true" size={20} />
              <div>
                <strong>Public Housing</strong>
                <p>{allDocsReady ? 'Ready for intake review.' : 'Waiting on required documents.'}</p>
              </div>
              <span>{allDocsReady ? 'Reviewing' : 'Pending'}</span>
            </article>
            <article>
              <Home aria-hidden="true" size={20} />
              <div>
                <strong>Housing Choice Voucher</strong>
                <p>{allDocsReady ? 'Document packet complete.' : 'Queued until documents are complete.'}</p>
              </div>
              <span>{allDocsReady ? 'Ready' : 'Queued'}</span>
            </article>
          </section>

          <section className="panel activity-panel" aria-label="Recent application activity">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Activity</span>
                <h3>Recent updates</h3>
              </div>
            </div>
            {activity.map((item, index) => (
              <article key={`${item.date}-${item.note}-${index}`}>
                <time>{item.date}</time>
                <p>{item.note}</p>
              </article>
            ))}
          </section>
        </section>
      </section>
    </main>
  )
}

export default App
