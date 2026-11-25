import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { useGetList, useCreate, useNotify } from "ra-core";
import {
  Hash,
  Send,
  Paperclip,
  FolderKanban,
  ExternalLink,
  Plus,
  Search,
  Users,
  Download,
  FileText,
  User,
  ArrowRight,
  ArrowLeft,
  ThumbsUp,
  Heart,
  Check,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "../providers/fakerest/dataGenerator/sales";
import { NewChannelModal } from "./NewChannelModal";
import { AttachProjectModal } from "./AttachProjectModal";
import type { Conversation, Message, Project } from "../types";

export const MessengerPage = () => {
  const notify = useNotify();
  const [create] = useCreate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active channel id from URL query or default to 1
  const initialConvId = Number(searchParams.get("c")) || 1;
  const [selectedConvId, setSelectedConvId] = useState<number>(initialConvId);
  const [showMobileChat, setShowMobileChat] = useState<boolean>(true);

  const [companyFilter, setCompanyFilter] = useState<
    "all" | "goldland" | "abbadi" | "casavera"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [isAttachProjectModalOpen, setIsAttachProjectModalOpen] =
    useState(false);
  const [stagedAttachment, setStagedAttachment] = useState<{
    file_name: string;
    file_type: string;
    file_size: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations, messages, and projects
  const { data: serverConversations = [], refetch: refetchConversations } =
    useGetList<Conversation>("conversations", {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "id", order: "ASC" },
    });

  const { data: serverMessages = [], refetch: refetchMessages } =
    useGetList<Message>("messages", {
      pagination: { page: 1, perPage: 300 },
      sort: { field: "created_at", order: "ASC" },
    });

  const { data: projects = [] } = useGetList<Project>("projects", {
    pagination: { page: 1, perPage: 50 },
    sort: { field: "id", order: "ASC" },
  });

  // Local state for optimistic updates
  const [localConversations, setLocalConversations] =
    useState<Conversation[]>(serverConversations);
  const [localMessages, setLocalMessages] = useState<Message[]>(serverMessages);

  useEffect(() => {
    if (serverConversations.length > 0)
      setLocalConversations(serverConversations);
  }, [serverConversations]);

  useEffect(() => {
    if (serverMessages.length > 0) setLocalMessages(serverMessages);
  }, [serverMessages]);

  // Real-time synchronization for messages and conversations
  useEffect(() => {
    const handleMessageSync = () => {
      refetchMessages();
      refetchConversations();
    };
    window.addEventListener("group-crm:message-sent", handleMessageSync);
    window.addEventListener("group-crm:mutation", handleMessageSync);
    const interval = setInterval(handleMessageSync, 4000);
    return () => {
      window.removeEventListener("group-crm:message-sent", handleMessageSync);
      window.removeEventListener("group-crm:mutation", handleMessageSync);
      clearInterval(interval);
    };
  }, [refetchMessages, refetchConversations]);

  useEffect(() => {
    const cParam = Number(searchParams.get("c"));
    if (cParam && cParam !== selectedConvId) {
      setSelectedConvId(cParam);
    }
  }, [searchParams]);

  const selectConversation = (id: number) => {
    setSelectedConvId(id);
    setShowMobileChat(true);
    setSearchParams({ c: id.toString() });
  };

  // Scroll to bottom when conversation or message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConvId, localMessages.length]);

  const activeConversation =
    localConversations.find((c) => c.id === selectedConvId) ||
    localConversations[0];

  const currentMessages = localMessages.filter(
    (m) => m.conversation_id === selectedConvId,
  );

  // Filter conversations based on entity and search
  const filteredConversations = localConversations.filter((c) => {
    if (companyFilter !== "all") {
      if (
        c.operating_company &&
        c.operating_company !== "group" &&
        c.operating_company !== companyFilter
      ) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      return matchName || matchDesc;
    }
    return true;
  });

  const channelsList = filteredConversations.filter(
    (c) => c.type === "channel",
  );
  const projectChatsList = filteredConversations.filter(
    (c) => c.type === "project",
  );
  const dmChatsList = filteredConversations.filter((c) => c.type === "dm");

  // Current logged in persona (default to Navas)
  const currentUserId = 0;
  const currentPersona =
    TEAM_MEMBERS.find((m) => m.id === currentUserId) || TEAM_MEMBERS[0];

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !stagedAttachment) return;

    // Detect project reference tags like #GL-PRJ-2026-001
    const matchTag = inputText.match(/#(GL|AT|CV)-PRJ-\d{4}-\d{3}/i);
    let linkedProjRef: string | undefined = undefined;
    let linkedProjId: number | undefined = undefined;

    if (matchTag) {
      linkedProjRef = matchTag[0].toUpperCase();
      const found = projects.find(
        (p) => p.reference_no.toUpperCase() === linkedProjRef,
      );
      if (found) linkedProjId = Number(found.id);
    } else if (activeConversation?.project_id) {
      linkedProjId = Number(activeConversation.project_id);
      linkedProjRef = activeConversation.project_name;
    }

    const newMessage: Message = {
      id: Date.now(),
      conversation_id: selectedConvId,
      sender_id: currentPersona.id,
      sender_name: currentPersona.first_name,
      sender_role: currentPersona.job_title || "Team Lead",
      body: inputText.trim(),
      reactions: [],
      attachments: stagedAttachment
        ? [
            {
              file_name: stagedAttachment.file_name,
              file_type: stagedAttachment.file_type,
              file_url: "#",
              file_size: stagedAttachment.file_size,
            },
          ]
        : [],
      project_ref: linkedProjRef,
      project_id: linkedProjId,
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setLocalMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setStagedAttachment(null);

    try {
      await create(
        "messages",
        { data: newMessage },
        {
          onSuccess: () => {
            refetchMessages();
          },
        },
      );
    } catch {
      // Local state already updated
    }
  };

  const handleCreateChannel = async (
    newChan: Omit<Conversation, "id" | "created_at" | "unread_count">,
  ) => {
    const created: Conversation = {
      ...newChan,
      id: Date.now(),
      unread_count: 0,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    };

    setLocalConversations((prev) => [...prev, created]);
    setSelectedConvId(created.id);
    setSearchParams({ c: created.id.toString() });

    try {
      await create(
        "conversations",
        { data: created },
        {
          onSuccess: () => {
            notify("Channel created successfully", { type: "success" });
            refetchConversations();
          },
        },
      );
    } catch {
      notify("Channel created locally", { type: "info" });
    }
  };

  const toggleReaction = (messageId: number, emoji: string) => {
    setLocalMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const existingReactions = msg.reactions || [];
        const foundReaction = existingReactions.find((r) => r.emoji === emoji);

        let updatedReactions;
        if (foundReaction) {
          const userHasReacted = foundReaction.users.includes(
            currentPersona.id,
          );
          if (userHasReacted) {
            updatedReactions = existingReactions
              .map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count - 1,
                      users: r.users.filter((u) => u !== currentPersona.id),
                    }
                  : r,
              )
              .filter((r) => r.count > 0);
          } else {
            updatedReactions = existingReactions.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count + 1,
                    users: [...r.users, currentPersona.id],
                  }
                : r,
            );
          }
        } else {
          updatedReactions = [
            ...existingReactions,
            { emoji, count: 1, users: [currentPersona.id] },
          ];
        }

        return { ...msg, reactions: updatedReactions };
      }),
    );
  };

  const getCompanyBadge = (comp?: string) => {
    switch (comp) {
      case "goldland":
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20"
          >
            GL · Goldland
          </Badge>
        );
      case "abbadi":
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20"
          >
            AT · Abbadi Tech
          </Badge>
        );
      case "casavera":
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          >
            CV · Casavera
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-slate-500/10 text-slate-400 border-slate-500/20"
          >
            Group
          </Badge>
        );
    }
  };

  return (
    <div className="w-full h-[calc(100vh-5rem)] flex flex-col pb-4">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div>
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Group Team Messenger & Project Rooms
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Internal departmental coordination, site issue channels, and 1-on-1
            team messaging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Company filter */}
          <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border text-xs">
            {(["all", "goldland", "abbadi", "casavera"] as const).map(
              (comp) => (
                <button
                  key={comp}
                  type="button"
                  onClick={() => setCompanyFilter(comp)}
                  className={`px-3 py-1 font-semibold rounded-lg capitalize transition-colors ${
                    companyFilter === comp
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {comp === "all"
                    ? "All Channels"
                    : comp === "goldland"
                      ? "Goldland"
                      : comp === "abbadi"
                        ? "Abbadi"
                        : "Casavera"}
                </button>
              ),
            )}
          </div>

          <Button
            size="sm"
            onClick={() => setIsNewChannelModalOpen(true)}
            className="text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Channel
          </Button>
        </div>
      </div>

      {/* Main Two-Column Messenger Body */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 pt-3 min-h-0 w-full overflow-hidden">
        {/* Left Sidebar: Channels & DMs */}
        <div
          className={`${showMobileChat ? "hidden md:flex" : "flex"} w-full md:w-72 lg:w-80 shrink-0 flex-col rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm overflow-hidden min-h-0 shadow-sm`}
        >
          {/* Search channel */}
          <div className="p-3 border-b border-border/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search channels or DMs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Channels & DM scrollable container */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs scrollbar-thin">
            {/* 1. Departmental Channels */}
            <div className="space-y-1">
              <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
                <span>Channels</span>
                <span>{channelsList.length}</span>
              </span>
              <div className="space-y-0.5 pt-1">
                {channelsList.map((chan) => {
                  const isSelected = chan.id === selectedConvId;
                  return (
                    <button
                      key={chan.id}
                      type="button"
                      onClick={() => selectConversation(chan.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Hash className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{chan.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {chan.unread_count > 0 && !isSelected && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary text-primary-foreground font-bold">
                            {chan.unread_count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Project Site Threads */}
            <div className="space-y-1">
              <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
                <span>Project Rooms</span>
                <span>{projectChatsList.length}</span>
              </span>
              <div className="space-y-0.5 pt-1">
                {projectChatsList.map((projChan) => {
                  const isSelected = projChan.id === selectedConvId;
                  return (
                    <button
                      key={projChan.id}
                      type="button"
                      onClick={() => selectConversation(projChan.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FolderKanban className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{projChan.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {projChan.unread_count > 0 && !isSelected && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-bold">
                            {projChan.unread_count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Direct Messages */}
            <div className="space-y-1">
              <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
                <span>Direct Messages</span>
                <span>{dmChatsList.length}</span>
              </span>
              <div className="space-y-0.5 pt-1">
                {dmChatsList.map((dm) => {
                  const isSelected = dm.id === selectedConvId;
                  return (
                    <button
                      key={dm.id}
                      type="button"
                      onClick={() => selectConversation(dm.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                          {dm.name?.slice(0, 1) || "U"}
                        </div>
                        <span className="truncate">{dm.name}</span>
                      </div>
                      {dm.unread_count > 0 && !isSelected && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary text-primary-foreground font-bold">
                          {dm.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Active Chat Pane */}
        <div
          className={`${showMobileChat ? "flex" : "hidden md:flex"} flex-1 min-w-0 flex-col rounded-2xl border border-border/70 bg-card overflow-hidden min-h-0 shadow-sm`}
        >
          {/* Active Chat Header */}
          <div className="p-4 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
            <div className="flex items-center gap-3">
              {/* Mobile Back Button */}
              <button
                type="button"
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground shrink-0"
                title="Back to Channels"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {activeConversation?.type === "project" ? (
                  <FolderKanban className="w-5 h-5" />
                ) : activeConversation?.type === "dm" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Hash className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">
                    {activeConversation?.name || "Team Chat"}
                  </h2>
                  {getCompanyBadge(activeConversation?.operating_company)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {activeConversation?.description ||
                    "Active team discussion thread."}
                </p>
              </div>
            </div>

            {/* If linked to a project, provide 1-click jump to Project Operational Hub */}
            {activeConversation?.project_id && (
              <Link to={`/projects/${activeConversation.project_id}/show`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs flex items-center gap-1.5 text-primary border-primary/30 hover:bg-primary/10 font-bold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Project Hub ({activeConversation.project_name})
                </Button>
              </Link>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
            {currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2">
                <Hash className="w-10 h-10 stroke-1 opacity-50" />
                <p className="font-semibold text-sm">
                  Welcome to #{activeConversation?.name}
                </p>
                <p className="text-xs max-w-sm">
                  This is the start of the #{activeConversation?.name}{" "}
                  conversation. Send the first update!
                </p>
              </div>
            ) : (
              currentMessages.map((msg, index) => {
                const prevMsg = currentMessages[index - 1];
                const showDateHeader =
                  !prevMsg ||
                  new Date(prevMsg.created_at).toDateString() !==
                    new Date(msg.created_at).toDateString();

                return (
                  <div key={msg.id} className="space-y-3">
                    {showDateHeader && (
                      <div className="flex items-center justify-center my-3">
                        <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-muted/60 text-muted-foreground border border-border/50">
                          {new Date(msg.created_at).toLocaleDateString(
                            "en-AE",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-primary/20">
                        {msg.sender_name?.slice(0, 1) || "U"}
                      </div>

                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            {msg.sender_name || "Team Member"}
                          </span>
                          {msg.sender_role && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted/70 text-muted-foreground font-medium">
                              {msg.sender_role}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/70 font-mono ml-auto">
                            {new Date(msg.created_at).toLocaleTimeString(
                              "en-AE",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>

                        {/* Message body */}
                        <div className="p-3 rounded-2xl bg-muted/25 border border-border/50 text-foreground leading-relaxed text-xs">
                          {msg.body}

                          {/* Clickable project tag link */}
                          {msg.project_ref && msg.project_id && (
                            <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-primary">
                                <FolderKanban className="w-3 h-3" />
                                {msg.project_ref}
                              </span>
                              <Link
                                to={`/projects/${msg.project_id}/show`}
                                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                              >
                                Jump to Project Hub{" "}
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Attachments Card */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {msg.attachments.map((att, i) => (
                              <div
                                key={i}
                                className="p-2.5 rounded-xl border border-border/70 bg-background/80 flex items-center justify-between gap-3 max-w-sm"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-4 h-4 text-primary shrink-0" />
                                  <div className="truncate">
                                    <p className="font-semibold text-xs truncate text-foreground">
                                      {att.file_name}
                                    </p>
                                    {att.file_size && (
                                      <span className="text-[10px] text-muted-foreground font-mono">
                                        {att.file_size}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 shrink-0"
                                  onClick={() =>
                                    notify(`Downloading ${att.file_name}...`, {
                                      type: "info",
                                    })
                                  }
                                >
                                  <Download className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reactions bar */}
                        <div className="flex items-center gap-1 pt-1">
                          {msg.reactions &&
                            msg.reactions.map((react, i) => {
                              const userHasReacted = react.users.includes(
                                currentPersona.id,
                              );
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() =>
                                    toggleReaction(msg.id, react.emoji)
                                  }
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition-colors ${
                                    userHasReacted
                                      ? "bg-primary/15 border-primary text-primary font-bold"
                                      : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted"
                                  }`}
                                >
                                  {react.emoji === "like" ? (
                                    <ThumbsUp className="w-3 h-3 text-primary" />
                                  ) : react.emoji === "love" ? (
                                    <Heart className="w-3 h-3 text-rose-500" />
                                  ) : react.emoji === "check" ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Star className="w-3 h-3 text-amber-500" />
                                  )}
                                  <span>{react.count}</span>
                                </button>
                              );
                            })}

                          {/* Quick Add Reaction Popover triggers */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1">
                            {[
                              { key: "like", icon: ThumbsUp, label: "Like" },
                              { key: "check", icon: Check, label: "Check" },
                              { key: "star", icon: Star, label: "Star" },
                              { key: "love", icon: Heart, label: "Love" },
                            ].map((item) => (
                              <button
                                key={item.key}
                                type="button"
                                title={item.label}
                                onClick={() => toggleReaction(msg.id, item.key)}
                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <item.icon className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer / Input Area */}
          <div className="p-3 border-t border-border/70 bg-muted/10 space-y-2">
            {stagedAttachment && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-primary/10 border border-primary/30 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Attachment: <strong>{stagedAttachment.file_name}</strong> (
                  {stagedAttachment.file_size})
                </span>
                <button
                  type="button"
                  onClick={() => setStagedAttachment(null)}
                  className="text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder={`Message #${activeConversation?.name || "chat"} (Enter to send, Shift+Enter for new line)...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full p-3 pr-12 rounded-xl bg-background border border-border text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />

                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2.5 bottom-3 h-8 w-8 p-0 rounded-lg shadow-sm"
                  disabled={!inputText.trim() && !stagedAttachment}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {/* Link Project button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAttachProjectModalOpen(true)}
                    className="h-7 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-primary" />
                    Link Project
                  </Button>

                  {/* Attach Document mock */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStagedAttachment({
                        file_name: "Inspection_Remedy_Notice_Rev1.pdf",
                        file_type: "application/pdf",
                        file_size: "1.8 MB",
                      });
                      notify("Attached Inspection_Remedy_Notice_Rev1.pdf", {
                        type: "info",
                      });
                    }}
                    className="h-7 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    Attach File
                  </Button>
                </div>

                <span className="text-[11px] text-muted-foreground">
                  Posting as{" "}
                  <strong>
                    {currentPersona.first_name} {currentPersona.last_name}
                  </strong>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* New Channel Modal */}
      <NewChannelModal
        isOpen={isNewChannelModalOpen}
        onClose={() => setIsNewChannelModalOpen(false)}
        projects={projects}
        onCreateChannel={handleCreateChannel}
      />

      {/* Attach Project Modal */}
      <AttachProjectModal
        isOpen={isAttachProjectModalOpen}
        onClose={() => setIsAttachProjectModalOpen(false)}
        projects={projects}
        onSelectProject={(proj) => {
          setInputText((prev) =>
            prev ? `${prev} #${proj.reference_no}` : `#${proj.reference_no} `,
          );
        }}
      />
    </div>
  );
};
