export const statuses = ['open', 'pending', 'solved'] as const
export type Status = (typeof statuses)[number]

export const priorities = ['urgent', 'high', 'normal', 'low'] as const
export type Priority = (typeof priorities)[number]

export const agents = [
  'Unassigned',
  'Nadia Rahman',
  'Tomás Silva',
  'Grace Lee',
] as const
export type Agent = (typeof agents)[number]

export interface Message {
  from: 'customer' | 'agent'
  author: string
  /** "2026-11-17T09:40", in the help desk's time zone */
  at: string
  body: string
}

export interface Ticket {
  id: string
  subject: string
  customer: { name: string; company: string; email: string }
  status: Status
  priority: Priority
  assignee: Agent
  created: string
  updated: string
  messages: Message[]
}

/** The demo's "now", fixed so the server and browser show the same times */
export const NOW = '2026-11-17T15:00'

type Seed = [
  subject: string,
  name: string,
  company: string,
  status: Status,
  priority: Priority,
  assignee: Agent,
  created: string,
  updated: string,
  question: string,
  answer?: string,
]

const seeds: Seed[] = [
  [
    'Card declined on annual renewal',
    'Lena Fischer',
    'Brightwave',
    'open',
    'urgent',
    'Nadia Rahman',
    '2026-11-17T08:12',
    '2026-11-17T14:20',
    'Our renewal failed this morning and the workspace now shows a payment warning. The card works everywhere else.',
    'Thanks Lena, I can see two declined attempts from your bank. Could you check whether it blocked a charge from us?',
  ],
  [
    'SSO login loops back to the sign-in page',
    'Marcus Webb',
    'Northwind',
    'open',
    'urgent',
    'Unassigned',
    '2026-11-17T11:05',
    '2026-11-17T11:05',
    'Since this morning everyone using Okta lands back on the login screen after authenticating.',
  ],
  [
    'Export to CSV drops the last column',
    'Aiko Tanaka',
    'Kumo Labs',
    'open',
    'high',
    'Tomás Silva',
    '2026-11-16T16:40',
    '2026-11-17T10:02',
    'When I export the invoices view the Notes column is missing from the file.',
    'I reproduced it with views that have more than 12 columns. Our team is on it.',
  ],
  [
    'How do I add a second admin?',
    'Priya Shah',
    'Lumen Health',
    'pending',
    'low',
    'Grace Lee',
    '2026-11-15T09:30',
    '2026-11-16T12:15',
    'I am the only admin and I am going on leave. How do I give a colleague admin rights?',
    'Go to Settings › Members, open their profile and pick Admin under Role. Let me know if the option is missing.',
  ],
  [
    'Webhook retries flooding our endpoint',
    'Daniel Ortiz',
    'Shipfast',
    'open',
    'high',
    'Unassigned',
    '2026-11-17T07:55',
    '2026-11-17T13:48',
    'We returned 500s for ten minutes and are now getting thousands of retried events per minute.',
  ],
  [
    'Invoice shows the wrong VAT number',
    'Sofia Rossi',
    'Casa Verde',
    'open',
    'normal',
    'Grace Lee',
    '2026-11-14T10:10',
    '2026-11-16T17:30',
    'The November invoice has our old VAT number. We updated it in billing settings last month.',
    'I have regenerated the invoice with the new number. Could you confirm it looks right?',
  ],
  [
    'Feature request: dark mode for reports',
    'Owen Clarke',
    'Fieldnote',
    'solved',
    'low',
    'Tomás Silva',
    '2026-11-10T14:00',
    '2026-11-12T09:20',
    'Would love a dark theme for the reports page, we present them in dim rooms.',
    'Good news: dark mode for reports shipped this week. It follows your system setting.',
  ],
  [
    'API returns 429 well under our limit',
    'Hana Kim',
    'Datapane',
    'open',
    'high',
    'Nadia Rahman',
    '2026-11-16T19:22',
    '2026-11-17T09:41',
    'Our plan allows 600 requests per minute but we see 429s at around 200.',
  ],
  [
    'Cannot delete an archived project',
    'Luis Moreno',
    'Altamar',
    'pending',
    'normal',
    'Grace Lee',
    '2026-11-13T11:45',
    '2026-11-15T15:05',
    'The delete button is greyed out for archived projects.',
    'Archived projects need to be restored before deleting. Does that work for you?',
  ],
  [
    'Mobile app crashes when attaching photos',
    'Emma Novak',
    'Pilot Coffee',
    'open',
    'normal',
    'Unassigned',
    '2026-11-17T12:30',
    '2026-11-17T12:30',
    'On Android 15 the app closes as soon as I pick a photo from the gallery.',
  ],
  [
    'Change billing email',
    'Tariq Haddad',
    'Oasis Travel',
    'solved',
    'low',
    'Nadia Rahman',
    '2026-11-11T08:00',
    '2026-11-11T10:30',
    'Please send invoices to finance@oasis.example instead.',
    'Done, future invoices will go to finance@oasis.example.',
  ],
  [
    'Slack notifications stopped arriving',
    'Julia Becker',
    'Moss & Co',
    'open',
    'normal',
    'Tomás Silva',
    '2026-11-16T13:10',
    '2026-11-17T08:55',
    'Nothing has posted to our #alerts channel since Friday.',
    'Could you try reconnecting Slack under Integrations? A token change on Slack’s side can cause this.',
  ],
  [
    'Data residency for EU customers',
    'Pierre Laurent',
    'Novacité',
    'pending',
    'high',
    'Grace Lee',
    '2026-11-12T15:00',
    '2026-11-16T09:45',
    'Can we keep all our data in EU data centers? Our legal team needs this before signing.',
    'Yes, EU hosting is available on Business plans. I have sent the data processing agreement for review.',
  ],
  [
    'Duplicate charges this month',
    'Grace Mensah',
    'Akwaaba Foods',
    'open',
    'urgent',
    'Nadia Rahman',
    '2026-11-17T09:15',
    '2026-11-17T14:52',
    'We were charged twice for November, see attached statement.',
  ],
  [
    'Timezone wrong on scheduled reports',
    'Ivan Petrov',
    'Sever',
    'open',
    'low',
    'Unassigned',
    '2026-11-15T18:20',
    '2026-11-15T18:20',
    'Reports scheduled for 8:00 arrive at 7:00 since the clocks changed.',
  ],
  [
    'Add custom fields to contacts',
    'Mia Johansson',
    'Nordlys',
    'solved',
    'normal',
    'Tomás Silva',
    '2026-11-08T10:00',
    '2026-11-10T16:40',
    'Is there a way to store a contract end date on each contact?',
    'Yes, under Settings › Custom fields you can add a date field to contacts.',
  ],
  [
    'Search misses recent records',
    'Kofi Asante',
    'Tro Tro',
    'open',
    'high',
    'Grace Lee',
    '2026-11-17T10:40',
    '2026-11-17T13:05',
    'Records created in the last hour do not show up in search results.',
  ],
  [
    'Request for a security questionnaire',
    'Nora Lindqvist',
    'Fjell Bank',
    'pending',
    'normal',
    'Nadia Rahman',
    '2026-11-14T13:30',
    '2026-11-16T11:00',
    'Our vendor review needs your SOC 2 report and a completed questionnaire.',
    'I have shared the SOC 2 report through the trust portal and our team is filling in the questionnaire.',
  ],
  [
    'Bulk import stuck at 99%',
    'Ben Carter',
    'Ledgerly',
    'open',
    'normal',
    'Tomás Silva',
    '2026-11-17T06:50',
    '2026-11-17T09:10',
    'Importing 40,000 contacts has been at 99% for two hours.',
  ],
  [
    'Thanks for the quick fix!',
    'Ama Owusu',
    'Kente Studio',
    'solved',
    'low',
    'Grace Lee',
    '2026-11-13T09:00',
    '2026-11-13T09:40',
    'Just wanted to say the calendar sync works perfectly now.',
    'Great to hear, thanks for letting us know!',
  ],
  [
    'Password reset email never arrives',
    'Felix Wagner',
    'Holzwerk',
    'open',
    'high',
    'Unassigned',
    '2026-11-17T13:55',
    '2026-11-17T13:55',
    'Two of our users have requested resets several times and received nothing.',
  ],
  [
    'Downgrade plan at end of term',
    'Chloe Martin',
    'Petit Jour',
    'pending',
    'low',
    'Nadia Rahman',
    '2026-11-12T08:30',
    '2026-11-14T14:10',
    'We would like to move to the Team plan when our annual term ends.',
    'I have scheduled the change for your renewal date on January 3.',
  ],
]

const slug = (company: string) => company.toLowerCase().replace(/[^a-z]+/g, '')

export const tickets: Ticket[] = seeds.map(
  (
    [
      subject,
      name,
      company,
      status,
      priority,
      assignee,
      created,
      updated,
      question,
      answer,
    ],
    i,
  ) => ({
    id: `TCK-${1040 + i}`,
    subject,
    customer: {
      name,
      company,
      email: `${name.split(' ')[0].toLowerCase()}@${slug(company)}.example`,
    },
    status,
    priority,
    assignee,
    created,
    updated,
    messages: [
      { from: 'customer', author: name, at: created, body: question },
      ...(answer
        ? [
            {
              from: 'agent' as const,
              author: assignee === 'Unassigned' ? 'Support' : assignee,
              at: updated,
              body: answer,
            },
          ]
        : []),
    ],
  }),
)
