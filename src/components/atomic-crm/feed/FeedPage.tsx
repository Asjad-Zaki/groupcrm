import { useState, useMemo } from "react";
import { useGetList, useCreate, useUpdate, useNotify } from "ra-core";
import {
  Megaphone,
  Award,
  Heart,
  MessageSquare,
  Plus,
  Building2,
  Briefcase,
  Send,
  Zap,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "./CreatePostModal";
import type { FeedPost } from "../types";

export const FeedPage = () => {
  const notify = useNotify();
  const [create] = useCreate();
  const [update] = useUpdate();

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string | number, boolean>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | number | null>(null);
  const [commentText, setCommentText] = useState("");

  const { data: posts = [], refetch } = useGetList<FeedPost>("feed_posts", {
    pagination: { page: 1, perPage: 50 },
    sort: { field: "created_at", order: "DESC" },
  });

  const filteredPosts = useMemo(() => {
    if (typeFilter === "all") return posts;
    return posts.filter((p) => p.type === typeFilter);
  }, [posts, typeFilter]);

  const handleCreatePost = async (newPost: Omit<FeedPost, "id">) => {
    await create("feed_posts", { data: newPost });
    refetch();
  };

  const handleLike = async (post: FeedPost) => {
    const isCurrentlyLiked = Boolean(likedPosts[post.id]);
    const nextCount = isCurrentlyLiked ? post.likes_count - 1 : post.likes_count + 1;

    setLikedPosts((prev) => ({ ...prev, [post.id]: !isCurrentlyLiked }));

    const updated = {
      ...post,
      likes_count: nextCount,
    };

    await update("feed_posts", {
      id: post.id,
      data: updated,
      previousData: post,
    });
    refetch();
  };

  const handleAddComment = async (post: FeedPost) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      author: "Navas (MD)",
      text: commentText.trim(),
      created_at: new Date().toISOString(),
    };

    const updated = {
      ...post,
      comments_count: (post.comments_count || 0) + 1,
      comments: [...(post.comments || []), newComment],
    };

    await update("feed_posts", {
      id: post.id,
      data: updated,
      previousData: post,
    });

    setCommentText("");
    notify("Comment posted", { type: "info" });
    refetch();
  };

  const getBadgeDetails = (badge?: FeedPost["badge"]) => {
    switch (badge) {
      case "fast_approvals":
        return {
          icon: Zap,
          title: "Fast Approvals & NOC Champion",
          color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        };
      case "deal_closer":
        return {
          icon: Briefcase,
          title: "High-Value Deal Closer",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      case "safety_champion":
        return {
          icon: ShieldCheck,
          title: "Zero Incident Site Safety Champion",
          color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        };
      case "star_performer":
      default:
        return {
          icon: Star,
          title: "Star Performer Recognition",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Bitrix24 Company Feed & Recognitions
            </h2>
            <p className="text-xs text-muted-foreground">
              Live group pulse, project milestone celebrations, and peer appreciation badges.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary text-primary-foreground text-xs font-semibold gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" /> Share Update / Award Badge
        </Button>
      </div>

      {/* Quick Compose Trigger Card */}
      <Card
        onClick={() => setIsCreateOpen(true)}
        className="bg-card/50 border-border/80 hover:bg-card/80 transition-all cursor-pointer p-4 rounded-2xl shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            NV
          </div>
          <div className="flex-1 bg-muted/40 border border-border rounded-xl px-4 py-2.5 text-xs text-muted-foreground">
            What's new across our sites & studios? Share an announcement or award an appreciation badge...
          </div>
          <Button type="button" size="sm" className="text-xs gap-1">
            <Award className="w-3.5 h-3.5" /> Award Badge
          </Button>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center bg-card/60 p-1.5 rounded-xl border border-border/60 text-xs font-medium overflow-x-auto gap-1">
        <button
          type="button"
          onClick={() => setTypeFilter("all")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            typeFilter === "all"
              ? "bg-primary/10 text-primary font-bold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Stream ({posts.length})
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter("announcement")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            typeFilter === "announcement"
              ? "bg-primary/10 text-primary font-bold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" /> Announcements
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter("appreciation")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            typeFilter === "appreciation"
              ? "bg-primary/10 text-primary font-bold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Appreciations
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter("milestone")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            typeFilter === "milestone"
              ? "bg-primary/10 text-primary font-bold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> Milestones
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter("deal")}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
            typeFilter === "deal"
              ? "bg-primary/10 text-primary font-bold shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" /> Commercial Wins
        </button>
      </div>

      {/* Stream Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isLiked = Boolean(likedPosts[post.id]);
          const badgeMeta = post.badge ? getBadgeDetails(post.badge) : null;
          const BadgeIcon = badgeMeta?.icon || Star;
          const isCommenting = activeCommentPostId === post.id;

          return (
            <Card
              key={post.id}
              className="bg-card/40 border-border/80 shadow-sm rounded-2xl overflow-hidden hover:border-border transition-all"
            >
              <CardContent className="p-6 space-y-4">
                {/* Author Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/30">
                      {post.author_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {post.author_name}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            post.type === "appreciation"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                              : post.type === "milestone"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]"
                                : post.type === "deal"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]"
                                  : "bg-primary/10 text-primary border-primary/30 text-[10px]"
                          }
                        >
                          {post.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {post.author_role} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Title & Content */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-foreground">{post.title}</h3>
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* If Appreciation: Bitrix24 Recognition Badge Widget */}
                {post.type === "appreciation" && badgeMeta && (
                  <div className={`p-4 rounded-xl border flex items-center gap-4 ${badgeMeta.color}`}>
                    <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
                      <BadgeIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400">
                        Bitrix24 Appreciation Award
                      </span>
                      <p className="text-sm font-bold text-foreground">
                        Awarded to: <strong className="text-amber-300">{post.recipient_name}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground">{badgeMeta.title}</p>
                    </div>
                  </div>
                )}

                {/* Interaction Footer: Like & Comment Controls */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleLike(post)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                        isLiked
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : "border-border/60 hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                      <span>{post.likes_count} Likes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveCommentPostId(isCommenting ? null : post.id)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 hover:text-foreground hover:bg-muted/40 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments_count || (post.comments?.length ?? 0)} Comments</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {isCommenting && (
                  <div className="pt-3 border-t border-border/40 space-y-3 animate-in fade-in">
                    {/* Existing Comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="text-xs space-y-0.5">
                            <span className="font-bold text-foreground">{comment.author}</span>
                            <p className="text-muted-foreground">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Write a congratulatory comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post);
                        }}
                        className="flex-1 text-xs bg-muted/40 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddComment(post)}
                        className="text-xs gap-1 font-semibold"
                      >
                        <Send className="w-3 h-3" /> Post
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreatePost={handleCreatePost}
      />
    </div>
  );
};
