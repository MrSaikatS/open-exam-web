"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { deleteSubject } from "@/server/bankActions";
import { Button } from "../shadcnui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcnui/dialog";

const DeleteSubjectButton = ({
  id,
  name,
  disabled,
}: {
  id: string;
  name: string;
  disabled?: boolean;
}) => {
  const { refresh } = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteSubject(id);
      toast.success("Subject deleted");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete subject");
    }
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            disabled={disabled || loading}
            onClick={(e) => e.stopPropagation()}>
            {loading ?
              <Loader2Icon className="size-4 animate-spin" />
            : <Trash2Icon className="text-destructive size-4" />}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Subject</DialogTitle>
          <DialogDescription>
            Delete &quot;{name}&quot;? The subject must have no topics.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <DialogClose
            render={
              <Button
                variant="destructive"
                size="lg"
                onClick={handleDelete}
                disabled={loading}>
                {loading ?
                  <>
                    <Loader2Icon className="size-4 animate-spin" /> Deleting...
                  </>
                : <>
                    <Trash2Icon className="size-4" /> Delete
                  </>
                }
              </Button>
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSubjectButton;
