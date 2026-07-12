"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { deleteTopic } from "@/server/bankActions";
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

const DeleteTopicButton = ({
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
      await deleteTopic(id);
      toast.success("Topic deleted");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete topic");
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
          <DialogTitle>Delete Topic</DialogTitle>
          <DialogDescription>
            Delete &quot;{name}&quot;? The topic must have no questions.
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

export default DeleteTopicButton;
