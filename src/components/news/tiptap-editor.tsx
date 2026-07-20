"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Trash2,
  Undo2,
} from "lucide-react";
import type { TipTapDoc } from "@/api/types";
import { ResizableImage } from "@/components/news/resizable-image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type TipTapEditorProps = {
  value: TipTapDoc;
  onChange: (value: TipTapDoc) => void;
  /** Upload an image file; return public URL or null on failure. */
  onUploadImage?: (file: File) => Promise<string | null>;
  uploading?: boolean;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

async function insertUploadedImages(
  editor: Editor,
  files: File[],
  onUploadImage: (file: File) => Promise<string | null>,
  atPos?: number,
) {
  const images = files.filter(isImageFile);
  if (!images.length) return;

  for (const file of images) {
    const url = await onUploadImage(file);
    if (!url) continue;

    const chain = editor.chain().focus();
    if (typeof atPos === "number") {
      chain.insertContentAt(atPos, {
        type: "image",
        attrs: { src: url, alt: file.name },
      });
    } else {
      chain.setImage({ src: url, alt: file.name });
    }
    chain.run();
  }
}

export function TipTapEditor({
  value,
  onChange,
  onUploadImage,
  uploading = false,
}: TipTapEditorProps) {
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const uploadRef = useRef(onUploadImage);
  const editorRef = useRef<Editor | null>(null);
  uploadRef.current = onUploadImage;

  const handleFiles = useCallback(
    async (ed: Editor, files: FileList | File[], atPos?: number) => {
      const upload = uploadRef.current;
      if (!upload) return;
      await insertUploadedImages(ed, Array.from(files), upload, atPos);
    },
    [],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      ResizableImage,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Start writing… You can also drop or paste images here.",
      }),
    ],
    content: value as object,
    immediatelyRender: false,
    onCreate: ({ editor: created }) => {
      editorRef.current = created;
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getJSON() as TipTapDoc);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[280px] px-3 py-3 focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const ed = editorRef.current;
        const upload = uploadRef.current;
        const items = event.clipboardData?.items;
        if (!upload || !items?.length || !ed) return false;

        const files: File[] = [];
        for (const item of items) {
          if (item.kind === "file") {
            const file = item.getAsFile();
            if (file && isImageFile(file)) files.push(file);
          }
        }
        if (!files.length) return false;

        event.preventDefault();
        void handleFiles(ed, files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        const ed = editorRef.current;
        const upload = uploadRef.current;
        if (moved || !upload || !ed) return false;

        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const images = Array.from(files).filter(isImageFile);
        if (!images.length) return false;

        event.preventDefault();
        const coords = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        void handleFiles(ed, images, coords?.pos);
        return true;
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value);
    if (current !== next) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const imageSelected = Boolean(editor?.isActive("image"));

  if (!editor) {
    return (
      <div className="flex items-center justify-center rounded-none border border-border bg-white p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-none border border-border bg-white shadow-sm transition-colors",
        dragging && "border-brand-green bg-brand-green/5",
      )}
      onDragEnter={(e) => {
        if (!onUploadImage) return;
        if (![...e.dataTransfer.items].some((i) => i.kind === "file")) return;
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDragOver={(e) => {
        if (!onUploadImage) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        dragDepth.current = 0;
        setDragging(false);
      }}
    >
      <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-2">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          label="Heading"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Bullet list"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Ordered list"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Link URL");
            if (!url) return;
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
          label="Link"
        >
          <Link2 className="size-4" />
        </ToolbarButton>
        {onUploadImage ? (
          <ToolbarButton
            label="Insert image"
            disabled={uploading}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.multiple = true;
              input.onchange = () => {
                if (input.files?.length) {
                  void handleFiles(editor, input.files);
                }
              };
              input.click();
            }}
          >
            <ImageIcon className="size-4" />
          </ToolbarButton>
        ) : null}
        {imageSelected ? (
          <ToolbarButton
            label="Delete selected image"
            onClick={() => editor.chain().focus().deleteSelection().run()}
          >
            <Trash2 className="size-4 text-red-600" />
          </ToolbarButton>
        ) : null}
        <div className="ml-auto flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            label="Undo"
          >
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            label="Redo"
          >
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>
      </div>

      <EditorContent editor={editor} />

      {dragging ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-brand-green bg-brand-green/10">
          <p className="font-heading text-sm font-bold uppercase tracking-wide text-brand-navy">
            Drop images to upload
          </p>
        </div>
      ) : null}

      {uploading ? (
        <div className="border-t border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Uploading image…
        </div>
      ) : (
        <div className="border-t border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Tip: drop or paste images, click one to resize or delete
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn("size-8 px-0", active && "bg-white shadow-sm")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export const emptyDoc: TipTapDoc = {
  type: "doc",
  content: [{ type: "paragraph" }],
};
