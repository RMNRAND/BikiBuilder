"use client";

import React, { useState, useEffect } from "react";
import { Plus, Folder, Calendar, GitBranch, LayoutGrid } from "lucide-react";

interface BikiProject {
  id: string;
  name: string;
  path: string;
  lastModified: string;
}

interface ChangelogItem {
  version: string;
  date: string;
  type: "feat" | "fix" | "chore";
  text: string;
}

export default function BikiHubHome() {
  const [projects] = useState<BikiProject[]>([
    { id: "1", name: "Roman's Portfolio", path: "/Users/romanrand/BikiProjects/portfolio", lastModified: "2 hours ago" },
    { id: "2", name: "Cyberpunk Wiki", path: "/Users/romanrand/BikiProjects/cyberpunk-wiki", lastModified: "Yesterday" },
  ]);

  // State to hold live changelog items
  const [changelog, setChangelog] = useState<ChangelogItem[]>([]);
  const [isLoadingChangelog, setIsLoadingChangelog] = useState<boolean>(true);

  useEffect(() => {
    async function fetchChangelog() {
      try {
        // Replace with your actual GitHub username and repo name once pushed!
        const url = "https://raw.githubusercontent.com/romanrand/BikiEngine/main/changelog.txt";
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Failed to stream repository changelog");
        
        const rawText = await response.text();
        
        // Parse the text lines into structured objects
        const parsedItems = rawText
          .split("\n")
          .filter(line => line.trim() !== "") // Skip empty lines
          .map(line => {
            const [version, date, type, text] = line.split("|").map(item => item.trim());
            return {
              version: version || "v0.0.0",
              date: date || "Unknown Date",
              type: (type === "fix" || type === "feat" || type === "chore" ? type : "chore") as ChangelogItem["type"],
              text: text || "System maintenance update."
            };
          });

        setChangelog(parsedItems);
      } catch (error) {
        console.error("⚠️ Changelog fetch error:", error);
        // Fallback UI data if offline
        setChangelog([
          { version: "v1.0.0", date: "Offline", type: "chore", text: "Unable to sync with remote repository." }
        ]);
      } finally {
        setIsLoadingChangelog(false);
      }
    }

    fetchChangelog();
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* LEFT SIDE: 70% Width Projects Window */}
      <main className="w-[70%] h-full p-8 flex flex-col justify-between overflow-y-auto border-r border-slate-900">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-400 border border-blue-500/20">
              <LayoutGrid size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Biki Hub
            </h1>
          </div>
          <p className="text-sm text-slate-400">Manage, launch, and compile your custom visual canvas installations.</p>
          
          <div className="mt-8">
            <button className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-900/30 transition-all duration-200 active:scale-[0.98]">
              <Plus size={20} />
              Create New Canvas Project
            </button>
          </div>
        </div>

        <div className="flex-1 mt-12 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Workspaces</h2>
            <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-mono">{projects.length} Total</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {projects.map((project) => (
              <div key={project.id} className="group flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900/60 hover:border-slate-800 rounded-xl transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400">
                    <Folder size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-200">{project.name}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{project.path}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 flex items-center gap-1.5"><Calendar size={12} />{project.lastModified}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* RIGHT SIDE: 30% Width Changelog Feed */}
      <aside className="w-[30%] h-full bg-slate-900/20 p-6 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-900 mb-6">
          <GitBranch size={16} className="text-indigo-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Engine Changelog</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {isLoadingChangelog ? (
            // Shimmer / Loading State
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-900 rounded w-1/4"></div>
              <div className="h-12 bg-slate-900 rounded w-full"></div>
            </div>
          ) : (
            changelog.map((item, index) => (
              <div key={index} className="relative pl-5 border-l border-slate-800 group">
                <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-slate-800 group-hover:bg-indigo-500 border border-slate-950 transition-all" />
                
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/30">
                    {item.version}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                    item.type === "feat" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/20" :
                    item.type === "fix" ? "bg-amber-950/50 text-amber-400 border border-amber-900/20" :
                    "bg-slate-800 text-slate-400"
                  }`}>
                    {item.type}
                  </span>
                </div>
                
                <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
                <span className="block text-[10px] text-slate-500 font-mono mt-1">{item.date}</span>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}