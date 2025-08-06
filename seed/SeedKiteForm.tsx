"use client";

import { seedCreateKite } from "@/actions/seed-actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function SeedKiteForm() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const result = await seedCreateKite();
    if (result.success) {
      toast.success(`Kite ${result.kite?.model} (${result.kite?.serial_id}) created and assigned to teachers!`);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? "Creating..." : "Create Fake Kite"}
    </Button>
  );
}
