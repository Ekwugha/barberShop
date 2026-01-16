'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface ImageWithUrl {
  id: string
  name: string
  url: string
}

interface GalleryContentProps {
  images: ImageWithUrl[]
  error: any
}

export function GalleryContent({ images, error }: GalleryContentProps) {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Our Gallery</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Showcasing our finest work
          </p>
        </motion.div>

        {error ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">
              Gallery images will appear here once uploaded to Supabase Storage.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Create a bucket named &quot;haircut-gallery&quot; in Supabase Storage and upload images.
            </p>
          </div>
        ) : images && images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl overflow-hidden aspect-square relative group cursor-pointer"
              >
                <Image
                  src={image.url}
                  alt={`Haircut ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">
              No images in gallery yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

