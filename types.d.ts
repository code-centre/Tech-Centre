interface Program {
  id: string;
  name: string;
  description: string;
  subtitle: string;
  image: string;
  price: number;
  discount: number | null;
  duration: string;
  level: LevelProgram
  hours: string;
  startDate: string;
  certification: string;
  language: string;
  profile: Array<string>;
  certificationDescription?: string 
  benefits: Array<string>;
  syllabus: Array<Syllabus>;
  teacher: Array<string>;
  type: string;
  slug: string;
  pdf: string;
  faqs: Array<Faq>;
  heroVideo?: string
  status: StatusProgram
  links: Links;
  category: string;
  schedule: Array<ScheduleProgram>;
  shortDescription: string;
}

enum LevelProgram {
  Introducción = 'Introducción',
  Intermedio = 'Intermedio',
  Experto = 'Experto'
}

enum StatusProgram {
  Borrador = 'Borrador',
  Publicado = 'Publicado'
}

interface Syllabus {
  module: string;
  topics: Array<string>;
}

interface Faq {
  question: string;
  answer: string;
}

interface ScheduleProgram {
  modality: string;
  day: string;
  time: string;
}

interface Links {
  full: string;
  fourPayments: string;
  eightPayments: string;
}

interface User {
  occupation: string
  id: string;
  lastName: string;
  name: string;
  email: string;
  rol: string;
  bloodType?: string,
  age?: string,
  company?: string,
  nit?: string,
  emergencyName?: string,
  emergencyPhone?: string,
  avatar: string;
  gender: string;
  createdAt: Timestamp;
  birthDate: string;
  phone: string;
  typeID?: string
  idNumber?: number
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface EventFCA {
  cost: string
  date: string
  description: string
  details: string
  id: string,
  location: Location
  heroImage: string
  schedule: any
  slug: string
  startHour: string
  status: string
  subtitle: string
  tickets: Ticket[]
  title: string
  type: string
}

interface Location {
  description: string
  mapUrl: string
  title: string 
}

interface ScheduleItem {
  date: string
  timeline: Timeline[]
  title: string
}


interface Timeline {
  description: string
  endHour: string
  place: string
  title: string
  startHour: string
  speakerId: string

}

interface Ticket {
  benefits: string[]
  description: string,
  name: string,
  price: number,
  type: string
}