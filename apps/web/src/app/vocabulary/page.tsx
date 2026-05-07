"use client";

import { useState, useEffect } from "react";

interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  sourceSentence?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  status: "new" | "learning" | "mastered";
  createdAt: string;
}

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | "new" | "learning" | "mastered">("all");

  useEffect(() => {
    fetchVocabulary();
  }, [page, filter]);

  interface VocabularyResponse {
  items: VocabularyItem[];
  total: number;
}

async function fetchVocabulary() {
    setLoading(true);
    try {
      const statusParam = filter !== "all" ? `&status=${filter}` : "";
      const response = await fetch(`/api/vocabulary?page=${page}&limit=20${statusParam}`);
      const data = await response.json() as VocabularyResponse;
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch vocabulary:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteWord(id: string) {
    try {
      await fetch(`/api/vocabulary/${id}`, { method: "DELETE" });
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete word:", error);
    }
  }

  async function updateStatus(id: string, status: VocabularyItem["status"]) {
    try {
      setItems(items.map((item) => (item.id === id ? { ...item, status } : item)));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Vocabulary</h1>

      <div className="flex gap-2 mb-6">
        {(["all", "new", "learning", "mastered"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === status
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No words saved yet.</p>
          <p className="text-sm">Start reading and save words you want to learn!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">{item.word}</h3>
                  <p className="text-blue-600 mt-1">{item.translation}</p>
                  {item.sourceSentence && (
                    <p className="text-gray-500 text-sm mt-2 italic">
                      &quot;{item.sourceSentence}&quot;
                    </p>
                  )}
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-sm hover:underline mt-1 block"
                    >
                      {item.sourceTitle || item.sourceUrl}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      updateStatus(item.id, e.target.value as VocabularyItem["status"])
                    }
                    className="text-sm border border-gray-200 rounded px-2 py-1"
                  >
                    <option value="new">New</option>
                    <option value="learning">Learning</option>
                    <option value="mastered">Mastered</option>
                  </select>
                  <button
                    onClick={() => deleteWord(item.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {Math.ceil(total / 20)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
              className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
