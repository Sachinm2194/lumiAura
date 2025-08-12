"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 text-sm px-6 py-10 mt-24">
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-4 gap-8">
        {/* Brand and motto */}
        <div>
          <span className="text-2xl font-extrabold uppercase tracking-widest text-white">
            LumiAura GlowSkin
          </span>
          <p className="mt-3 text-gray-400">
            Thoughtful rituals. Authentic wellness. Mindful gifting.
          </p>
        </div>
        {/* Navigation links */}
        <div>
          <h6 className="font-bold mb-3 text-white">Quick Links</h6>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:underline">
                Shop
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        {/* Contact info */}
        <div>
          <h6 className="font-bold mb-3 text-white">Contact</h6>
          <ul className="space-y-2">
            <li>
              Email:{" "}
              <a href="mailto:info@ilemjapan.com" className="hover:underline">
                kushiguptamakeupartist@gmail.com
              </a>
            </li>
            <li>
              Phone:{" "}
              <a href="tel:+9599497973" className="hover:underline">
                +9599497973
              </a>
            </li>
            <li>Bengaluru, India</li>
          </ul>
        </div>
        {/* Social links */}
        <div>
          <h6 className="font-bold mb-3 text-white">Follow Us</h6>
          <div className="flex space-x-4 text-xl items-center">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-white text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="#25d366"
                viewBox="0 0 256 256"
              >
                <path d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155l14.61-9.74,23,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z"></path>
              </svg>
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-white text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 256 256"
              >
                <defs>
                  <linearGradient
                    id="insta-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#f58529" />
                    <stop offset="30%" stopColor="#dd2a7b" />
                    <stop offset="60%" stopColor="#8134af" />
                    <stop offset="100%" stopColor="#515bd4" />
                  </linearGradient>
                </defs>
                <path
                  d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,72a24,24,0,1,1,24-24A24,24,0,0,1,128,152ZM176,20H80A60.07,60.07,0,0,0,20,80v96a60.07,60.07,0,0,0,60,60h96a60.07,60.07,0,0,0,60-60V80A60.07,60.07,0,0,0,176,20Zm36,156a36,36,0,0,1-36,36H80a36,36,0,0,1-36-36V80A36,36,0,0,1,80,44h96a36,36,0,0,1,36,36ZM196,76a16,16,0,1,1-16-16A16,16,0,0,1,196,76Z"
                  fill="url(#insta-gradient)"
                />
              </svg>
            </a>

            {/* <a href="#" aria-label="Instagram" className="hover:text-white text-gray-400"><FaInstagram /></a>
            <a href="#" aria-label="Twitter" className="hover:text-white text-gray-400"><FaTwitter /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white text-gray-400"><FaLinkedin /></a> */}
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500">
        &copy; {new Date().getFullYear()} ILEM JAPAN. All rights reserved.
      </div>
    </footer>
  );
}
