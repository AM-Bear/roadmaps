import { DEFAULT_CATS } from "./seeds.js";
import { DEFAULT_NODE_TYPES, DEFAULT_FEATURES } from "../constants.js";

function tmpl(name, description, nodes, edges = [], categories = null, nodeTypes = null) {
  return {
    name,
    description,
    previewNodes: nodes.length,
    nodes,
    edges,
    categories: categories || DEFAULT_CATS.map(c => ({ ...c })),
    groups: [],
    pan: { x: 40, y: 40 },
    zoom: 0.55,
    features: { ...DEFAULT_FEATURES },
    people: [],
    nodeTypes: (nodeTypes || DEFAULT_NODE_TYPES).map(t => ({ ...t })),
  };
}

export const BUILTIN_TEMPLATES = [
  tmpl("Blank", "Empty board — start from scratch.", []),

  tmpl("Project Plan", "Phases, tasks, and milestones for a project.", [
    { id: "pp1", x: 100, y: 100, cat: "foundations", rank: 1, status: "none", title: "Define scope", url: "", notes: "", nodeType: "task" },
    { id: "pp2", x: 350, y: 100, cat: "foundations", rank: 2, status: "none", title: "Design", url: "", notes: "", nodeType: "task" },
    { id: "pp3", x: 600, y: 100, cat: "foundations", rank: 3, status: "none", title: "Build", url: "", notes: "", nodeType: "task" },
    { id: "pp4", x: 850, y: 100, cat: "foundations", rank: 4, status: "none", title: "Launch", url: "", notes: "", nodeType: "milestone" },
    { id: "pp5", x: 100, y: 260, cat: "chatgpt",     rank: 2, status: "none", title: "Requirements doc", url: "", notes: "", nodeType: "note" },
    { id: "pp6", x: 350, y: 260, cat: "chatgpt",     rank: 2, status: "none", title: "Wireframes", url: "", notes: "", nodeType: "resource" },
  ], [
    { id: "pe1", from: "pp1", to: "pp2", label: "" },
    { id: "pe2", from: "pp2", to: "pp3", label: "" },
    { id: "pe3", from: "pp3", to: "pp4", label: "" },
    { id: "pe4", from: "pp1", to: "pp5", label: "" },
    { id: "pe5", from: "pp2", to: "pp6", label: "" },
  ]),

  tmpl("Sprint Board", "Two-week sprint with backlog, in-progress, and done columns.", [
    { id: "sb1", x: 100, y: 100, cat: "foundations", rank: 1, status: "todo",       title: "Backlog item 1", url: "", notes: "", nodeType: "task" },
    { id: "sb2", x: 100, y: 220, cat: "foundations", rank: 1, status: "todo",       title: "Backlog item 2", url: "", notes: "", nodeType: "task" },
    { id: "sb3", x: 380, y: 100, cat: "chatgpt",     rank: 1, status: "inprogress", title: "In progress 1",  url: "", notes: "", nodeType: "task" },
    { id: "sb4", x: 380, y: 220, cat: "chatgpt",     rank: 1, status: "inprogress", title: "In progress 2",  url: "", notes: "", nodeType: "task" },
    { id: "sb5", x: 660, y: 100, cat: "n8n",         rank: 1, status: "done",       title: "Done item 1",    url: "", notes: "", nodeType: "task" },
    { id: "sb6", x: 660, y: 220, cat: "n8n",         rank: 1, status: "done",       title: "Done item 2",    url: "", notes: "", nodeType: "task" },
  ]),

  tmpl("Learning Roadmap", "Sequential learning path with resources and milestones.", [
    { id: "lr1", x: 100, y: 200, cat: "foundations", rank: 1, status: "none", title: "Fundamentals",    url: "", notes: "", nodeType: "default" },
    { id: "lr2", x: 360, y: 200, cat: "chatgpt",     rank: 2, status: "none", title: "Core concepts",   url: "", notes: "", nodeType: "resource" },
    { id: "lr3", x: 620, y: 200, cat: "claude",      rank: 3, status: "none", title: "Practice project",url: "", notes: "", nodeType: "task" },
    { id: "lr4", x: 880, y: 200, cat: "advanced",    rank: 4, status: "none", title: "Mastery check",   url: "", notes: "", nodeType: "milestone" },
  ], [
    { id: "le1", from: "lr1", to: "lr2", label: "" },
    { id: "le2", from: "lr2", to: "lr3", label: "" },
    { id: "le3", from: "lr3", to: "lr4", label: "" },
  ]),

  tmpl("Content Calendar", "Plan content by type and status.", [
    { id: "cc1", x: 100, y: 100, cat: "productivity", rank: 1, status: "none",       title: "Blog post idea",   url: "", notes: "", nodeType: "note" },
    { id: "cc2", x: 100, y: 240, cat: "productivity", rank: 1, status: "none",       title: "Video script",     url: "", notes: "", nodeType: "note" },
    { id: "cc3", x: 380, y: 100, cat: "chatgpt",      rank: 2, status: "inprogress", title: "Draft blog post",  url: "", notes: "", nodeType: "task" },
    { id: "cc4", x: 380, y: 240, cat: "chatgpt",      rank: 2, status: "inprogress", title: "Film video",       url: "", notes: "", nodeType: "task" },
    { id: "cc5", x: 660, y: 170, cat: "n8n",          rank: 3, status: "none",       title: "Publish",          url: "", notes: "", nodeType: "milestone" },
  ], [
    { id: "ce1", from: "cc1", to: "cc3", label: "" },
    { id: "ce2", from: "cc2", to: "cc4", label: "" },
    { id: "ce3", from: "cc3", to: "cc5", label: "" },
    { id: "ce4", from: "cc4", to: "cc5", label: "" },
  ]),

  tmpl("Team Onboarding", "Steps to onboard a new team member.", [
    { id: "to1", x: 100, y: 100, cat: "foundations", rank: 1, status: "none", title: "Send welcome email",  url: "", notes: "", nodeType: "task" },
    { id: "to2", x: 100, y: 240, cat: "foundations", rank: 1, status: "none", title: "Set up accounts",     url: "", notes: "", nodeType: "task" },
    { id: "to3", x: 380, y: 100, cat: "chatgpt",     rank: 2, status: "none", title: "Intro to team",       url: "", notes: "", nodeType: "task" },
    { id: "to4", x: 380, y: 240, cat: "chatgpt",     rank: 2, status: "none", title: "Tools walkthrough",   url: "", notes: "", nodeType: "resource" },
    { id: "to5", x: 660, y: 170, cat: "advanced",    rank: 3, status: "none", title: "First contribution",  url: "", notes: "", nodeType: "milestone" },
  ], [
    { id: "toe1", from: "to1", to: "to3", label: "" },
    { id: "toe2", from: "to2", to: "to4", label: "" },
    { id: "toe3", from: "to3", to: "to5", label: "" },
    { id: "toe4", from: "to4", to: "to5", label: "" },
  ]),
];
