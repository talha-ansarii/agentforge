import { create } from "zustand";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { url: string; title: string }[];
  createdAt: string;
}

export interface ChatThread {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

interface ChatState {
  // Thread state
  threads: ChatThread[];
  activeThreadId: string | null;
  isLoadingThreads: boolean;

  // Message state
  messages: ChatMessage[];
  isLoadingMessages: boolean;

  // Streaming state
  isStreaming: boolean;
  streamingContent: string;

  // Error state
  error: string | null;

  // Actions
  setThreads: (threads: ChatThread[]) => void;
  setActiveThreadId: (id: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsStreaming: (streaming: boolean) => void;
  setStreamingContent: (content: string) => void;
  appendStreamingContent: (token: string) => void;
  setIsLoadingThreads: (loading: boolean) => void;
  setIsLoadingMessages: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  threads: [],
  activeThreadId: null,
  isLoadingThreads: true,
  messages: [],
  isLoadingMessages: false,
  isStreaming: false,
  streamingContent: "",
  error: null,

  setThreads: (threads) => set({ threads }),
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setStreamingContent: (streamingContent) => set({ streamingContent }),
  appendStreamingContent: (token) =>
    set((state) => ({
      streamingContent: state.streamingContent + token,
    })),
  setIsLoadingThreads: (isLoadingThreads) => set({ isLoadingThreads }),
  setIsLoadingMessages: (isLoadingMessages) => set({ isLoadingMessages }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      messages: [],
      activeThreadId: null,
      isStreaming: false,
      streamingContent: "",
      error: null,
    }),
}));
