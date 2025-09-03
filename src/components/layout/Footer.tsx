import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold shadow">
                SB
              </span>
              <span className="text-lg font-semibold text-green-700">
                SportBook
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Book your favorite sports venues easily and quickly with
              SportBook. Play more, plan less.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:col-span-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/careers">Careers</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900">Support</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help">Help Center</Link>
                </li>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900">Follow Us</h4>
              <div className="mt-3 flex gap-3 text-muted-foreground">
                <Link href="https://facebook.com" target="_blank">
                  <Facebook className="h-5 w-5 hover:text-green-600 transition" />
                </Link>
                <Link href="https://twitter.com" target="_blank">
                  <Twitter className="h-5 w-5 hover:text-green-600 transition" />
                </Link>
                <Link href="https://instagram.com" target="_blank">
                  <Instagram className="h-5 w-5 hover:text-green-600 transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SportBook. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
