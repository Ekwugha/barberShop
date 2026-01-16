'use client'

import { motion } from 'framer-motion'
import { Scissors, Clock, Star } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          <div className="glass rounded-2xl p-8 text-center">
            <Scissors className="mx-auto mb-4 text-amber-500" size={48} />
            <h3 className="text-2xl font-bold mb-2">Expert Cuts</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Years of experience delivering precision cuts
            </p>
          </div>
          <div className="glass rounded-2xl p-8 text-center">
            <Clock className="mx-auto mb-4 text-amber-500" size={48} />
            <h3 className="text-2xl font-bold mb-2">Flexible Booking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Book online at your convenience
            </p>
          </div>
          <div className="glass rounded-2xl p-8 text-center">
            <Star className="mx-auto mb-4 text-amber-500" size={48} />
            <h3 className="text-2xl font-bold mb-2">Premium Service</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Quality service you can trust
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

