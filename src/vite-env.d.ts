/// <reference types="vite/client" />

// Image asset declarations for TypeScript
declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.gif" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

// Path alias with asset declarations
declare module "@Assets/*.png" {
  const src: string;
  export default src;
}

declare module "@Assets/*.jpg" {
  const src: string;
  export default src;
}

declare module "@Assets/*.jpeg" {
  const src: string;
  export default src;
}

declare module "@Assets/*.svg" {
  const src: string;
  export default src;
}

declare module "@Assets/*.gif" {
  const src: string;
  export default src;
}

declare module "@Assets/*.webp" {
  const src: string;
  export default src;
}
