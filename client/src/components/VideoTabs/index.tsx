"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import All from "./Tabs/All";
import Published from "./Tabs/Published";
import Drafts from "./Tabs/Drafts";
import { Text } from "../ui/typography";

export type Tabs = "drafts" | "published" | "all";
export type TabsVideo = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  transcript: string;
  scenes: {
    time: string;
    description: string;
  }[];
  tags: string[];
};

// Mock data for draft videos
const draftVideos: TabsVideo[] = [
  {
    id: "1",
    title: "Meet Danny Duncan-YouTube's Wildest and Smartest Creators",
    thumbnail: "https://source.unsplash.com/random/800x450?youtube",
    duration: "00:58",
    status: "Draft",
    progress: 85,
    createdAt: "2 hours ago",
    updatedAt: "30 minutes ago",
    transcript: "I spent the day with Danny Duncan, who is one of YouTube's wildest creators, but he's also one of the smartest. Oh, you got it running, dude. Hell yeah. Oh, again. Hell yeah. He's back. Oh, my God.",
    scenes: [
      { time: "00:00 - 00:06", description: "Introduction of Danny Duncan as a YouTube creator" },
      { time: "02:29 - 03:07", description: "Playful interaction with emus" }
    ],
    tags: ["creator", "interview", "youtube"]
  },
  {
    id: "2",
    title: "How to Scale Your Business in 2025",
    thumbnail: "https://source.unsplash.com/random/800x450?business",
    duration: "12:45",
    status: "Processing",
    progress: 65,
    createdAt: "1 day ago",
    updatedAt: "3 hours ago",
    transcript: "Today we're going to talk about scaling your business in the current economic climate...",
    scenes: [
      { time: "00:00 - 01:30", description: "Introduction and overview" },
      { time: "01:31 - 04:22", description: "Key strategies for growth" }
    ],
    tags: ["business", "growth", "strategy"]
  },
  {
    id: "3",
    title: "Product Demo: New Features Walkthrough",
    thumbnail: "https://source.unsplash.com/random/800x450?technology",
    duration: "08:22",
    status: "Ready to publish",
    progress: 100,
    createdAt: "3 days ago",
    updatedAt: "1 day ago",
    transcript: "In this video, I'll walk you through all the new features we've added to our platform...",
    scenes: [
      { time: "00:00 - 00:45", description: "Introduction to new features" },
      { time: "00:46 - 03:15", description: "Dashboard walkthrough" }
    ],
    tags: ["product", "demo", "tutorial"]
  }
];

export default function VideosTabs() {
  const [activeTab, setActiveTab] = useState<Tabs>("all");

  const count = activeTab === "drafts" ? 3 : activeTab === "published" ? 0 : 3;

  return (
    <Tabs value={activeTab} onValueChange={tab => setActiveTab(tab as Tabs)} className="space-y-6">

      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setActiveTab("all")}>
            All
          </TabsTrigger>
          <TabsTrigger value="drafts" onClick={() => setActiveTab("drafts")}>
            Drafts
          </TabsTrigger>
          <TabsTrigger value="published" onClick={() => setActiveTab("published")}>
            Published
          </TabsTrigger>
        </TabsList>
        <Text variant="muted" className="font-medium !text-base">
          {count} videos
        </Text>
      </div>

      <Drafts draftVideos={draftVideos} />
      <Published publishedVideos={[]} />
      <All allVideos={draftVideos} />
    </Tabs>
  )
}


