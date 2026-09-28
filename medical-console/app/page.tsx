import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import LookupPanel from "@/components/LookupPanel";
import WorldDataPanel from "@/components/WorldDataPanel";
import ModuleGrid from "@/components/ModuleGrid";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="wrap">
        <Hero />
      </main>

      <Ticker />

      <main className="wrap">
        <section className="block" id="lookup">
          <Reveal>
            <div className="section-head">
              <h2>Look up a condition, see every angle</h2>
              <div className="section-index mono">
                01 / CONDITION LOOKUP
                <br />
                2,300+ INDEXED
              </div>
            </div>
            <p className="section-desc">
              Search a condition or symptom and move between what it looks
              like, how to reduce risk, the medical approach, the non-medical
              approach, and how it was historically treated — all sourced, all
              in one place.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <LookupPanel />
            <div className="disclaimer">
              This console is a reference layer, not a diagnosis. Every entry
              should link to its verified source, and the interface should
              always point people toward a clinician for anything beyond
              general information.
            </div>
          </Reveal>
        </section>

        <section className="block" id="world">
          <Reveal>
            <div className="section-head">
              <h2>Drag the globe. The data follows.</h2>
              <div className="section-index mono">
                02 / GLOBAL DATA
                <br />
                41 REGIONS
              </div>
            </div>
            <p className="section-desc">
              Every tracked region is wired to a live readout. Rotate the globe
              to bring a region forward and the panel updates to match.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <WorldDataPanel />
          </Reveal>
        </section>

        <section className="block" id="modules">
          <Reveal>
            <div className="section-head">
              <h2>Add a capability, it takes its place here</h2>
              <div className="section-index mono">
                03 / MODULES
                <br />
                6 ACTIVE
              </div>
            </div>
            <p className="section-desc">
              This grid is the layout for everything the console does. New
              modules slot in the same way the first ones did.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <ModuleGrid />
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
