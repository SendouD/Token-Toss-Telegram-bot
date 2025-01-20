import Image from 'next/image'
import Link from 'next/link'
import { Bot, Coins, Send, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "../components/Header"

export default function Home() {
  return (
    <div className="min-h-screen dark bg-background pixel-pattern">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="container px-4 pt-20 pb-16 mx-auto text-center">

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground pixel-text md:text-6xl lg:text-7xl">
            <span className="text-purple-400">TOKEN</span>{' '}
            <span className="text-[#c3ff00]">TOSS</span>
          </h1>
          <p className="max-w-2xl mx-auto mb-8 text-lg text-muted-foreground md:text-xl">
            Mint memecoins and toss SOL to your Telegram group members 
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <a
              href="https://t.me/Soltoken_Launcher_bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-bold transition-transform pixel-borders hover:scale-105"
              >
                Add to Telegram
              </Button>
            </a>
          </div>


        </section>

        {/* Features Grid */}
        <section className="container px-4 py-16 mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-2 border-purple-500 bg-card pixel-borders">
              <CardContent className="p-6">
                <Bot className="w-12 h-12 mb-4 text-purple-400" />
                <h3 className="mb-2 text-xl font-bold text-foreground pixel-text">Easy Commands</h3>
                <p className="text-muted-foreground">Simple bot commands for minting and sending tokens</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#c3ff00] bg-card pixel-borders">
              <CardContent className="p-6">
                <Coins className="w-12 h-12 mb-4 text-[#c3ff00]" />
                <h3 className="mb-2 text-xl font-bold text-foreground pixel-text">Instant Minting</h3>
                <p className="text-muted-foreground">Create new tokens with Phantom deeplink integration</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-500 bg-card pixel-borders">
              <CardContent className="p-6">
                <Send className="w-12 h-12 mb-4 text-purple-400" />
                <h3 className="mb-2 text-xl font-bold text-foreground pixel-text">Quick Transfers</h3>
                <p className="text-muted-foreground">Toss SOL by replying to group members</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#c3ff00] bg-card pixel-borders">
              <CardContent className="p-6">
                <Users className="w-12 h-12 mb-4 text-[#c3ff00]" />
                <h3 className="mb-2 text-xl font-bold text-foreground pixel-text">Group Ready</h3>
                <p className="text-muted-foreground">Works seamlessly in Telegram groups</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Game Console Section */}
        <section className="container px-4 py-16 mx-auto text-center">
          <Card className="relative inline-block p-8 bg-black pixel-borders-thick">
            <div className="absolute w-4 h-4 bg-purple-500 rounded-full -top-2 -right-2" />
            <div className="absolute w-4 h-4 bg-[#c3ff00] rounded-full -bottom-2 -left-2" />
            <div className="p-4 bg-[#c3ff00] rounded pixel-screen">
              <pre className="font-mono text-black pixel-text text-left">
                {`> MINT TOKEN
> NAME: TOSS
> Description: Toss
  some SOL to your
  Telegram group
  members
> SUCCESS ✨
              `}
              </pre>
            </div>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="container px-4 py-16 mx-auto text-center">
          <h2 className="mb-8 text-3xl font-bold text-foreground pixel-text md:text-4xl">
            Ready to <span className="text-purple-400">Toss</span> Some Tokens?
          </h2>
          <a href="https://t.me/Soltoken_Launcher_bot" target="_blank" rel="noopener noreferrer">
            <Button
              variant="secondary"
              size="lg"
              className="px-8 py-6 text-lg font-bold text-background bg-[#c3ff00] transition-transform pixel-borders hover:scale-105"
            >
              Launch Bot
            </Button>
          </a>

        </section>
      </main>
    </div>
  )
}

