'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { averageCoinPrice } from "@/helpers/calculater-helper";
import { ICoin } from "@/interfaces";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IDeleteAllTransactionModalProps{
  coin: ICoin,
}

export const DeleteAllTransactionModal = (props: IDeleteAllTransactionModalProps) => {
  const { coin } = props;
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const deleteTransaction = async ()=> {
    try {
      await supabase.from('transactions').delete()
        .eq('coin', coin?.id)
        .eq('userid', coin?.userid);
      const updateCoin = averageCoinPrice(coin, []);
      await supabase.from('coins')
        .update(updateCoin)
        .eq('id', coin.id);
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
          className="px-2 text-sm bg-red-200 rounded"
          onClick={() => {
            setOpenModal(true);
          }}
        >
          <span>&#10008; All transactions</span>
        </button>
      </DialogTrigger>
      {
        openModal && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete all {coin?.name} transaction</DialogTitle>
              <DialogDescription>
                Are you sure to want delete all transaction of {coin?.name} - {coin?.cmc_name}?
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