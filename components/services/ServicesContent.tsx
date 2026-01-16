'use client'

import { motion } from 'framer-motion'
import { Clock, Scissors } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number | null
}

interface ServicesContentProps {
  services: Service[] | null
}

export function ServicesContent({ services }: ServicesContentProps) {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Professional barber services tailored to you
          </p>
        </motion.div>

        {services && services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-8"
              >
                <div className="flex items-center mb-4">
                  <Scissors className="text-amber-500 mr-3" size={32} />
                  <h3 className="text-2xl font-bold">{service.name}</h3>
                </div>
                {service.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-500">
                    <Clock size={20} className="mr-2" />
                    <span className="font-semibold">{service.duration} min</span>
                  </div>
                  {service.price && (
                    <span className="text-2xl font-bold">
                      ${service.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-gray-400">
              Services will be listed here. Add services in the database.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

