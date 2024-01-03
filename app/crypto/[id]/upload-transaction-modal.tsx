'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Papa from "papaparse";
import supabase from "@/utils/supabase";
import { ETransactionType, ICoin, ICoinCsv, ITransaction, ITransactionCsv } from "@/interfaces";
import { Input } from "@/components/ui/input";
import { convertStrToPlatFrom } from "@/helpers/string-helper";
import { averageCoinPrice } from "@/helpers/calculater-helper";

interface IUploadTransactionModalProps {
  userId?: string,
}

export const UploadTransactionModal = (props: IUploadTransactionModalProps) => {
  const { userId } = props;
  const [openModal, setOpenModal] = useState(false);
  const [file, setFile] = useState<File>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const cacheCoin: { [key: string]: ICoin } = {};
  const handleOnChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input?.files?.[0];
      if (file?.type.split("/")[1] !== 'csv') {
        alert('Please select .csv file');
        return;
      }
      setFile(input?.files?.[0]);
    }
  }
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file');
    }
    Papa.parse(file || '', {
      header: true,
      skipEmptyLines: true,
      complete: async function (results: any) {
        const data = results.data;
        if (!data.length) {
          alert('Blank file');
          return;
        }
        let successed = 0;
        setLoading(true);
        for (const item of data) {
          const coinCode = item.coin.toUpperCase();
          let coinId = cacheCoin[coinCode]?.id;
          let existedTransactions: ITransaction[] = [];
          let newTransaction: ITransaction;
          try {
            if (!coinId) {
              const { data: coins } = await supabase.from('coins')
                .select()
                .eq('code', item.coin).eq('userid', userId)
                .limit(1);
              // neu coin da ton tai trong db
              if (coins?.[0]) {
                coinId = coins?.[0]?.id;
                cacheCoin[coinCode] = coins?.[0];
                const { data: tnxs } = await supabase.from('transactions')
                  .select().eq('userid', userId).eq('coin', coinId);
                existedTransactions = tnxs as ITransaction[];
              } else {
                const {data: coins, error} = await supabase.from('coins')
                  .insert({ name: coinCode, code: coinCode, userId })
                  .select();
                  console.log('coins: ', coins);
                coinId = coins?.[0].id;
                cacheCoin[coinCode] = coins?.[0];
              }
            }
            console.log('')
            // default is buy
            newTransaction = {
              type: ETransactionType.BUY,
              amount: Math.abs(Number(item.amount)),
              tnx_date: new Date(item.tnx_date).toISOString(),
              price_at: Math.abs(Number(item.price_at)),
              total: Number(item.amount) * Number(item.price_at),
              userId: userId || '',
              platform: convertStrToPlatFrom(item.platform),
              coin: coinId || 0,
            }
            if (item.type.toLocaleLowerCase() === ETransactionType.HOLDING) {
              newTransaction.total = 0;
            } else if (item.type.toLocaleLowerCase() === ETransactionType.SELL) {
              newTransaction.type = ETransactionType.SELL,
                newTransaction.amount = 0 - Math.abs(Number(item.amount));
              newTransaction.total = newTransaction.amount * newTransaction.price_at;
            }
            await supabase.from('transactions').insert(newTransaction);
            const updateCoin = averageCoinPrice(cacheCoin[coinCode], existedTransactions.concat(newTransaction));
            await supabase.from('coins').update(updateCoin).eq('id', coinId);
            successed = successed + 1;
          } catch (error) {

          }
          // check whether coin existed => k có thì tạo
          // save to object: coin.code, coin.id
          // create tnx
        }
        alert(`${successed}/${data.length} have been imported.`);
        console.log(`${successed}/${data.length} have been imported.`)
        setLoading(true);
        setOpenModal(false);
        setFile(undefined);
      },
    });
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className=" px-2 text-sm bg-blue-200 rounded text-gray-50"
          onClick={() => {
            setOpenModal(true);
            setLoading(false);
          }}
        >
          &#8613; Transactions
        </button>
      </DialogTrigger>
      {
        openModal && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload transactions</DialogTitle>
              <form onSubmit={onSubmit} className="w-full space-y-2">
                <Input
                  type="file"
                  placeholder="Upload coin file"
                  onChange={handleOnChangeFile}
                  accept=".csv"
                />

                <div className="grid">
                  <Button type="submit" disabled={loading}>Submit</Button>
                  <Button variant={'link'} onClick={() => setOpenModal(false)}>Cancel</Button>
                </div>
              </form>
            </DialogHeader>
          </DialogContent>
        )
      }
    </Dialog>
  );
}