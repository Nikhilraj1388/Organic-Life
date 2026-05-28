import { Instagram, MessageCircle, MapPin, Phone, Mail, Facebook, Twitter, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Footer() {
  return (
    <footer className="w-full bg-organic-cream border-t border-organic-brown/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-organic-brown" />
              <span className="font-acme text-2xl text-organic-brown">Organic Life</span>
            </div>
            <p className="text-organic-brown/80 text-sm leading-relaxed">
              Nourishing lives naturally with premium organic products. Committed to sustainable farming and healthy living.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-white border border-organic-brown/30 rounded-lg flex items-center justify-center hover:bg-organic-brown hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white border border-organic-brown/30 rounded-lg flex items-center justify-center hover:bg-organic-brown hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white border border-organic-brown/30 rounded-lg flex items-center justify-center hover:bg-organic-brown hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white border border-organic-brown/30 rounded-lg flex items-center justify-center hover:bg-organic-brown hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-acme text-xl text-organic-brown">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/marketplace"
                className="text-organic-brown/80 hover:text-organic-brown transition-colors text-sm"
              >
                Marketplace
              </Link>
              <Link
                to="/about"
                className="text-organic-brown/80 hover:text-organic-brown transition-colors text-sm"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-organic-brown/80 hover:text-organic-brown transition-colors text-sm"
              >
                Contact
              </Link>
              <Link
                to="/login"
                className="text-organic-brown/80 hover:text-organic-brown transition-colors text-sm"
              >
                Login
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-acme text-xl text-organic-brown">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-organic-brown mt-0.5 flex-shrink-0" />
                <div className="text-organic-brown/80 text-sm">
                  <p>Plot 42, Sector 18</p>
                  <p>Connaught Place, New Delhi - 110001</p>
                  <p>Delhi, India</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-organic-brown flex-shrink-0" />
                <span className="text-organic-brown/80 text-sm">+91 11 4567 8901</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-organic-brown flex-shrink-0" />
                <span className="text-organic-brown/80 text-sm">hello@organiclife.in</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-acme text-xl text-organic-brown">Stay Updated</h3>
            <p className="text-organic-brown/80 text-sm">
              Subscribe to our newsletter for the latest organic products and health tips.
            </p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full border-organic-brown/30 focus:ring-organic-brown/50 focus:border-organic-brown"
              />
              <Button
                type="submit"
                className="w-full bg-organic-brown hover:bg-organic-black text-white font-medium"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-organic-brown/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-organic-brown/60 text-sm">
              © 2024 Organic Life. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-organic-brown/60">
              <a href="#" className="hover:text-organic-brown transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-organic-brown transition-colors">
                Terms of Service
              </a>
              <span>Made with 💚 for a healthier world</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
