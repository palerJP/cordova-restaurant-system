/**
 * Next.js remounts `template.tsx` on every navigation (unlike layout.tsx,
 * which persists across routes). That's exactly what we want here: wrapping
 * page content in this component re-triggers the `page-transition` CSS
 * animation (see globals.css) on every route change, turning what was an
 * abrupt content swap into a smooth fade-in.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
