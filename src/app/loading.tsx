// Minimal global loading
// We use Suspense boundaries inside each page so they can show
// their own exact, pixel-perfect skeletons immediately.
// Returning null here prevents Next.js from flashing a generic or incorrect skeleton
// across different roles (like showing a normal dashboard to an admin).
export default function Loading() {
  return null
}
