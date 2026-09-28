import { Hero } from '@/components/Hero'
import { MobileBar, Nav } from '@/components/Nav'
import { Contacts, Footer, Gallery, Questions, Reviews, Services, Team, Why } from '@/components/Sections'
import { BookingDialog } from '@/components/Booking'
import { useSmoothScroll } from '@/hooks'

export default function App() {
  useSmoothScroll()
  return (
    <>
      <Nav />
      <Hero />
      <main>
        <Why />
        <Services />
        <Gallery />
        <Team />
        <Reviews />
        <Questions />
        <Contacts />
      </main>
      <Footer />
      <MobileBar />
      <BookingDialog />
    </>
  )
}
