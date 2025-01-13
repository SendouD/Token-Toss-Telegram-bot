'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-border relative">
      <div className="container px-4 mx-auto">
        {/* Desktop and Mobile Main Header */}
        <div className="flex items-center justify-between h-16">
          {/* Logo - Same for both mobile and desktop */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 flex items-center justify-center pixel-borders">
              <span className="text-sm font-bold text-white pixel-text">TT</span>
            </div>
            <span className="text-lg font-bold text-foreground pixel-text">Token Toss</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/commands">
              <Button className="pixel-text text-xs">
                Commands
              </Button>
            </Link>
            <Link href="/login">
              <Button className="pixel-text text-xs">
                Profile
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border z-50 pixel-borders">
            <nav className="container px-4 py-4 flex flex-col space-y-2">
              <Link href="/commands" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full pixel-text text-xs justify-start">
                  Commands
                </Button>
              </Link>
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full pixel-text text-xs justify-start">
                  Profile
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}