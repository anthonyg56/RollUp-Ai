import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FeatureCard } from "@/pages/public/home/FeatureCard"
import { ChevronRight } from "lucide-react"
import { StatCard } from "@/pages/public/home/StatCard"
import TestimonialCard from "@/pages/public/home/TestimonialCard"
import { Link } from "@tanstack/react-router"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Transform Your Videos with <span className="text-fuchsia-600 dark:text-fuchsia-400">AI</span> Magic
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Elevate your content effortlessly with RollUp AI. Our intuitive platform empowers you to create engaging
              videos quickly and easily.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white" asChild>
                <Link to="/register">
                  Get Started
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-fuchsia-600 border-fuchsia-600 hover:bg-fuchsia-600/10"
                asChild
              >
                <Link to="/pricing">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden">
            <img
              src="/placeholder.svg?height=600&width=600"
              alt="Person creating video content"
              width={600}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto text-center mb-16">
          <p className="mb-2 text-sm uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">Features</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Elevate Your Video Content <span className="text-fuchsia-600 dark:text-fuchsia-400">Effortlessly</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            At RollUp AI, we empower creators by simplifying video production. Our platform offers seamless video
            storage, intuitive editing, and dynamic enhancements to make your content shine.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            title="Comprehensive Video Storage Solutions"
            description="Easily manage and store your videos for future use."
            icon="storage"
          />
          <FeatureCard
            title="Intuitive Video Editing Made Simple"
            description="Edit your videos on the fly with ease."
            icon="videoEdit"
          />
          <FeatureCard
            title="Enhance with B-Roll Overlays"
            description="Add engaging b-roll content to captivate your audience."
            icon="broll"
          />
        </div>

        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="text-fuchsia-600 border-fuchsia-600 hover:bg-fuchsia-600/10"
              asChild
            >
              <Link to="/pricing">Learn More</Link>
            </Button>
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white" asChild>
              <Link to="/register">
                Sign Up <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="container mx-auto">
          <div className="text-center mb-2 text-sm uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
            Stats
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center">
            Unlock Your <span className="text-fuchsia-600 dark:text-fuchsia-400">Video Editing</span> Potential Today
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mb-16">
            With RollUp AI, you can streamline your video editing process and enhance viewer engagement. Our AI-driven
            tools allow you to add captivating b-rolls and captions effortlessly. Experience the future of content
            creation and save valuable time.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StatCard number={70} label="Editing Time Saved" />
            <StatCard number={50} label="Engagement Boosted" />
            <StatCard number={60} label="Content Creation Simplified" />
          </div>

          <div className="mt-16 text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="text-fuchsia-600 border-fuchsia-600 hover:bg-fuchsia-600/10"
                asChild
              >
                <Link to="/pricing">Learn More</Link>
              </Button>
              <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white" asChild>
                <Link to="/register">
                  Sign Up <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-2 text-sm uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center">
            Don't take <span className="text-fuchsia-600 dark:text-fuchsia-400">our word</span> for it
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-center mb-16">
            Hear from our customers who have experienced the benefits of using RollUp AI for their video editing needs.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestimonialCard
              quote="RollUp AI made video editing so much easier for me!"
              author="Alex Johnson"
              role="Content Creator, YouTube"
            />
            <TestimonialCard
              quote="The B-roll options are fantastic! My videos have never looked better, and I save so much time!"
              author="Tom Brown"
              role="Freelance Videographer"
            />
            <TestimonialCard
              quote="This platform is a game-changer for content creators!"
              author="Jake White"
              role="Video Editor, Studio"
            />
            <TestimonialCard
              quote="The intuitive interface allowed me to create engaging content quickly. I can't imagine going back to my old editing methods!"
              author="Maria Smith"
              role="Marketing Manager, BrandX"
            />
            <TestimonialCard
              quote="RollUp AI has streamlined my workflow and boosted my creativity. Highly recommend it to anyone looking to enhance their videos!"
              author="Lisa Green"
              role="Social Media, Agency"
            />
            <TestimonialCard
              quote="I've never edited videos this quickly or easily before!"
              author="Emily Black"
              role="Content Strategist, Firm"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="container mx-auto grid justify-items-center">
          <div className="text-center mb-2 text-sm uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
            FAQs
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center">
            Common <span className="text-fuchsia-600 dark:text-fuchsia-400">Questions</span>
          </h2>
          <p className="text-lg mb-16 text-center text-muted-foreground">
            Find answers to your most common questions about our video editing platform.
          </p>

          <Accordion type="single" collapsible className="space-y-4 max-w-4xl w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is RollUp AI?</AccordionTrigger>
              <AccordionContent>
                RollUp AI is an innovative SaaS application that transforms your videos using AI technology. It
                simplifies video editing by providing intuitive tools for adding overlays and captions. With RollUp AI,
                you can enhance your content effortlessly.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How does it work?</AccordionTrigger>
              <AccordionContent>
                Simply upload your video to our platform, and our AI will assist in editing. You can add dynamic B-roll,
                captions, and make real-time adjustments. It's designed to save you time and enhance your content.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Is it user-friendly?</AccordionTrigger>
              <AccordionContent>
                Our platform features a simple and intuitive interface that anyone can navigate. You don't need prior
                editing experience to create engaging videos. We prioritize ease of use for all creators.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>What are the costs?</AccordionTrigger>
              <AccordionContent>
                RollUp AI offers a cost-effective solution compared to traditional video editing software. We provide
                various pricing plans to fit your needs. Enjoy powerful features without breaking the bank.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Can I share videos?</AccordionTrigger>
              <AccordionContent>
                Yes, you can easily share your videos across multiple platforms directly from our app. This feature
                allows for seamless content distribution. Maximize your reach with just a few clicks.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-16 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h3>
            <p className="mb-6 text-muted-foreground">We're here to help you!</p>
            <Button
              variant="outline"
              className="text-fuchsia-600 border-fuchsia-600 hover:bg-fuchsia-600/10"
              asChild
            >
              <Link to="/pricing">Contact</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto py-20 px-4 md:px-6 lg:px-8 relative z-20 lg:flex lg:flex-col">
          <div className="w-full flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-4">
              <span className="text-fuchsia-600 dark:text-fuchsia-400">Subscribe</span> & stay updated
            </h3>
            <p className="mb-6 text-muted-foreground">Stay informed about our latest features and updates.</p>
          </div>

          <div className="w-full flex flex-col items-center justify-center">
            <div className="flex gap-4 flex-col sm:flex-row w-8/12">
              <Input type="email" placeholder="Your Email Here" className="border-2 border-border" />
              <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">Subscribe</Button>
            </div>
            <p className="text-sm mt-4 text-muted-foreground/70">By subscribing, you agree to our Privacy Policy.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
