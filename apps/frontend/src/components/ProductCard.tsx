import { Link } from 'react-router-dom';
import { Product } from '../types';
import { Star, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

function isVideo(url?: string) {
  if (!url) return false;
  return /\.(mp4|webm|ogg)$/i.test(url);
}

export default function ProductCard({ product }: ProductCardProps) {
  const media = product.mainImage || product.images?.[0]?.url;
  const video = isVideo(media);

  return (
    <Link to={`/products/${product.id}`} className="card overflow-hidden group">
      <div className="relative h-48 rounded-2xl overflow-hidden -mt-4 -mx-4 mb-4">
        {media ? (
          video ? (
            <video
              src={media}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img src={media} alt={product.name} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 via-white to-primary-50 flex items-center justify-center">
            <span className="text-primary-600 font-semibold">Medya yok</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 text-white flex justify-between text-xs">
          <span className="inline-flex items-center gap-1">
            <Eye className="w-4 h-4" /> {product.viewCount}
          </span>
          {product._count?.reviews ? (
            <span className="inline-flex items-center gap-1">
              <Star className="w-4 h-4" /> {product._count.reviews}
            </span>
          ) : null}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
          {product.price && (
            <span className="text-sm font-bold text-primary-700">
              {product.price?.toLocaleString('tr-TR', { style: 'currency', currency: product.currency || 'TRY' })}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">{product.category}</span>
          {product.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
