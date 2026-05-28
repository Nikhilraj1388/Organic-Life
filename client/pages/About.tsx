// Header and Footer provided by Layout
import { Button } from "../components/ui/button";

export default function About() {
  const blogPosts = [
    {
      id: 1,
      title: "Sustainable Farming Practices",
      topic: "Environment",
      description:
        "Learn about our commitment to sustainable and eco-friendly farming methods.",
      image: "/placeholder.svg",
    },
    {
      id: 2,
      title: "Organic Certification Process",
      topic: "Quality",
      description:
        "Understanding the rigorous process behind organic certification and what it means for your health.",
      image: "/placeholder.svg",
    },
    {
      id: 3,
      title: "Farm to Table Journey",
      topic: "Process",
      description:
        "Follow the complete journey of our products from our farms directly to your table.",
      image: "/placeholder.svg",
    },
  ];

  const values = [
    {
      id: 1,
      title: "Sustainability",
      desc: "We prioritize soil health and biodiversity.",
      icon: (
        <svg
          className="w-10 h-10"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M12 2C8 2 4 5 4 9c0 5 8 13 8 13s8-8 8-13c0-4-4-7-8-7z"
            fill="#79C267"
          />
        </svg>
      ),
    },
    {
      id: 2,
      title: "Fair Trade",
      desc: "Direct partnerships ensure fair prices for farmers.",
      icon: (
        <svg
          className="w-10 h-10"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M2 12c0 5 4 10 10 10s10-5 10-10S17.523 2 12 2 2 7 2 12z"
            fill="#F4B183"
          />
        </svg>
      ),
    },
    {
      id: 3,
      title: "Transparency",
      desc: "Traceability from seed to shelf.",
      icon: (
        <svg
          className="w-10 h-10"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" fill="#9FD3E6" />
        </svg>
      ),
    },
  ];

  const team = [
    {
      id: 1,
      name: "Anita Sharma",
      role: "Founder & CEO",
      bio: "Started Organic Life to make clean food accessible.",
      avatar: "/placeholder.svg",
    },
    {
      id: 2,
      name: "Ravi Kumar",
      role: "Head of Sourcing",
      bio: "Works with small farms to maintain organic integrity.",
      avatar: "/placeholder.svg",
    },
    {
      id: 3,
      name: "Nisha Verma",
      role: "Quality Lead",
      bio: "Oversees lab testing and certification processes.",
      avatar: "/placeholder.svg",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Large Hero with stats */}
        <section className="card overflow-hidden">
          <div className="px-8 py-12 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="font-acme text-5xl text-organic-brown mb-4">
                We bring the farm to your doorstep
              </h1>
              <p className="text-organic-brown/80 mb-6">
                Organic Life connects smallholder farmers with urban households
                across Delhi — fresh, traceable and sustainable produce
                delivered weekly.
              </p>
              <div className="flex gap-3">
                <Button variant="default">Shop fresh</Button>
                <Button variant="ghost">Our products</Button>
              </div>
            </div>

            <div className="mt-8 lg:mt-0 grid grid-cols-3 gap-4 lg:gap-6">
              <div className="bg-organic-cream/80 border border-organic-brown rounded-lg p-4 text-center">
                <div className="text-2xl font-acme text-organic-brown">50+</div>
                <div className="text-sm text-organic-brown/80">
                  Certified farms
                </div>
              </div>
              <div className="bg-organic-cream/80 border border-organic-brown rounded-lg p-4 text-center">
                <div className="text-2xl font-acme text-organic-brown">
                  10k+
                </div>
                <div className="text-sm text-organic-brown/80">
                  Families served
                </div>
              </div>
              <div className="bg-organic-cream/80 border border-organic-brown rounded-lg p-4 text-center">
                <div className="text-2xl font-acme text-organic-brown">
                  100%+
                </div>
                <div className="text-sm text-organic-brown/80">
                  Traceability
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.id}
              className="card flex flex-col items-center text-center hover:shadow-md transition-shadow animate-fade-up"
            >
              <div className="text-4xl mb-3">{v.icon}</div>
              <h4 className="font-acme text-xl text-organic-brown mb-2">
                {v.title}
              </h4>
              <p className="text-organic-brown/80">{v.desc}</p>
            </div>
          ))}
        </section>

        {/* Team with hover effect */}
        <section className="card p-8">
          <h2 className="font-acme text-4xl text-organic-brown text-center mb-8">
            Meet the people behind Organic Life
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className="group relative overflow-hidden rounded-lg border border-organic-cream p-6 flex flex-col items-center text-center bg-white hover:shadow-lg hover:-translate-y-1 transition-transform transition-shadow animate-fade-up"
              >
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-2 border-organic-brown">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-acme text-lg text-organic-brown mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-organic-brown/80 mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-organic-brown/80">{member.bio}</p>
                <div className="absolute inset-0 bg-organic-cream/0 group-hover:bg-organic-cream/10 transition-colors"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Blog preview and CTA banner */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white border-2 border-organic-brown rounded-lg p-6">
            <h3 className="font-acme text-3xl text-organic-brown mb-4">
              Latest from our blog
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {blogPosts.map((p) => (
                <a
                  key={p.id}
                  href={`/blog?id=${p.id}`}
                  className="block border border-organic-cream rounded-lg p-4 hover:shadow-md hover:-translate-y-1 transition-transform animate-fade-up"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-28 object-cover rounded-md mb-3 opacity-80"
                  />
                  <h4 className="font-acme text-lg text-organic-brown mb-1">
                    {p.title}
                  </h4>
                  <p className="text-organic-brown/80 text-sm">
                    {p.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <aside className="bg-organic-cream border-2 border-organic-brown rounded-lg p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-acme text-2xl text-organic-brown mb-2">
                Want to partner with us?
              </h4>
              <p className="text-organic-brown/80 mb-4">
                We work directly with farms and distributors — reach out to
                explore wholesale options.
              </p>
            </div>
            <div className="text-right">
              <Button variant="default">Contact us</Button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
