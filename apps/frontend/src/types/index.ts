export interface User {
  id: string;
  email: string;
  role: string;
  hasCompany?: boolean;
  companyId?: string;
  company?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  coverImage?: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  district?: string;
  industryType: IndustryType;
  companySize: CompanySize;
  foundedYear?: number;
  services?: Service[];
  capabilities?: Capability[];
  certifications?: Certification[];
  portfolio?: PortfolioItem[];
  products?: Product[];
  viewCount: number;
  connectionCount: number;
  seekingPartners: boolean;
  partnerCriteria?: string;
  createdAt: string;
  isPremium: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface Capability {
  id: string;
  name: string;
  level: number;
  yearsExp?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  imageUrl?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectDate?: string;
  tags: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export interface ProductReview {
  id: string;
  rating?: number;
  comment?: string;
  createdAt: string;
  authorName?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price?: number;
  currency?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  mainImage?: string;
  images?: ProductImage[];
  specifications?: Record<string, any> | null;
  isAvailable: boolean;
  viewCount: number;
  company?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    city?: string;
  };
  _count?: {
    favorites?: number;
    reviews?: number;
  };
  reviews?: ProductReview[];
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  createdAt: string;
  respondedAt?: string;
  requester?: Partial<Company>;
  receiver?: Partial<Company>;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderCompany: Partial<Company>;
  receiverCompany: Partial<Company>;
  subject?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export enum IndustryType {
  TEKSTIL = 'TEKSTIL',
  BASKI = 'BASKI',
  PAZARLAMA = 'PAZARLAMA',
  LOJISTIK = 'LOJISTIK',
  AMBALAJ = 'AMBALAJ',
  TASARIM = 'TASARIM',
  YAZILIM = 'YAZILIM',
  URETIM = 'URETIM',
  GIDA = 'GIDA',
  INSAAT = 'INSAAT',
  MOBILYA = 'MOBILYA',
  OTOMOTIV = 'OTOMOTIV',
  ELEKTRIK_ELEKTRONIK = 'ELEKTRIK_ELEKTRONIK',
  KIMYA = 'KIMYA',
  PLASTIK = 'PLASTIK',
  METAL = 'METAL',
  KAGIT = 'KAGIT',
  DERI = 'DERI',
  CAM_SERAMIK = 'CAM_SERAMIK',
  ENERJI = 'ENERJI',
  TARIM = 'TARIM',
  DANISMANLIK = 'DANISMANLIK',
  EGITIM = 'EGITIM',
  SAGLIK = 'SAGLIK',
  TURIZM = 'TURIZM',
  DIGER = 'DIGER',
}

export enum CompanySize {
  MICRO = 'MICRO',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export const INDUSTRY_LABELS: Record<IndustryType, string> = {
  TEKSTIL: 'Tekstil',
  BASKI: 'Baskı',
  PAZARLAMA: 'Pazarlama',
  LOJISTIK: 'Lojistik',
  AMBALAJ: 'Ambalaj',
  TASARIM: 'Tasarım',
  YAZILIM: 'Yazılım',
  URETIM: 'Üretim',
  GIDA: 'Gıda',
  INSAAT: 'İnşaat',
  MOBILYA: 'Mobilya',
  OTOMOTIV: 'Otomotiv',
  ELEKTRIK_ELEKTRONIK: 'Elektrik & Elektronik',
  KIMYA: 'Kimya',
  PLASTIK: 'Plastik',
  METAL: 'Metal',
  KAGIT: 'Kağıt',
  DERI: 'Deri',
  CAM_SERAMIK: 'Cam & Seramik',
  ENERJI: 'Enerji',
  TARIM: 'Tarım',
  DANISMANLIK: 'Danışmanlık',
  EGITIM: 'Eğitim',
  SAGLIK: 'Sağlık',
  TURIZM: 'Turizm',
  DIGER: 'Diğer',
};

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  MICRO: '1-10 Çalışan',
  SMALL: '11-50 Çalışan',
  MEDIUM: '51-250 Çalışan',
  LARGE: '250+ Çalışan',
};
