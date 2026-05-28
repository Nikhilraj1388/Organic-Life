import { useState } from "react";
// Header and Footer provided by Layout
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.name.trim()) errs.name = "Please enter your name";
    if (!formData.email.trim()) errs.email = "Please enter your email";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email))
      errs.email = "Please enter a valid email";
    if (!formData.message.trim()) errs.message = "Please enter a message";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // TODO: wire up to API endpoint (serverless function / backend)
    console.log("Contact form submitted:", formData);
    setFormData({ name: "", email: "", message: "" });
    alert("Thanks — we received your message and will be in touch shortly.");
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-5xl mx-auto px-4 py-12">
        <section className="mb-8 text-center">
          <h1 className="text-4xl font-acme text-organic-brown">
            Get in touch
          </h1>
          <p className="mt-2 text-organic-brown/80">
            Questions, feedback or wholesale inquiries — we&apos;d love to hear
            from you.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact form */}
          <div className="card-cream shadow-sm animate-fade-up">
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-organic-brown mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-xs text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-organic-brown mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-organic-brown mb-2"
                  htmlFor="message"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="How can we help?"
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                />
                {errors.message && (
                  <p
                    id="message-error"
                    className="mt-1 text-xs text-destructive"
                  >
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <Button type="submit" variant="default">
                  Send message
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setFormData({ name: "", email: "", message: "" })
                  }
                >
                  Reset
                </Button>
              </div>
            </form>
          </div>

          {/* Contact details / map */}
          <aside className="flex flex-col justify-between card animate-fade-up">
            <div>
              <h2 className="text-2xl font-semibold text-organic-brown mb-2">
                Contact details
              </h2>
              <p className="text-organic-brown/80 mb-4">
                Call us, email, or drop by our store. We're in South Delhi and
                deliver across the city.
              </p>

              <dl className="space-y-3 text-organic-brown">
                <div>
                  <dt className="font-medium">Phone</dt>
                  <dd className="text-sm">+91 11 4567 8901</dd>
                </div>
                <div>
                  <dt className="font-medium">Email</dt>
                  <dd className="text-sm">hello@organic.example</dd>
                </div>
                <div>
                  <dt className="font-medium">Hours</dt>
                  <dd className="text-sm">Mon–Sun: 8:00 AM — 8:00 PM</dd>
                </div>
                <div>
                  <dt className="font-medium">Address</dt>
                  <dd className="text-sm">
                    Qutub Institutional Area, New Delhi, India
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-organic-brown mb-2">
                Find us
              </h3>
              <div className="w-full h-44 bg-gray-100 rounded-md border-2 border-organic-cream flex items-center justify-center text-sm text-organic-brown">
                Map placeholder
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
