"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { deleteBankQuestion } from "@/server/actions/bank";
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

const DeleteBankQuestionButton = ({ id }: { id: string }) => {
  const { refresh } = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteBankQuestion(id);
    toast.success("Question deleted");
    refresh();
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            disabled={loading}>
            {loading ?
              <Loader2Icon className="size-4 animate-spin" />
            : <Trash2Icon className="text-destructive size-4" />}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Question</DialogTitle>
          <DialogDescription>
            This will permanently delete this question from the bank. Exams that
            already imported it will keep their copy.
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

export default DeleteBankQuestionButton;
