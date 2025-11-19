import { Link } from 'react-router-dom';
import { ShieldCheck, Workflow, Users, Globe, DollarSign, MessageSquare } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Şirket profilini doğrula',
    description: 'Logo, kapak, sertifikalar ve finansal referanslarla Zincir’de güven katmanı oluştur.',
  },
  {
    step: '02',
    title: 'Talep oluştur ve filtrele',
    description: 'Sektör, şehir, kapasite ve sertifika filtreleriyle iş ortağı havuzunu daralt.',
  },
  {
    step: '03',
    title: 'Bağlantı isteğini gönder',
    description: 'Finansal güven notu ve mesajla partnerini bilgilendir, süreç pipeline’da takip edilir.',
  },
  {
    step: '04',
    title: 'Sözleşmeyi kayıt altına al',
    description: 'Mesajlaşma, notlar ve dokümanlarla anlaşmaları Zincir’de güvenceye al.',
  },
];

const MODULES = [
  {
    icon: ShieldCheck,
    title: 'Doğrulama & Güven',
    description: 'Tek seferde KEP, vergi, sertifika doğrulaması yaparak profilini ağda öne çıkar.',
  },
  {
    icon: Users,
    title: 'Matchmaking Motoru',
    description: 'Gelişmiş arama, öneriler ve sektör bazlı odak listelerle doğru partnere ulaş.',
  },
  {
    icon: Workflow,
    title: 'Pipeline & Analitik',
    description: 'Bekleyen, gönderilen ve onaylanan isteklere dair finansal ve operasyonel metrikler.',
  },
  {
    icon: MessageSquare,
    title: 'İletişim & Mutabakat',
    description: 'Mesajlaşma, brif şablonları ve teklif karşılaştırmaları tek ekranda.',
  },
  {
    icon: DollarSign,
    title: 'Finansal Güvence',
    description: 'Teminat, ödeme planı ve tahsilat durumlarını panelde takip et.',
  },
  {
    icon: Globe,
    title: 'Bölgesel Ağ',
    description: '25+ sektör, 20+ şehirdeki doğrulanmış oyuncularla geniş kitlelere eriş.',
  },
];

export default function PartnershipPlaybookPage() {
  return (
    <div className="py-12 space-y-14">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 font-semibold text-sm">
          <ShieldCheck className="w-4 h-4" /> Zincir Playbook
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900">
          Zincir üzerinde iş ortaklığı sürecini baştan sona tasarladık
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Bu playbook; profil doğrulama, eşleştirme, bağlantı isteği, finansal güven ve mutabakat adımlarının tamamını anlatır.
          Platformdaki her sayfa bu yolculuğa hizmet ediyor.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <span className="px-4 py-2 rounded-full bg-gray-100">Doğrulama</span>
          <span className="px-4 py-2 rounded-full bg-gray-100">Matchmaking</span>
          <span className="px-4 py-2 rounded-full bg-gray-100">Finansal Güven</span>
          <span className="px-4 py-2 rounded-full bg-gray-100">Analytics</span>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODULES.map((module) => (
            <div key={module.title} className="card">
              <module.icon className="w-10 h-10 text-primary-600" />
              <h3 className="text-xl font-semibold text-gray-900 mt-4">{module.title}</h3>
              <p className="text-gray-600 mt-2">{module.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card bg-gradient-to-r from-primary-900 to-primary-600 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div key={step.step} className="space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-white/70">{step.step}</span>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-sm text-white/80">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Bir sonraki adımınız</h2>
        <p className="text-gray-600">
          Profilinizi oluşturun, arama filtresine girin ve Zincir ağındaki finansal güven araçlarıyla partnerliklerinizi kayıt altına alın.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/create-company" className="btn btn-primary px-6 py-3">
            Şirketimi Kaydet
          </Link>
          <Link to="/search" className="btn btn-secondary px-6 py-3">
            Partner Bul
          </Link>
        </div>
      </section>
    </div>
  );
}
