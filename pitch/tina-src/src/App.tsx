import { useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { Header, Hero, Marquee } from './components/Top'
import { Directions, Works, Shine, Team, Reviews, Salon, Contacts, Footer } from './components/Sections'
import { Prices } from './components/Prices'
import { Booking } from './components/Booking'
import { useSmoothScroll } from './hooks'

const LINE = ['Стрижки', 'Окрашивание', 'Маникюр', 'Подология', 'Брови', 'Ресницы', 'Косметология', 'Шугаринг', 'Лазер', 'Макияж', 'Спа']

/** Mobile "book" bar that appears after the hero and hides over the booking block. */
function MobileBar() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => {
      const bk = document.getElementById('booking')?.getBoundingClientRect()
      setShow(scrollY > innerHeight * .7 && !(bk && bk.top < innerHeight && bk.bottom > 0))
    }
    on(); addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])
  return (
    <div className={`fixed inset-x-3 bottom-3 z-30 transition-all duration-300 lg:hidden ${show ? '' : 'pointer-events-none translate-y-24 opacity-0'}`}>
      <a href="#booking" className="btn btn-primary w-full">Записаться онлайн</a>
    </div>
  )
}

export default function App() {
  useSmoothScroll()
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main>
        <Hero />
        <Marquee items={LINE} />
        <Directions />
        <Works />
        <Shine />
        <Team />
        <Prices />
        <Booking />
        <Reviews />
        <Salon />
        <Contacts />
      </main>
      <Footer />
      <MobileBar />
    </MotionConfig>
  )
}
