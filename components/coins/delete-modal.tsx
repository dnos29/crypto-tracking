'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ICoinDeleteModalProps{
  id: number,
  userid?: string,
}

export const CoinDeleteModal = (props: ICoinDeleteModalProps) => {
  const { id, userid } = props;
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const deleteTransaction = async ()=> {
    try {
      await supabase.from('transactions').delete().eq('coin', id).eq('userid', userid);
      await supabase.from('coins').delete().eq('id', id).eq('userid', userid);
      router.refresh();
      setOpenModal(false);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="w-5 h-5 text-sm bg-red-200 rounded"
          onClick={() => {
            setOpenModal(true);
          }}
        >&#10008;
        </button>
      </DialogTrigger>
      {
        openModal && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete coin</DialogTitle>
              <DialogDescription>
                Are you sure to want delete this coin? Please make sure that you already delete all transactions?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button variant={'destructive'} onClick={() => deleteTransaction()}>Delete</Button>
              <Button variant={'link'} onClick={() => setOpenModal(false)}>Cancel</Button>
            </div>
          </DialogContent>
        )
      }
    </Dialog>
  );
}