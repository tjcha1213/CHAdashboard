import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Home,
  Inbox,
  RotateCcw,
  Send,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserRound,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
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
  { date: 'Sep 29', note: 'Application submitted' },
]

const stateLabel: Record<DocumentState, string> = {
  approved: 'Approved',
  uploaded: 'Uploaded',
  needed: 'Needed',
  optional: 'Optional',
  changes: 'Changes requested',
}

const stateOrder: DocumentState[] = ['needed', 'changes', 'uploaded', 'approved', 'optional']

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function App() {
  const [uploadSlots, setUploadSlots] = useState(initialSlots)
  const [activity, setActivity] = useState(initialActivity)
  const [selectedSlotId, setSelectedSlotId] = useState<SlotId>('income')
  const [filter, setFilter] = useState<'all' | DocumentState>('all')
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const requiredDocs = uploadSlots.filter((slot) => slot.required)
  const readyDocs = requiredDocs.filter((slot) => slot.state === 'approved' || slot.state === 'uploaded')
  const missingDocs = requiredDocs.filter((slot) => slot.state === 'needed' || slot.state === 'changes')
  const uploadedDocs = uploadSlots.filter((slot) => slot.state === 'uploaded').length
  const approvedDocs = uploadSlots.filter((slot) => slot.state === 'approved').length
  const selectedSlot = uploadSlots.find((slot) => slot.id === selectedSlotId) ?? uploadSlots[0]
  const applicationStatus = missingDocs.length === 0 ? 'Ready for eligibility review' : 'Documents pending'
  const reviewEta = missingDocs.length === 0 ? '2 days' : `${Math.max(2, missingDocs.length + 3)} days`
  const applicationProgress = Math.min(100, Math.round(35 + (readyDocs.length / requiredDocs.length) * 45 + approvedDocs * 3))
  const currentStageIndex = missingDocs.length === 0 ? 3 : 2
  const completedStages = missingDocs.length === 0 ? 3 : 2
  const timelineProgress = (currentStageIndex / 4) * 100

  const stages = useMemo(
    () => [
      { title: 'Application submitted', detail: 'Online form received', state: 'complete' as StageState },
      { title: 'Identity verified', detail: 'Applicant profile matched', state: 'complete' as StageState },
      {
        title: 'Documents pending',
        detail: missingDocs.length === 0 ? 'All required uploads ready' : `${missingDocs.length} upload${missingDocs.length === 1 ? '' : 's'} still needed`,
        state: missingDocs.length === 0 ? 'complete' as StageState : 'current' as StageState,
      },
      {
        title: 'Eligibility review',
        detail: missingDocs.length === 0 ? 'Ready for CHA reviewer' : 'Waiting for documents',
        state: missingDocs.length === 0 ? 'current' as StageState : 'upcoming' as StageState,
      },
      { title: 'Waitlist placement', detail: 'Voucher queue update', state: 'upcoming' as StageState },
    ],
    [missingDocs.length],
  )

  const visibleSlots = uploadSlots.filter((slot) => filter === 'all' || slot.state === filter)

  const addActivity = (note: string) => {
    setActivity((items) => [{ date: 'Today', note }, ...items].slice(0, 7))
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
      due: 'Uploaded today',
      updated: 'Today',
    }))
    setSelectedSlotId(slotId)
    addActivity(`${title} uploaded`)
  }

  const markApproved = (slotId: SlotId) => {
    const title = uploadSlots.find((slot) => slot.id === slotId)?.title ?? 'Document'
    updateSlot(slotId, (slot) => ({
      ...slot,
      state: 'approved',
      due: 'Approved today',
      updated: 'Today',
    }))
    addActivity(`${title} approved by intake staff`)
  }

  const requestChanges = (slotId: SlotId) => {
    const title = uploadSlots.find((slot) => slot.id === slotId)?.title ?? 'document'
    updateSlot(slotId, (slot) => ({
      ...slot,
      state: 'changes',
      due: 'Needs correction',
      updated: 'Today',
    }))
    addActivity(`Changes requested for ${title}`)
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

        <section className="hero">
          <div className="hero-main">
            <span className="status-pill">Application ID CHA-2026-1842</span>
            <h2>Maria Santos</h2>
            <p>
              {missingDocs.length === 0
                ? 'All required documents are ready for CHA eligibility review.'
                : `${missingDocs.length} required document${missingDocs.length === 1 ? '' : 's'} still need attention before review can begin.`}
            </p>
            <div className="hero-actions">
              <button type="button" onClick={() => inputRefs.current[missingDocs[0]?.id ?? selectedSlot.id]?.click()}>
                <UploadCloud aria-hidden="true" size={18} /> Upload next document
              </button>
              <button className="secondary" type="button" onClick={() => addActivity('Message sent to CHA intake team')}>
                <Send aria-hidden="true" size={18} /> Contact intake
              </button>
            </div>
          </div>
          <aside className="hero-summary" aria-label="Application summary">
            <div>
              <span>Application status</span>
              <strong>{applicationStatus}</strong>
            </div>
            <div>
              <span>Next deadline</span>
              <strong>{missingDocs.length === 0 ? 'Reviewer queue' : 'Oct 8'}</strong>
            </div>
            <div>
              <span>Required docs</span>
              <strong>{readyDocs.length}/{requiredDocs.length}</strong>
            </div>
          </aside>
        </section>

        <section className="metrics" aria-label="Applicant progress metrics">
          <article>
            <FileCheck2 aria-hidden="true" size={22} />
            <span>Application progress</span>
            <strong>{applicationProgress}%</strong>
          </article>
          <article>
            <Inbox aria-hidden="true" size={22} />
            <span>Uploaded docs</span>
            <strong>{uploadedDocs + approvedDocs}/{uploadSlots.length}</strong>
          </article>
          <article>
            <Clock3 aria-hidden="true" size={22} />
            <span>Review ETA</span>
            <strong>{reviewEta}</strong>
          </article>
          <article>
            <Home aria-hidden="true" size={22} />
            <span>Program tracks</span>
            <strong>2</strong>
          </article>
        </section>

        <section className="content-grid">
          <section className="panel process-panel" aria-label="Application process status">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Application process</span>
                <h3>Status timeline</h3>
              </div>
              <b>{completedStages} complete</b>
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

          <section className="panel checklist-panel" aria-label="Immediate applicant actions">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Next actions</span>
                <h3>What Maria should do now</h3>
              </div>
            </div>
            <div className="action-list">
              {missingDocs.length === 0 ? (
                <article className="success">
                  <ShieldCheck aria-hidden="true" size={20} />
                  <div>
                    <strong>Ready for review</strong>
                    <p>CHA intake can now begin eligibility review for the active programs.</p>
                  </div>
                </article>
              ) : (
                missingDocs.map((slot) => (
                  <button key={slot.id} type="button" onClick={() => setSelectedSlotId(slot.id)}>
                    <AlertCircle aria-hidden="true" size={20} />
                    <div>
                      <strong>{slot.state === 'changes' ? 'Correct' : 'Upload'} {slot.title.toLowerCase()}</strong>
                      <p>{slot.description}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </section>

        <section className="panel documents-panel" aria-label="Document upload slots">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Upload center</span>
              <h3>Document slots</h3>
            </div>
            <b>{readyDocs.length} of {requiredDocs.length} required ready</b>
          </div>

          <div className="toolbar" aria-label="Document filters">
            <button className={filter === 'all' ? 'active' : ''} type="button" onClick={() => setFilter('all')}>All</button>
            {stateOrder.map((state) => (
              <button key={state} className={filter === state ? 'active' : ''} type="button" onClick={() => setFilter(state)}>
                {stateLabel[state]}
              </button>
            ))}
          </div>

          <div className="document-layout">
            <div className="document-grid">
              {visibleSlots.map((slot) => (
                <article key={slot.id} className={`document-card ${slot.state} ${slot.id === selectedSlot.id ? 'selected' : ''}`}>
                  <button className="document-open" type="button" onClick={() => setSelectedSlotId(slot.id)} aria-label={`View ${slot.title}`}>
                    <div className="document-icon">
                      {slot.state === 'approved'
                        ? <CheckCircle2 aria-hidden="true" size={20} />
                        : slot.state === 'needed' || slot.state === 'changes'
                          ? <UploadCloud aria-hidden="true" size={20} />
                          : <FileText aria-hidden="true" size={20} />}
                    </div>
                    <div>
                      <span>{slot.owner}</span>
                      <h4>{slot.title}</h4>
                      <p>{slot.description}</p>
                      {slot.fileName ? <small className="file-chip">{slot.fileName} · {slot.fileSize}</small> : null}
                    </div>
                  </button>
                  <footer>
                    <b>{stateLabel[slot.state]}</b>
                    <small>{slot.due}</small>
                  </footer>
                </article>
              ))}
            </div>

            <aside className={`slot-detail ${selectedSlot.state}`} aria-label="Selected document details">
              <span className="eyebrow">Selected slot</span>
              <h3>{selectedSlot.title}</h3>
              <p>{selectedSlot.description}</p>
              <dl>
                <div>
                  <dt>Status</dt>
                  <dd>{stateLabel[selectedSlot.state]}</dd>
                </div>
                <div>
                  <dt>Requirement</dt>
                  <dd>{selectedSlot.required ? 'Required' : 'Optional'}</dd>
                </div>
                <div>
                  <dt>Last update</dt>
                  <dd>{selectedSlot.updated}</dd>
                </div>
                <div>
                  <dt>File</dt>
                  <dd>{selectedSlot.fileName ?? 'No file uploaded'}</dd>
                </div>
              </dl>

              {uploadSlots.map((slot) => (
                <input
                  key={slot.id}
                  ref={(node) => {
                    inputRefs.current[slot.id] = node
                  }}
                  type="file"
                  accept={slot.accepted}
                  onChange={(event) => handleFileUpload(slot.id, event.target.files)}
                />
              ))}

              <div className="detail-actions">
                <button type="button" onClick={() => inputRefs.current[selectedSlot.id]?.click()}>
                  <UploadCloud aria-hidden="true" size={17} /> Upload file
                </button>
                <button type="button" onClick={() => markApproved(selectedSlot.id)} disabled={!selectedSlot.fileName}>
                  <CheckCircle2 aria-hidden="true" size={17} /> Approve
                </button>
                <button type="button" onClick={() => requestChanges(selectedSlot.id)} disabled={!selectedSlot.fileName}>
                  <RotateCcw aria-hidden="true" size={17} /> Request changes
                </button>
                <button className="danger" type="button" onClick={() => removeUpload(selectedSlot.id)} disabled={!selectedSlot.fileName}>
                  <Trash2 aria-hidden="true" size={17} /> Remove
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="lower-grid">
          <section className="panel program-panel" aria-label="Program applications">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Program status</span>
                <h3>Application tracks</h3>
              </div>
            </div>
            <article>
              <Building2 aria-hidden="true" size={20} />
              <div>
                <strong>Public Housing</strong>
                <p>{missingDocs.length === 0 ? 'Eligible for intake review. Reviewer assignment is next.' : 'Pre-screening active. Waiting on required uploads.'}</p>
              </div>
              <span>{missingDocs.length === 0 ? 'Reviewing' : 'Pending'}</span>
            </article>
            <article>
              <Home aria-hidden="true" size={20} />
              <div>
                <strong>Housing Choice Voucher</strong>
                <p>{missingDocs.length === 0 ? 'Document packet complete for voucher queue review.' : 'Applicant will enter eligibility review after document completion.'}</p>
              </div>
              <span>{missingDocs.length === 0 ? 'Ready' : 'Queued'}</span>
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
