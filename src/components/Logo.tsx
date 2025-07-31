
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("text-primary", className)}
      fill="currentColor"
    >
      <title>Insight Forge Logo</title>
      <path
        d="M128 34.3a93.7 93.7 0 1 0 93.7 93.7A93.7 93.7 0 0 0 128 34.3zm0 177.4a83.7 83.7 0 1 1 83.7-83.7 83.8 83.8 0 0 1-83.7 83.7z"
        fill="currentColor"
      />
      <path
        d="M128 85.5a42.5 42.5 0 1 0 42.5 42.5 42.5 42.5 0 0 0-42.5-42.5zm0 75a32.5 32.5 0 1 1 32.5-32.5 32.5 32.5 0 0 1-32.5 32.5z"
        fill="currentColor"
      />
      <circle cx="128" cy="40.3" r="4.5" fill="currentColor" />
      <circle cx="128" cy="215.7" r="4.5" fill="currentColor" />
      <circle cx="40.3" cy="128" r="4.5" fill="currentColor" />
      <circle cx="215.7" cy="128" r="4.5" fill="currentColor" />
      <circle cx="67" cy="67" r="4.5" fill="currentColor" />
      <circle cx="189" cy="189" r="4.5" fill="currentColor" />
      <circle cx="67" cy="189" r="4.5" fill="currentColor" />
      <circle cx="189" cy="67" r="4.5" fill="currentColor" />
      <circle cx="128" cy="56.3" r="6" fill="currentColor" />
      <circle cx="128" cy="199.7" r="6" fill="currentColor" />
      <circle cx="56.3" cy="128" r="6" fill="currentColor" />
      <circle cx="199.7" cy="128" r="6" fill="currentColor" />
      <circle cx="80.8" cy="80.8" r="6" fill="currentColor" />
      <circle cx="175.2" cy="175.2" r="6" fill="currentColor" />
      <circle cx="80.8" cy="175.2" r="6" fill="currentColor" />
      <circle cx="175.2" cy="80.8" r="6" fill="currentColor" />
      <path
        d="M80.8 80.8l-13.8-13.8 13.8-13.8L80.8 67 67 80.8l13.8 13.8zm94.4 94.4l13.8 13.8-13.8 13.8-13.8-13.8 13.8-13.8zm-94.4 0l-13.8 13.8 13.8 13.8 13.8-13.8-13.8-13.8zm0-94.4l13.8-13.8-13.8-13.8-13.8 13.8 13.8 13.8z"
        fill="currentColor"
      />
      <path
        d="M128 56.3v-16h-16v16zm0 143.4v16h16v-16zm-71.7-71.7h-16v-16h16zm143.4 0h16v16h-16zM88.9 98.8L75.1 85l-9.9 9.9 13.8 13.8zm78.2 58.4l13.8 13.8 9.9-9.9-13.8-13.8zm-78.2 0l-13.8 13.8 9.9 9.9 13.8-13.8zm0-58.4l13.8-13.8-9.9-9.9-13.8 13.8z"
        fill="currentColor"
      />
      <path
        d="M128 56.3L80.8 80.8l-13.8-13.8L128 40.3l47.2 26.7-13.8 13.8zm0 143.4l47.2-26.7 13.8 13.8L128 215.7l-47.2-26.7 13.8-13.8zM56.3 128l26.7 47.2 13.8-13.8L70.1 128l26.7-47.2-13.8-13.8zM199.7 128l-26.7-47.2-13.8 13.8L185.9 128l-26.7 47.2 13.8 13.8z"
        fill="currentColor"
      />
      <path
        d="M103.2 69.8l-36.2-2.5-2.5 36.2 36.2 2.5zm49.6 116.4l36.2 2.5 2.5-36.2-36.2-2.5zM69.8 152.8l-2.5 36.2 36.2 2.5 2.5-36.2zm116.4-49.6l2.5-36.2-36.2-2.5-2.5 36.2z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
      />
       <path
        d="M175.2 80.8l-22.4 22.4-22.4-22.4L152.8 58.4l22.4 22.4zM80.8 175.2l22.4-22.4 22.4 22.4L103.2 197.6l-22.4-22.4zM80.8 80.8l22.4 22.4-22.4 22.4L58.4 103.2l22.4-22.4zM175.2 175.2l-22.4-22.4 22.4-22.4L197.6 152.8l-22.4 22.4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M128,68.8c-32.7,0-59.2,26.5-59.2,59.2s26.5,59.2,59.2,59.2s59.2-26.5,59.2-59.2S160.7,68.8,128,68.8z M128,177.2c-27.2,0-49.2-22-49.2-49.2s22-49.2,49.2-49.2s49.2,22,49.2,49.2S155.2,177.2,128,177.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M128,56.3 L175.2,80.8 L199.7,128 L175.2,175.2 L128,199.7 L80.8,175.2 L56.3,128 L80.8,80.8 L128,56.3 M128,40.3 L67,67 L40.3,128 L67,189 L128,215.7 L189,189 L215.7,128 L189,67 L128,40.3 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

    