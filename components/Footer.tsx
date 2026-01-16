import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Barber<span className="text-amber-500">Shop</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Premium barber services with online booking
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-amber-500">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-600 dark:text-gray-400 hover:text-amber-500">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-600 dark:text-gray-400 hover:text-amber-500">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-gray-600 dark:text-gray-400 hover:text-amber-500">
                  Book Now
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Book your appointment online or contact us for more information.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} BarberShop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

