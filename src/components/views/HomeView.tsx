"use client";

import { useState } from "react";
import { AppHeader } from "../AppHeader";
import { BubblesView } from "../BubblesView";
import { ExperienceForm } from "../ExperienceForm";
import { MainActions } from "../MainActions";

/** Pantalla principal: burbujas por grupo, sin scroll, con el (+) fijo abajo. */
export function HomeView() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <AppHeader />
      <BubblesView />
      <MainActions onAdd={() => setFormOpen(true)} />
      <ExperienceForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
