import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CityMarker {
  name: string;
  x: number;
  y: number;
  count: number;
  province: string;
}

const TURKEY_CITIES: CityMarker[] = [
  { name: 'İstanbul', x: 70, y: 35, count: 156, province: 'İstanbul' },
  { name: 'Ankara', x: 60, y: 50, count: 89, province: 'Ankara' },
  { name: 'İzmir', x: 35, y: 58, count: 67, province: 'İzmir' },
  { name: 'Bursa', x: 55, y: 42, count: 45, province: 'Bursa' },
  { name: 'Antalya', x: 50, y: 75, count: 34, province: 'Antalya' },
  { name: 'Adana', x: 72, y: 75, count: 28, province: 'Adana' },
  { name: 'Konya', x: 60, y: 65, count: 24, province: 'Konya' },
  { name: 'Gaziantep', x: 78, y: 75, count: 22, province: 'Gaziantep' },
  { name: 'Kayseri', x: 70, y: 60, count: 18, province: 'Kayseri' },
  { name: 'Mersin', x: 68, y: 78, count: 16, province: 'Mersin' },
];

export default function TurkeyMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePos({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const parallaxX = (mousePos.x - 0.5) * 20;
  const parallaxY = (mousePos.y - 0.5) * 20;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-800 to-slate-900"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <motion.svg
        viewBox="0 0 1000 500"
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translate(${parallaxX}px, ${parallaxY}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        <g className="turkey-outline">
          <path
            d="M 100 200 L 150 180 L 200 170 L 250 160 L 300 155 L 350 150 L 400 155 L 450 160 L 500 165 L 550 170 L 600 180 L 650 190 L 700 200 L 750 210 L 800 230 L 850 250 L 900 270 L 920 300 L 900 330 L 850 350 L 800 360 L 750 370 L 700 375 L 650 380 L 600 385 L 550 390 L 500 390 L 450 385 L 400 380 L 350 375 L 300 370 L 250 360 L 200 340 L 150 320 L 120 280 Z"
            fill="rgba(16, 185, 129, 0.1)"
            stroke="rgba(16, 185, 129, 0.4)"
            strokeWidth="2"
            className="drop-shadow-2xl"
          />
        </g>

        {TURKEY_CITIES.map((city, index) => {
          const x = (city.x / 100) * 1000;
          const y = (city.y / 100) * 500;
          const isHovered = hoveredCity === city.name;

          return (
            <g key={city.name}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 25 : 15}
                fill="rgba(16, 185, 129, 0.2)"
                className="animate-ping"
                style={{ animationDelay: `${index * 0.2}s` }}
              />

              <circle
                cx={x}
                cy={y}
                r={isHovered ? 12 : 8}
                fill="#10b981"
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-300 drop-shadow-lg"
                onMouseEnter={() => setHoveredCity(city.name)}
                onMouseLeave={() => setHoveredCity(null)}
              />

              {isHovered && (
                <g>
                  <rect
                    x={x - 60}
                    y={y - 60}
                    width="120"
                    height="40"
                    rx="8"
                    fill="rgba(0, 0, 0, 0.9)"
                    stroke="rgba(16, 185, 129, 0.5)"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y - 45}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {city.name}
                  </text>
                  <text
                    x={x}
                    y={y - 28}
                    textAnchor="middle"
                    fill="#10b981"
                    fontSize="12"
                  >
                    {city.count} Aktif Şirket
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </motion.svg>

      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-white text-2xl font-bold mb-2">
            Türkiye Geneli Zincir Ağı
          </h3>
          <p className="text-emerald-300 text-sm">
            {TURKEY_CITIES.reduce((sum, city) => sum + city.count, 0)}+ aktif şirket,
            {TURKEY_CITIES.length} şehirde hizmet
          </p>
        </motion.div>

        {hoveredCity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-600 text-white rounded-xl px-6 py-3 font-bold shadow-2xl"
          >
            {hoveredCity} bölgesinde iş ortağı arayın →
          </motion.div>
        )}
      </div>
    </div>
  );
}
