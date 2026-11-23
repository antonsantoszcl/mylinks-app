import Link from 'next/link';
import { Link2, ChevronRight, ExternalLink } from 'lucide-react';

const sections = [
  {
    id: '01',
    title: 'The Opportunity',
    heading: "The browser's New Tab is an underutilized space.",
    paragraphs: [
      'The browser is one of the most frequently used applications in our digital lives. Yet, despite the evolution of the Internet and the growing complexity of our online activities, the starting point of most browsing sessions remains surprisingly limited.',
      'A search box, a few shortcuts and a collection of frequently visited websites.',
      'We believe this space has the potential to become something much more valuable: a personalized gateway to each user\u2019s digital world.',
    ],
  },
  {
    id: '02',
    title: 'The Problem',
    heading: 'Every person has a different digital world.',
    paragraphs: [
      'A professional, an investor, a student and someone who primarily uses the Internet for entertainment have very different needs, interests and browsing habits.',
      'Yet conventional browser starting pages offer essentially the same experience to everyone.',
      'Users have to adapt their browsing routines to the limitations of their browsers, rather than having their browsers adapt to their individual needs.',
      'There is an opportunity to rethink this relationship.',
    ],
  },
  {
    id: '03',
    title: 'The Solution',
    heading: 'Meet allLinks — Your Personal Command Center for the Internet.',
    paragraphs: [
      'allLinks transforms the traditional browser starting page into a customizable personal navigation environment.',
      'Users can create their own panels, organize links into sections and structure their digital resources according to their individual needs and preferences.',
      'Whether for work, business, research, finance, education or entertainment, allLinks gives users the freedom to build an environment that reflects the way they actually use the Internet.',
      'It is more than a collection of bookmarks. It is a personalized way to organize and access the digital world.',
    ],
  },
  {
    id: '04',
    title: 'The Product',
    heading: 'Simple, flexible and personal.',
    paragraphs: [
      'allLinks is already a functional product, not just an idea or a concept awaiting development.',
      'Its core experience includes:',
    ],
    bullets: [
      'Customizable panels for different areas of life.',
      'Sections to organize websites, services, tools and content.',
      'Flexible links and cards that users can add, edit, rearrange and manage.',
      'A clean and intuitive interface.',
      'A personalized environment that evolves with each user\u2019s needs.',
    ],
    trailing: [
      'The product is designed to be accessible, practical and easy to use, without requiring users to learn complex organizational methods.',
    ],
    cta: { label: 'allLinks Live Demo', href: 'https://alllinks.app/demo' },
  },
  {
    id: '05',
    title: 'The Vision',
    heading: 'From an independent platform to the future of browser navigation.',
    paragraphs: [
      'Our vision has two complementary dimensions.',
    ],
    subsections: [
      {
        heading: 'An independent global platform',
        paragraphs: [
          'allLinks can grow as an independent service, accessible through existing browsers and available to users regardless of their preferred browser ecosystem.',
        ],
      },
      {
        heading: 'A new generation of browser integration',
        paragraphs: [
          'We also see significant potential for deeper integration with browsers such as Chrome, Edge and Firefox, initially through extensions and potentially through native browser experiences.',
          'Our long-term ambition is to help redefine what users expect when they open a new browser tab.',
          'The browser should not simply take users to the Internet.',
          'It should take them to their Internet.',
        ],
      },
    ],
  },
  {
    id: '06',
    title: 'The Market Opportunity',
    heading: 'A universal need with highly personal applications.',
    paragraphs: [
      'Internet users around the world access an increasingly diverse range of websites, applications, platforms and digital services.',
      'The need to organize and navigate this growing digital universe is not restricted to a particular profession, age group or geographic market.',
      'It is a natural consequence of our increasingly digital lives.',
      'By combining broad applicability with deep personal customization, allLinks has the potential to serve a wide range of users across different markets and browser ecosystems.',
    ],
  },
  {
    id: '07',
    title: 'The Business Potential',
    heading: 'A platform with multiple paths to growth.',
    paragraphs: [
      'The allLinks business model can evolve alongside its user base and product capabilities.',
      'Potential opportunities include:',
    ],
    bullets: [
      'Premium features and subscription plans.',
      'Advanced personalization and productivity capabilities.',
      'Strategic partnerships and browser integrations.',
      'Technology licensing and business-to-business opportunities.',
    ],
    trailing: [
      'The immediate priority is to validate user demand, build engagement and establish a sustainable growth model.',
    ],
  },
  {
    id: '08',
    title: 'The Investment Opportunity',
    heading: 'Help shape the next generation of browser experiences.',
    paragraphs: [
      'We are seeking strategic investment and partnerships to accelerate product development, expand our international presence, validate market opportunities and explore deeper integration with browser ecosystems.',
      'We believe allLinks addresses an overlooked opportunity in one of the most important areas of everyday digital life.',
      'The starting point of the Internet experience deserves to be reimagined.',
      'And we believe allLinks can be part of that transformation.',
    ],
  },
];

