"use client";

// --- Types ---

interface Topic {
  name: string;
  chats: number;
  percentage: number;
}

// --- Constants ---

const TOPICS: Topic[] = [
  { name: "Project Alpha", chats: 84, percentage: 82 },
  { name: "Financial Planning", chats: 56, percentage: 64 },
  { name: "Health Metrics", chats: 32, percentage: 41 },
  { name: "Travel Logistics", chats: 18, percentage: 22 },
  { name: "Code Reviews", chats: 14, percentage: 17 },
];

// --- Component ---

export function TopTopics() {
  return (
    <div className="bg-[rgba(23,31,51,0.6)] backdrop-blur-xl border border-[#4a4455]/15 p-8 rounded-xl h-[340px] flex flex-col">
      <h3 className="font-[family-name:'Space_Grotesk'] text-lg font-bold text-[#dae2fd] mb-6">
        Top Topics
      </h3>
      <div className="flex-1 space-y-5">
        {TOPICS.map((topic) => (
          <div key={topic.name} className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#dae2fd]">{topic.name}</span>
              <span className="text-[#958da1]">{topic.chats} chats</span>
            </div>
            <div className="h-2 w-full bg-[#060e20] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7c3aed] rounded-full transition-all duration-700"
                style={{ width: `${topic.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
