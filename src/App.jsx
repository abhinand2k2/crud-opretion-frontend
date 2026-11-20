import { useEffect, useState } from "react";
import CrudPage from "./CrudPage";
import { sections } from "./sections";
import "./App.css";

const current = () =>
    sections.find((s) => s.id === window.location.hash.slice(1)) ?? sections[0];

export default function App() {
  const [section, setSection] = useState(current);

  useEffect(() => {
    const onHash = () => setSection(current());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
      <div className="shell">
        <aside className="side">
          <p className="brand">Records</p>
          <nav aria-label="Sections">
            {sections.map((s) => (
                <a
                    key={s.id}
                    href={`#${s.id}`}
                    aria-current={s.id === section.id ? "page" : undefined}
                >
                  {s.label}
                </a>
            ))}
          </nav>
        </aside>
        <CrudPage key={section.id} section={section} />
      </div>
  );
}