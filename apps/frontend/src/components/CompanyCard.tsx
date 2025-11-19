import { Link } from 'react-router-dom';
import { Company, INDUSTRY_LABELS, COMPANY_SIZE_LABELS } from '../types';
import { Building2, MapPin, Users, TrendingUp, ArrowRightCircle } from 'lucide-react';

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const displayText = company.partnerCriteria || company.description;

  return (
    <Link to={`/companies/${company.slug}`} className="card group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-transparent to-primary-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      {company.coverImage ? (
        <div className="relative w-full h-32 -mt-6 -mx-6 mb-6 rounded-t-[28px] overflow-hidden">
          <img
            src={company.coverImage}
            alt={company.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />
          <div className="absolute bottom-4 left-6 text-white flex items-center gap-2 text-sm font-semibold">
            <Users className="w-4 h-4" />
            {company.connectionCount}+ bağlantı
          </div>
        </div>
      ) : (
        <div className="w-full h-20 -mt-6 -mx-6 mb-6 rounded-t-[28px] bg-gradient-to-r from-primary-100 via-white to-accent-100" />
      )}

      <div className="flex items-start gap-4">
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-xl text-gray-900 truncate group-hover:text-primary-700 transition-colors">
              {company.name}
            </h3>
            {company.isPremium && (
              <span className="badge bg-gradient-to-r from-accent-400 to-accent-600 text-white text-[11px]">
                Premium
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="badge badge-primary">{INDUSTRY_LABELS[company.industryType]}</span>
            <span className="badge badge-accent">{COMPANY_SIZE_LABELS[company.companySize]}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm mt-4 line-clamp-3">{displayText}</p>

      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{company.city}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>{company.viewCount} görüntülenme</span>
        </div>
        {company.seekingPartners && (
          <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
            İş ortaklığı arıyor
          </span>
        )}
      </div>

      {company.services && company.services.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {company.services.slice(0, 3).map((service) => (
            <span key={service.id} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {service.title}
            </span>
          ))}
          {company.services.length > 3 && (
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              +{company.services.length - 3} daha
            </span>
          )}
        </div>
      )}

      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div>
          <p className="font-semibold text-gray-900">Profil detayına git</p>
          <p>Bağlantı isteği gönder</p>
        </div>
        <ArrowRightCircle className="w-6 h-6 text-primary-600" />
      </div>
    </Link>
  );
}
