"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewUserDialog } from "../components/new-user-dialog";

interface UsuarioEditButtonProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    isAdministrator: boolean;
    isOperator: boolean;
    isManager: boolean;
    isActive?: boolean;
  };
}

export function UsuarioEditButton({ user }: UsuarioEditButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
      >
        <Pencil className="h-4 w-4 mr-2" />
        Editar
      </Button>
      <NewUserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={user}
      />
    </>
  );
}

