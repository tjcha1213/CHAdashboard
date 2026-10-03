import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Home,
  Inbox,
  ShieldCheck,
  UploadCloud,
  UserRound,
} from 'lucide-react'
import type { CSSProperties } from 'react'

type StageState = 'complete' | 'current' | 'upcoming'
type DocumentState = 'approved' | 'uploaded' | 'needed' | 'optional'
type UploadSlot = {
  title: string
  description: string
  state: DocumentState
  due: string
  owner: string
}

const stages: Array<{ title: string; detail: string; state: StageState }> = [
  { title: 'Application submitted', detail: 'Online form received', state: 'complete' },
  { title: 'Identity verified', detail: 'Applicant profile matched', state: 'complete' },
  { title: 'Documents pending', detail: 'Two uploads still needed', state: 'current' },
  { title: 'Eligibility review', detail: 'CHA review team', state: 'upcoming' },
  { title: 'Waitlist placement', detail: 'Voucher queue update', state: 'upcoming' },
]

const uploadSlots: UploadSlot[] = [
  {
    title: 'Photo ID',
    description: 'Driver license, passport, state ID, or other government-issued identification.',
    state: 'approved',
    due: 'Approved Oct 1',
    owner: 'Primary applicant',
  },
  {
    title: 'Proof of income',
    description: 'Recent pay stubs, benefit letter, Social Security award, or employer statement.',
    state: 'needed',
    due: 'Due Oct 8',
    owner: 'Household income',
  },
  {
    title: 'Household members',
    description: 'Birth certificates, custody documentation, or school records for household members.',
    state: 'uploaded',
    due: 'Uploaded Oct 2',
    owner: 'Family composition',
  },
  {
    title: 'Residency preference',
    description: 'Cambridge address, employment record, school enrollment, or preference verification.',
    state: 'needed',
    due: 'Due Oct 8',
    owner: 'Preference review',
  },
  {
    title: 'Lease or housing history',
    description: 'Current lease, shelter letter, landlord contact, or recent housing history statement.',
    state: 'optional',
    due: 'Optional',
    owner: 'Housing history',
  },
  {
    title: 'Reasonable accommodation',
    description: 'Upload only if requesting an accommodation for disability-related housing needs.',
    state: 'optional',
    due: 'Optional',
    owner: 'Accessibility',
  },
]

const activity = [
  ['Oct 3', 'Proof of income reminder sent'],
  ['Oct 2', 'Household member documents uploaded'],
  ['Oct 1', 'Photo ID approved by intake staff'],
  ['Sep 29', 'Application submitted'],
]

const stateLabel: Record<DocumentState, string> = {
  approved: 'Approved',
  uploaded: 'Uploaded',
  needed: 'Needed',
  optional: 'Optional',
}

function App() {
  const completedStages = stages.filter((stage) => stage.state === 'complete').length
  const currentStageIndex = stages.findIndex((stage) => stage.state === 'current')
  const progress = (currentStageIndex / (stages.length - 1)) * 100
  const requiredDocs = uploadSlots.filter((slot) => slot.state !== 'optional')
  const completeDocs = requiredDocs.filter((slot) => slot.state === 'approved' || slot.state === 'uploaded')

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
            <p>Public housing and Housing Choice Voucher applicant. Review is waiting on required document uploads.</p>
            <div className="hero-actions">
              <button type="button"><UploadCloud aria-hidden="true" size={18} /> Upload documents</button>
              <button className="secondary" type="button"><ArrowUpRight aria-hidden="true" size={18} /> Contact intake</button>
            </div>
          </div>
          <aside className="hero-summary" aria-label="Application summary">
            <div>
              <span>Application status</span>
              <strong>Documents pending</strong>
            </div>
            <div>
              <span>Next deadline</span>
              <strong>Oct 8</strong>
            </div>
            <div>
              <span>Required docs</span>
              <strong>{completeDocs.length}/{requiredDocs.length}</strong>
            </div>
          </aside>
        </section>

        <section className="metrics" aria-label="Applicant progress metrics">
          <article>
            <FileCheck2 aria-hidden="true" size={22} />
            <span>Application progress</span>
            <strong>52%</strong>
          </article>
          <article>
            <Inbox aria-hidden="true" size={22} />
            <span>Document slots</span>
            <strong>{uploadSlots.length}</strong>
          </article>
          <article>
            <Clock3 aria-hidden="true" size={22} />
            <span>Review ETA</span>
            <strong>5 days</strong>
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
            <div className="process-axis" style={{ '--progress': `${progress}%` } as CSSProperties}>
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
              <article>
                <AlertCircle aria-hidden="true" size={20} />
                <div>
                  <strong>Upload proof of income</strong>
                  <p>Income documentation is required before eligibility review can begin.</p>
                </div>
              </article>
              <article>
                <ShieldCheck aria-hidden="true" size={20} />
                <div>
                  <strong>Confirm Cambridge preference</strong>
                  <p>Preference verification may affect placement priority.</p>
                </div>
              </article>
            </div>
          </section>
        </section>

        <section className="panel documents-panel" aria-label="Document upload slots">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Upload center</span>
              <h3>Document slots</h3>
            </div>
            <b>{completeDocs.length} of {requiredDocs.length} required ready</b>
          </div>
          <div className="document-grid">
            {uploadSlots.map((slot) => (
              <article key={slot.title} className={`document-card ${slot.state}`}>
                <div className="document-icon">
                  {slot.state === 'approved'
                    ? <CheckCircle2 aria-hidden="true" size={20} />
                    : slot.state === 'needed'
                      ? <UploadCloud aria-hidden="true" size={20} />
                      : <FileText aria-hidden="true" size={20} />}
                </div>
                <div>
                  <span>{slot.owner}</span>
                  <h4>{slot.title}</h4>
                  <p>{slot.description}</p>
                </div>
                <footer>
                  <b>{stateLabel[slot.state]}</b>
                  <small>{slot.due}</small>
                </footer>
              </article>
            ))}
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
                <p>Pre-screening active. Waiting on required uploads.</p>
              </div>
              <span>Pending</span>
            </article>
            <article>
              <Home aria-hidden="true" size={20} />
              <div>
                <strong>Housing Choice Voucher</strong>
                <p>Applicant will enter eligibility review after document completion.</p>
              </div>
              <span>Queued</span>
            </article>
          </section>

          <section className="panel activity-panel" aria-label="Recent application activity">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Activity</span>
                <h3>Recent updates</h3>
              </div>
            </div>
            {activity.map(([date, note]) => (
              <article key={`${date}-${note}`}>
                <time>{date}</time>
                <p>{note}</p>
              </article>
            ))}
          </section>
        </section>
      </section>
    </main>
  )
}

export default App
