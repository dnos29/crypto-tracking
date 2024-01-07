'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { averageCoinPrice } from "@/helpers/calculater-helper";
import { ICoin, ITransaction } from "@/interfaces";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IDeleteTransactionModalProps{
  id: number,
  transactions: ITransaction[],
  coin: ICoin,
}

export const DeleteTransactionModal = (props: IDeleteTransactionModalProps) => {
  const { id, transactions, coin } = props;
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const deleteTransaction = async ()=> {
    try {
      await supabase.from('transactions').delete().eq('id', id);
      const updateCoin = averageCoinPrice(coin, transactions.filter(tnx => tnx.id !== id));
      await supabase.from('coins').update(updateCoin).eq('id', coin.id);
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
          className="w-5 h-5 text-sm bg-red-200 rounded ml-2"
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
              <DialogTitle>Delete</DialogTitle>
              <DialogDescription>
                Are you sure to want delete this transaction?
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