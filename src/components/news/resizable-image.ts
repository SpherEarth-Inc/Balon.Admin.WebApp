import Image from "@tiptap/extension-image";

/** TipTap image with native drag handles for resize (width/height attrs). */
export const ResizableImage = Image.configure({
  inline: false,
  allowBase64: false,
  resize: {
    enabled: true,
    directions: [
      "top",
      "bottom",
      "left",
      "right",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ],
    minWidth: 80,
    minHeight: 80,
    alwaysPreserveAspectRatio: true,
  },
  HTMLAttributes: {
    class: "terra-content-image",
  },
});
