import {
  AlertCircle,
  Archive,
  Bell,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  HelpCircle,
  Home,
  KeyRound,
  MessageCircle,
  Send,
  Trash2,
  UploadCloud,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'

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

type ChatMessage = {
  id: number
  author: 'applicant' | 'worker'
  name: string
  text: string
  time: string
}

type ProfileSection = 'password' | 'applications' | 'household' | 'notifications' | 'help'

const profileSections: Array<{
  id: ProfileSection
  label: string
  icon: typeof KeyRound
  title: string
  detail: string
  items: string[]
}> = [
  {
    id: 'password',
    label: 'Password',
    icon: KeyRound,
    title: 'Password and security',
    detail: 'Keep Maria’s account secure and review recent sign-in settings.',
    items: ['Password last changed Sep 18', 'Two-step verification available', 'Recovery email: maria.santos@example.com'],
  },
  {
    id: 'applications',
    label: 'Past applications',
    icon: Archive,
    title: 'Past applications',
    detail: 'Review previous submissions and closed application packets.',
    items: ['2024 public housing update: archived', '2023 preference update: completed', 'Download application history'],
  },
  {
    id: 'household',
    label: 'Household',
    icon: Users,
    title: 'Household profile',
    detail: 'Manage household members and contact information used for review.',
    items: ['Primary applicant: Maria Santos', 'Household size: 3', 'Mailing address verification pending'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    title: 'Notification preferences',
    detail: 'Choose how CHA sends reminders and application updates.',
    items: ['Email reminders enabled', 'Text reminders not enabled', 'Deadline alerts sent 5 days before due date'],
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    title: 'Help and support',
    detail: 'Find assistance for uploads, accessibility, and application questions.',
    items: ['CHA intake line: 617-555-0142', 'Upload help available weekdays', 'Reasonable accommodation support available'],
  },
]

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

function currentTime() {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
}

const suggestedQuestions = [
  'What income proof can I upload?',
  'How do I prove Cambridge residency?',
  'When is my deadline?',
  'How long does review take?',
  'Do I need optional documents?',
]

function getWorkerReply(question: string, openTasks: UploadSlot[]) {
  const normalized = question.toLowerCase()

  if (normalized.includes('income') || normalized.includes('pay') || normalized.includes('stub') || normalized.includes('benefit')) {
    return 'For proof of income, please upload recent pay stubs, a benefits letter, a Social Security award letter, or an employer statement. A PDF or clear photo is fine.'
  }

  if (normalized.includes('residen') || normalized.includes('cambridge') || normalized.includes('preference') || normalized.includes('address')) {
    return 'For Cambridge residency preference, upload a lease, utility bill, school record, employer record, or another document showing a Cambridge address or connection.'
  }

  if (normalized.includes('deadline') || normalized.includes('due') || normalized.includes('late')) {
    return 'Your required documents are due by Oct 8. If you need more time, send us a note here and upload what you have as soon as possible.'
  }

  if (normalized.includes('review') || normalized.includes('long') || normalized.includes('time') || normalized.includes('eta')) {
    return openTasks.length === 0
      ? 'Your required documents are complete. Eligibility review usually begins within about 2 days.'
      : `Review can begin after the required checklist is complete. Right now, I still see ${openTasks.length} required item${openTasks.length === 1 ? '' : 's'} left.`
  }

  if (normalized.includes('optional') || normalized.includes('lease') || normalized.includes('accommodation')) {
    return 'Optional documents are not required to start review, but they can help if they apply to your situation, such as housing history or a reasonable accommodation request.'
  }

  if (normalized.includes('upload') || normalized.includes('file') || normalized.includes('document')) {
    const nextNeeded = openTasks[0]?.title.toLowerCase()
    return nextNeeded
      ? `The next required upload is ${nextNeeded}. Use the Upload button on that checklist row, or the Upload next button at the top.`
      : 'All required uploads are already submitted. You can replace a file from the checklist if something needs to change.'
  }

  return 'I can help with income proof, Cambridge residency, deadlines, review timing, uploads, and optional documents. Choose one of the quick questions below or type your question another way.'
}

function App() {
  const [uploadSlots, setUploadSlots] = useState(initialSlots)
  const [activity, setActivity] = useState(initialActivity)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [workerTyping, setWorkerTyping] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeProfileSection, setActiveProfileSection] = useState<ProfileSection>('password')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      author: 'worker',
      name: 'Alicia, CHA intake',
      text: 'Hi Maria, I can help with your application documents. What would you like to ask?',
      time: currentTime(),
    },
  ])
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const requiredDocs = uploadSlots.filter((slot) => slot.required)
  const readyDocs = requiredDocs.filter((slot) => slot.state === 'approved' || slot.state === 'uploaded')
  const openTasks = requiredDocs.filter((slot) => slot.state === 'needed' || slot.state === 'changes')
  const optionalDocs = uploadSlots.filter((slot) => !slot.required)
  const allDocsReady = openTasks.length === 0
  const applicationProgress = Math.min(100, Math.round(40 + (readyDocs.length / requiredDocs.length) * 50))
  const timelineProgress = allDocsReady ? 75 : 50
  const reviewEta = allDocsReady ? '2 days' : `${openTasks.length + 3} days`
  const notificationCount = openTasks.length
  const documentsToShow = [
    ...openTasks,
    ...requiredDocs.filter((slot) => !openTasks.includes(slot)),
    ...optionalDocs,
  ]
  const activeProfile = profileSections.find((section) => section.id === activeProfileSection) ?? profileSections[0]
  const ActiveProfileIcon = activeProfile.icon

  const stages: Array<{ title: string; detail: string; state: StageState; completedDate?: string }> = [
    { title: 'Submitted', detail: 'Application received', state: 'complete', completedDate: 'Sep 29' },
    { title: 'Verified', detail: 'Identity confirmed', state: 'complete', completedDate: 'Oct 1' },
    {
      title: 'Documents',
      detail: allDocsReady ? 'All required docs ready' : `${openTasks.length} item${openTasks.length === 1 ? '' : 's'} left`,
      state: allDocsReady ? 'complete' : 'current',
      completedDate: allDocsReady ? 'Today' : undefined,
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

  const openChat = () => {
    setChatOpen(true)
    addActivity('Chat opened with CHA intake')
  }

  const sendChatMessage = (event?: FormEvent<HTMLFormElement>, presetQuestion?: string) => {
    event?.preventDefault()
    const text = (presetQuestion ?? chatInput).trim()
    if (!text) return

    setChatMessages((messages) => [
      ...messages,
      {
        id: Date.now(),
        author: 'applicant',
        name: 'Maria',
        text,
        time: currentTime(),
      },
    ])
    setChatInput('')
    setWorkerTyping(true)

    window.setTimeout(() => {
      setChatMessages((messages) => [
        ...messages,
        {
          id: Date.now() + 1,
          author: 'worker',
          name: 'Alicia, CHA intake',
          text: getWorkerReply(text, openTasks),
          time: currentTime(),
        },
      ])
      setWorkerTyping(false)
      addActivity('CHA intake replied in chat')
    }, 700)
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
          <button className="icon-button profile-button" type="button" aria-label="Open applicant profile" onClick={() => setProfileOpen(true)}>
            <UserRound aria-hidden="true" size={20} />
            {notificationCount > 0 ? <span aria-label={`${notificationCount} notifications`} /> : null}
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
              <button className="secondary" type="button" onClick={openChat}>
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
                  {slot.state === 'approved' || slot.state === 'uploaded' ? <CheckCircle2 size={20} /> : <UploadCloud size={20} />}
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
                  <time>{stage.completedDate ? `Completed ${stage.completedDate}` : '\u00a0'}</time>
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

      {chatOpen ? (
        <section className="chat-shell" aria-label="CHA intake chat">
          <div className="chat-panel">
            <header className="chat-header">
              <div>
                <span className="eyebrow">Connected now</span>
                <h3><MessageCircle aria-hidden="true" size={19} /> CHA intake chat</h3>
                <p>Alicia from the intake team is available.</p>
              </div>
              <button type="button" aria-label="Close chat" onClick={() => setChatOpen(false)}>
                <X aria-hidden="true" size={18} />
              </button>
            </header>

            <div className="chat-messages" aria-live="polite">
              {chatMessages.map((message) => (
                <article key={message.id} className={`chat-message ${message.author}`}>
                  <span>{message.name} · {message.time}</span>
                  <p>{message.text}</p>
                </article>
              ))}
              {workerTyping ? (
                <article className="chat-message worker typing">
                  <span>Alicia, CHA intake</span>
                  <p>Typing...</p>
                </article>
              ) : null}
            </div>

            <div className="quick-questions" aria-label="Suggested questions">
              {suggestedQuestions.map((question) => (
                <button key={question} type="button" onClick={() => sendChatMessage(undefined, question)}>
                  {question}
                </button>
              ))}
            </div>

            <form className="chat-compose" onSubmit={sendChatMessage}>
              <input
                aria-label="Message CHA intake"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about your documents"
              />
              <button type="submit" aria-label="Send message">
                <Send aria-hidden="true" size={18} />
              </button>
            </form>
          </div>
        </section>
      ) : null}

      {profileOpen ? (
        <section className="account-shell" aria-label="Applicant account navigation">
          <aside className="account-panel">
            <header className="account-header">
              <div>
                <span className="eyebrow">Applicant account</span>
                <h3>Maria Santos</h3>
                <p>Manage account and application settings.</p>
              </div>
              <button type="button" aria-label="Close profile menu" onClick={() => setProfileOpen(false)}>
                <X aria-hidden="true" size={18} />
              </button>
            </header>

            <nav className="account-nav" aria-label="Profile sections">
              {profileSections.map((section) => {
                const Icon = section.icon

                return (
                  <button
                    key={section.id}
                    className={activeProfileSection === section.id ? 'active' : ''}
                    type="button"
                    onClick={() => setActiveProfileSection(section.id)}
                  >
                    <Icon aria-hidden="true" size={18} />
                    {section.label}
                  </button>
                )
              })}
            </nav>

            <section className="account-detail" aria-live="polite">
              <ActiveProfileIcon aria-hidden="true" size={24} />
              <h3>{activeProfile.title}</h3>
              <p>{activeProfile.detail}</p>
              <div>
                {activeProfile.items.map((item) => (
                  <article key={item}>
                    <CheckCircle2 aria-hidden="true" size={17} />
                    <span>{item}</span>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </section>
      ) : null}
    </main>
  )
}

export default App
