import type { Customer } from './columns'

const rows: [string, string, Customer['plan'], number][] = [
  ['Ava Thompson', 'Northwind', 'Enterprise', 4200],
  ['Liam Chen', 'Globex', 'Pro', 290],
  ['Sofia Patel', 'Initech', 'Pro', 290],
  ['Noah Garcia', 'Umbrella', 'Free', 0],
  ['Mia Johnson', 'Hooli', 'Enterprise', 3800],
  ['Ethan Kim', 'Vandelay', 'Pro', 580],
  ['Isabella Rossi', 'Stark Industries', 'Enterprise', 6100],
  ['Lucas Martin', 'Wayne Enterprises', 'Pro', 290],
  ['Amelia Novak', 'Acme', 'Free', 0],
  ['Mason Lee', 'Soylent', 'Pro', 870],
  ['Harper Wilson', 'Cyberdyne', 'Enterprise', 2900],
  ['Elijah Brown', 'Tyrell', 'Free', 0],
  ['Charlotte Davis', 'Massive Dynamic', 'Pro', 290],
  ['James Miller', 'Oscorp', 'Pro', 580],
  ['Evelyn Moore', 'Aperture', 'Enterprise', 5200],
  ['Benjamin Clark', 'Gringotts', 'Free', 0],
  ['Abigail Lewis', 'Pied Piper', 'Pro', 290],
  ['Henry Walker', 'Dunder Mifflin', 'Pro', 290],
  ['Emily Hall', 'Monsters Inc', 'Enterprise', 3100],
  ['Alexander Young', 'Wonka', 'Free', 0],
  ['Ella King', 'Bluth Company', 'Pro', 870],
  ['Daniel Wright', 'Prestige Worldwide', 'Pro', 290],
  ['Scarlett Lopez', 'Sterling Cooper', 'Enterprise', 4600],
  ['Matthew Hill', 'Los Pollos', 'Free', 0],
  ['Grace Scott', 'Paper Street', 'Pro', 580],
]

export const customers: Customer[] = rows.map(
  ([name, company, plan, mrr], i) => ({
    id: `cus_${String(i + 1).padStart(3, '0')}`,
    name,
    email: `${name.split(' ')[0].toLowerCase()}@${company
      .toLowerCase()
      .replace(/[^a-z]/g, '')}.com`,
    company,
    plan,
    mrr,
  }),
)
