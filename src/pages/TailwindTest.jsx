import { Link } from "react-router-dom";

export default function TailwindTest() {
  return (
    <div className="bg-surface min-h-screen flex flex-col">
      <header className="bg-primary text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold font-heading">Tailwind CSS Live Test</h1>
        <p className="text-primary-3 mt-1">Interactive style testing page</p>
      </header>

      <main className="flex-1 container mx-auto p-6 space-y-8">
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-heading text-ink mb-4">Colors</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            <div className="bg-primary p-4 rounded-lg text-white font-medium text-center">primary</div>
            <div className="bg-primary-2 p-4 rounded-lg text-white font-medium text-center">primary-2</div>
            <div className="bg-primary-3 p-4 rounded-lg text-ink font-medium text-center">primary-3</div>
            <div className="bg-primary-dark p-4 rounded-lg text-white font-medium text-center">primary-dark</div>
            <div className="bg-accent p-4 rounded-lg text-white font-medium text-center">accent</div>
            <div className="bg-ink p-4 rounded-lg text-white font-medium text-center">ink</div>
            <div className="bg-ink-muted p-4 rounded-lg text-white font-medium text-center">ink-muted</div>
            <div className="bg-surface-2 p-4 rounded-lg text-ink font-medium text-center border">surface-2</div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-heading text-ink mb-4">Typography</h2>
          <div className="space-y-4">
            <h1 className="text-hero">Hero Heading</h1>
            <h2 className="text-heading">Section Heading</h2>
            <h3 className="text-subheading">Subheading</h3>
            <p className="text-lg text-ink-muted">Large muted text for paragraphs with <a href="#" className="text-primary underline">links</a>.</p>
            <p className="text-base">Base text with <strong className="font-semibold">bold</strong> and <em className="italic">italic</em> variants.</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-heading text-ink mb-4">Buttons & Cards</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors">Primary Button</button>
            <button className="px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors">Accent Button</button>
            <button className="px-6 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors">Outline Button</button>
          </div>

          <div className="mt-6 grid grid-auto">
            <div className="service-card bg-surface-2 border border-ui-border rounded-xl p-5 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-heading text-xl mb-2">Service Card</h3>
              <p className="text-ink-muted">Hover to see transform effect on the icon.</p>
            </div>
            <div className="destination-detail-gallery-arrow bg-white rounded-xl p-5 flex items-center justify-center hover:bg-ui-surface-2 transition-colors cursor-pointer">
              <span className="text-3xl">→</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-heading text-ink mb-4">Responsive Grid</h2>
          <div className="grid-auto">
            <div className="bg-primary/10 p-4 rounded-lg">Card 1</div>
            <div className="bg-primary/10 p-4 rounded-lg">Card 2</div>
            <div className="bg-primary/10 p-4 rounded-lg">Card 3</div>
            <div className="bg-primary/10 p-4 rounded-lg">Card 4</div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-heading text-ink mb-4">Flex & Spacing</h2>
          <div className="flex items-center gap-4 p-4 bg-surface-3 rounded-xl">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold">1</div>
            <div className="w-16 h-16 bg-primary-2 rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div className="w-16 h-16 bg-primary-3 rounded-full flex items-center justify-center text-ink font-bold">3</div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-heading text-ink mb-4">Animation System</h2>
          <div className="space-y-4">
            <div data-animate="fadeInUp" className="p-4 bg-primary/5 rounded-lg">Fade In Up - should animate when scrolled into view</div>
            <div data-animate="scaleIn" className="p-4 bg-accent/5 rounded-lg">Scale In - should animate when scrolled into view</div>
            <div data-animate="slideReveal" className="p-4 bg-primary-2/5 rounded-lg">Slide Reveal - should animate when scrolled into view</div>
          </div>
        </section>
      </main>

      <footer className="bg-ink text-white p-6 text-center">
        <p>Tailwind CSS v4 is working! Edit src/pages/TailwindTest.jsx to test styles live.</p>
        <Link to="/" className="text-primary underline mt-2 inline-block">Back to Home</Link>
      </footer>
    </div>
  );
}