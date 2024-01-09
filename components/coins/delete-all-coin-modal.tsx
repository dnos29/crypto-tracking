'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "../ui/input";

interface IDeleteAllCoinModalProps{
  userid: string,
  totalCoins: number,
}
const CONFIRM_RESET = 'delete_all';

export const DeleteAllCoinModal = (props: IDeleteAllCoinModalProps) => {
  const { userid, totalCoins } = props;
  const [openModal, setOpenModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const router = useRouter();
  const deleteTransaction = async ()=> {
    if(confirmText !== CONFIRM_RESET){
      alert(`Please enter ${CONFIRM_RESET} to reset data`);
      return;
    }
    try {
      await supabase.from('transactions').delete()
        .eq('userid', userid);
      await supabase.from('coins')
        .delete()
        .eq('userid', userid);
      router.refresh();
      setOpenModal(false);
      setConfirmText('')
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="px-2 text-sm bg-red-200 rounded"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          <span>&#10008; All {totalCoins} coins</span>
        </button>
      </DialogTrigger>
      {
        openModal && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete all coins and transactions</DialogTitle>
              <DialogDescription>
                Are you sure to want delete all coins and transactions?
                Please enter <span className="text-red-500">{CONFIRM_RESET}</span> to reset data.
                <Input
                  className="mt-4"
                  placeholder={`Enter ${CONFIRM_RESET} to reset data`}
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                  }}
                />
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