export const metadata = {
  title: 'allLinks — Investment Pitch',
  description:
    'allLinks: rethinking the browser experience. A personalized command center for the Internet.',
};

export default function InvestmentPitchPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-800 flex items-center justify-center">
              <Link2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800">alllinks.app</span>
          </div>
          <Link
            href="https://www.alllinks.app"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            Visit our website
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-primary-50 to-transparent rounded-full blur-3xl opacity-60" />
        </div>
        <div className="max-w-4xl mx-auto px-4 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4 tracking-tight">
            allLinks
          </h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-8">
            Rethinking the Browser Experience
          </h2>
          <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            <strong className="text-slate-800">The Internet is universal.</strong>
            <br />
            <strong className="text-slate-800">The way we use it is personal.</strong>
            <br />
            <strong className="text-slate-800">Your browser should reflect that.</strong>
          </p>
        </div>
      </section>

      {/* Sections */}
      <main className="max-w-3xl mx-auto px-4 pb-16 sm:pb-24">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="py-10 sm:py-14 border-t border-slate-100 first:border-t-0"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 font-bold text-sm flex items-center justify-center border border-primary-100">
                {section.id}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                {section.title}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5 leading-snug">
              {section.heading}
            </h3>
            {section.paragraphs?.map((p) => (
              <p key={p.slice(0, 40)} className="text-base text-slate-600 leading-relaxed mb-4">
                {p}
              </p>
            ))}
            {section.bullets ? (
              <ul className="space-y-2.5 mb-4">
                {section.bullets.map((b) => (
                  <li key={b.slice(0, 40)} className="flex items-start gap-3 text-base text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2.5 shrink-0" />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {section.subsections?.map((sub) => (
              <div key={sub.heading} className="mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-3">{sub.heading}</h4>
                {sub.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="text-base text-slate-600 leading-relaxed mb-3">
                    {p === 'It should take them to their Internet.' ? (
                      <>It should take them to <em>their</em> Internet.</>
                    ) : (
                      p
                    )}
                  </p>
                ))}
              </div>
            ))}
            {section.trailing?.map((p) => (
              <p key={p.slice(0, 40)} className="text-base text-slate-600 leading-relaxed mb-4">
                {p}
              </p>
            ))}
            {section.cta ? (
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-800 mb-3">Experience the product:</p>
                <a
                  href={section.cta.href}
                  className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:-translate-y-0.5 min-h-[44px]"
                >
                  {section.cta.label}
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ) : null}
          </section>
        ))}
      </main>

      {/* Footer CTA */}
      <section className="bg-slate-50 border-t border-slate-100 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-primary-800 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">allLinks</span>
          </div>
          <p className="text-lg sm:text-2xl font-semibold text-slate-800 mb-8 leading-relaxed">
            One Internet. Millions of Personal Experiences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://alllinks.app/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 hover:-translate-y-0.5 min-h-[44px]"
            >
              Explore allLinks
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="https://www.alllinks.app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-slate-600 font-medium px-5 py-3.5 rounded-xl hover:bg-white transition-colors min-h-[44px]"
            >
              Visit our website
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary-800 flex items-center justify-center">
              <Link2 className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-800">alllinks.app</span>
          </div>
          <p className="text-xs text-slate-400">© 2024 alllinks.app. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
