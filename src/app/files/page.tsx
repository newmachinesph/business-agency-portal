"use client";

import { useRef, useState } from "react";
import {
  ChevronRight,
  Clock3,
  Download,
  File as FileIcon,
  Folder,
  FolderPlus,
  Grid2x2,
  HardDrive,
  List,
  Pencil,
  Share2,
  Star,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { bytes, relTime } from "@/lib/format";
import { Avatar, Chip, Empty, Modal } from "@/components/ui";
import type { FileNode, Id } from "@/lib/types";

const EXT_COLOR: Record<string, string> = {
  fig: "#f0568c",
  pdf: "#ef4444",
  png: "#06b6d4",
  svg: "#f59e0b",
  docx: "#3b82f6",
  json: "#8b93a7",
  csv: "#12b981",
  mp4: "#7c5cff",
  md: "#4b5565",
  zip: "#f59e0b",
  xlsx: "#12b981",
};

const STORAGE_LIMIT = 2 * 1024 ** 3; // 2 GB

export default function FilesPage() {
  const {
    files,
    users,
    projects,
    addFolder,
    uploadFile,
    renameNode,
    deleteNode,
    toggleStar,
    toggleShare,
    moveNode,
  } = useStore();

  const [cwd, setCwd] = useState<Id | null>(null);
  const [filter, setFilter] = useState<"all" | "starred" | "shared" | "recent">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [preview, setPreview] = useState<FileNode | null>(null);
  const [dragOver, setDragOver] = useState<Id | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const used = files.reduce((n, f) => n + (f.size ?? 0), 0);

  const crumbs: FileNode[] = [];
  let cursor = cwd;
  while (cursor) {
    const node = files.find((f) => f.id === cursor);
    if (!node) break;
    crumbs.unshift(node);
    cursor = node.parentId;
  }

  const listed =
    filter === "all"
      ? files.filter((f) => f.parentId === cwd)
      : filter === "starred"
        ? files.filter((f) => f.starred)
        : filter === "shared"
          ? files.filter((f) => f.shared)
          : [...files]
              .filter((f) => f.kind === "file")
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .slice(0, 12);

  const folders = listed.filter((f) => f.kind === "folder");
  const docs = listed.filter((f) => f.kind === "file");

  function onUpload(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach((f) => uploadFile(f.name, f.size, cwd));
  }

  const Icon = ({ node, size = 20 }: { node: FileNode; size?: number }) =>
    node.kind === "folder" ? (
      <Folder size={size} style={{ color: projects.find((p) => p.id === node.projectId)?.color ?? "#8b93a7" }} />
    ) : (
      <span
        className="grid place-items-center rounded-md font-mono text-[9px] font-bold text-white uppercase"
        style={{ width: size + 6, height: size + 6, background: EXT_COLOR[node.ext ?? ""] ?? "#8b93a7" }}
      >
        {node.ext}
      </span>
    );

  const Actions = ({ node }: { node: FileNode }) => (
    <div className="flex items-center gap-0.5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleStar(node.id);
        }}
        title="Star"
        className={`rounded-md p-1.5 transition hover:bg-canvas ${
          node.starred ? "text-amber" : "text-ink-faint"
        }`}
      >
        <Star size={14} fill={node.starred ? "#f59e0b" : "none"} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleShare(node.id);
        }}
        title="Share"
        className={`rounded-md p-1.5 transition hover:bg-canvas ${
          node.shared ? "text-brand" : "text-ink-faint"
        }`}
      >
        <Share2 size={14} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const name = prompt("Rename", node.name);
          if (name?.trim()) renameNode(node.id, name.trim());
        }}
        title="Rename"
        className="rounded-md p-1.5 text-ink-faint transition hover:bg-canvas"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Delete "${node.name}"${node.kind === "folder" ? " and its contents" : ""}?`))
            deleteNode(node.id);
        }}
        title="Delete"
        className="rounded-md p-1.5 text-ink-faint transition hover:bg-canvas hover:text-red"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div className="flex h-full">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-surface p-4 md:flex">
        <button
          onClick={() => inputRef.current?.click()}
          className="mb-4 flex items-center justify-center gap-2 rounded-[10px] bg-brand px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep"
        >
          <Upload size={15} /> Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            onUpload(e.target.files);
            e.target.value = "";
          }}
        />

        <nav className="space-y-0.5 text-sm">
          {(
            [
              { id: "all", label: "My Drive", icon: HardDrive },
              { id: "recent", label: "Recent", icon: Clock3 },
              { id: "starred", label: "Starred", icon: Star },
              { id: "shared", label: "Shared", icon: Users },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilter(f.id);
                if (f.id === "all") setCwd(null);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition ${
                filter === f.id ? "bg-brand-soft text-brand" : "text-ink-soft hover:bg-canvas"
              }`}
            >
              <f.icon size={16} /> {f.label}
            </button>
          ))}
        </nav>

        <div className="mt-6 border-t border-line pt-4">
          <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Storage
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-rose"
              style={{ width: `${Math.min(100, (used / STORAGE_LIMIT) * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            {bytes(used)} of {bytes(STORAGE_LIMIT)} used
          </p>
        </div>
      </aside>

      <div
        className="flex min-w-0 flex-1 flex-col"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) onUpload(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-6 py-3">
          <nav className="flex items-center gap-1 text-sm">
            <button
              onClick={() => {
                setCwd(null);
                setFilter("all");
              }}
              className="font-semibold text-ink transition hover:text-brand"
            >
              Drive
            </button>
            {filter === "all" &&
              crumbs.map((c) => (
                <span key={c.id} className="flex items-center gap-1">
                  <ChevronRight size={14} className="text-ink-faint" />
                  <button
                    onClick={() => setCwd(c.id)}
                    className="font-medium text-ink-soft transition hover:text-brand"
                  >
                    {c.name}
                  </button>
                </span>
              ))}
            {filter !== "all" && (
              <span className="flex items-center gap-1">
                <ChevronRight size={14} className="text-ink-faint" />
                <span className="font-medium text-ink-soft capitalize">{filter}</span>
              </span>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                const name = prompt("Folder name");
                if (name?.trim()) addFolder(name.trim(), cwd);
              }}
              className="flex items-center gap-1.5 rounded-[10px] border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition hover:border-brand hover:text-brand"
            >
              <FolderPlus size={14} /> New folder
            </button>
            <div className="flex rounded-[10px] bg-canvas p-0.5">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-lg p-1.5 transition ${
                    view === v ? "bg-surface text-ink shadow-sm" : "text-ink-faint hover:text-ink"
                  }`}
                >
                  {v === "grid" ? <Grid2x2 size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {!listed.length && <Empty>Nothing here. Drop files anywhere to upload.</Empty>}

          {view === "grid" ? (
            <div className="space-y-6">
              {folders.length > 0 && (
                <section>
                  <h2 className="mb-2.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                    Folders
                  </h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {folders.map((f) => (
                      <div
                        key={f.id}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setFilter("all");
                            setCwd(f.id);
                          }
                        }}
                        onClick={() => {
                          setFilter("all");
                          setCwd(f.id);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(f.id);
                        }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => {
                          const id = e.dataTransfer.getData("node");
                          if (id) {
                            e.stopPropagation();
                            moveNode(id, f.id);
                          }
                          setDragOver(null);
                        }}
                        className={`group flex items-center gap-3 rounded-card border bg-surface p-3 text-left transition hover:border-brand/40 hover:shadow-[0_8px_20px_-14px_rgba(14,17,22,0.35)] ${
                          dragOver === f.id ? "border-brand bg-brand-soft" : "border-line"
                        }`}
                      >
                        <Icon node={f} size={22} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{f.name}</p>
                          <p className="text-[11px] text-ink-faint">
                            {files.filter((x) => x.parentId === f.id).length} items ·{" "}
                            {relTime(f.updatedAt)}
                          </p>
                        </div>
                        <span className="hidden shrink-0 group-hover:block">
                          <Actions node={f} />
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {docs.length > 0 && (
                <section>
                  <h2 className="mb-2.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                    Files
                  </h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                    {docs.map((f) => (
                      <article
                        key={f.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("node", f.id)}
                        onClick={() => setPreview(f)}
                        className="group cursor-pointer overflow-hidden rounded-card border border-line bg-surface transition hover:border-brand/40 hover:shadow-[0_8px_20px_-14px_rgba(14,17,22,0.35)]"
                      >
                        <div
                          className="flex h-24 items-center justify-center"
                          style={{
                            background: `${EXT_COLOR[f.ext ?? ""] ?? "#8b93a7"}14`,
                          }}
                        >
                          <Icon node={f} size={26} />
                        </div>
                        <div className="border-t border-line-soft p-3">
                          <p className="truncate text-sm font-medium text-ink">{f.name}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <p className="text-[11px] text-ink-faint">
                              {bytes(f.size)} · {relTime(f.updatedAt)}
                            </p>
                            <span className="hidden shrink-0 group-hover:block">
                              <Actions node={f} />
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-card border border-line bg-surface">
              <table className="w-full text-sm">
                <thead className="border-b border-line bg-canvas text-left text-[11px] tracking-wide text-ink-faint uppercase">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Name</th>
                    <th className="px-4 py-2.5 font-semibold">Owner</th>
                    <th className="px-4 py-2.5 font-semibold">Modified</th>
                    <th className="px-4 py-2.5 font-semibold">Size</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {listed.map((f) => (
                    <tr
                      key={f.id}
                      draggable={f.kind === "file"}
                      onDragStart={(e) => e.dataTransfer.setData("node", f.id)}
                      onClick={() =>
                        f.kind === "folder"
                          ? (setFilter("all"), setCwd(f.id))
                          : setPreview(f)
                      }
                      className="group cursor-pointer transition hover:bg-canvas"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Icon node={f} size={18} />
                          <span className="font-medium text-ink">{f.name}</span>
                          {f.shared && <Chip color="#7c5cff">shared</Chip>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Avatar user={users.find((u) => u.id === f.ownerId)} size={24} />
                      </td>
                      <td className="px-4 py-2.5 text-xs text-ink-faint">{relTime(f.updatedAt)}</td>
                      <td className="px-4 py-2.5 text-xs tabular-nums text-ink-faint">
                        {f.kind === "folder" ? "—" : bytes(f.size)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="opacity-0 transition group-hover:opacity-100">
                          <Actions node={f} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={Boolean(preview)} onClose={() => setPreview(null)} width={560}>
        {preview && (
          <div>
            <div
              className="flex h-48 items-center justify-center rounded-t-[18px]"
              style={{ background: `${EXT_COLOR[preview.ext ?? ""] ?? "#8b93a7"}14` }}
            >
              <FileIcon size={44} style={{ color: EXT_COLOR[preview.ext ?? ""] ?? "#8b93a7" }} />
            </div>
            <div className="p-6">
              <h2 className="text-lg font-semibold tracking-tight text-ink">{preview.name}</h2>
              <p className="mt-1 text-xs text-ink-faint">
                {bytes(preview.size)} · updated {relTime(preview.updatedAt)}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[11px] tracking-wide text-ink-faint uppercase">Owner</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <Avatar user={users.find((u) => u.id === preview.ownerId)} size={22} />
                    <span className="text-ink">
                      {users.find((u) => u.id === preview.ownerId)?.name}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] tracking-wide text-ink-faint uppercase">Project</dt>
                  <dd className="mt-1 text-ink">
                    {projects.find((p) => p.id === preview.projectId)?.name ?? "—"}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => alert("Demo only — no file bytes are stored.")}
                  className="flex items-center gap-1.5 rounded-[10px] bg-brand px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-deep"
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={() => toggleShare(preview.id)}
                  className="flex items-center gap-1.5 rounded-[10px] border border-line px-3 py-2 text-sm font-medium text-ink-soft transition hover:border-brand hover:text-brand"
                >
                  <Share2 size={14} /> {preview.shared ? "Unshare" : "Share"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
