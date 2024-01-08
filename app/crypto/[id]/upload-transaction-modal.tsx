'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Papa from "papaparse";
import supabase from "@/utils/supabase";
import { ETransactionType, EValidateCsvType, ICoin, ICoinCsv, ITransaction, ITransactionCsv } from "@/interfaces";
import { Input } from "@/components/ui/input";
import { convertStrToPlatFrom } from "@/helpers/string-helper";
import { averageCoinPrice, divide } from "@/helpers/calculater-helper";
import { csvValidator, findCmcMap } from "@/helpers/validator.helper";

interface IUploadTransactionModalProps {
  userid?: string,
}

export const UploadTransactionModal = (props: IUploadTransactionModalProps) => {
  const { userid } = props;
  const [openModal, setOpenModal] = useState(false);
  const [file, setFile] = useState<File>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const cacheCoin: {
    [key: string]:
    { coin: ICoin, transactions: ITransaction[] }
  } = {};
  const successedIds: number[] = [];
  const failedIdxs: { [key: string]: string }[] = [];
  let idx = -1;
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
        setLoading(true);
        const validateResult = await csvValidator(data, EValidateCsvType.Transaction);
        if(Object.keys(validateResult)?.length){
          alert(`Please check items: ${Object.keys(validateResult).join(',')}`);
          return;
        }
        let successed = 0;
        for (const item of data) {
          idx = idx + 1;
          const cacheCoinKey = item.coin_name.trim().toUpperCase() + item.cmc_id;
          let coinId = cacheCoin[cacheCoinKey]?.coin?.id;
          let newTransaction: ITransaction;

          try {
            if (!coinId) {
              const { data: coins } = await supabase.from('coins')
                .select()
                .eq('name', item.coin_name)
                .eq('cmc_id', item.cmc_id)
                .eq('userid', userid)
                .limit(1);
              // neu coin da ton tai trong db
              if (coins?.[0]) {
                coinId = coins?.[0]?.id;
                cacheCoin[cacheCoinKey] = { coin: coins?.[0], transactions: [] };
                const { data: tnxs } = await supabase.from('transactions')
                  .select().eq('userid', userid).eq('coin', coinId);
                // console.log('tnxs:', tnxs);
                cacheCoin[cacheCoinKey].transactions = tnxs as ITransaction[];
              } else {
                // check cmc-crypto-currency-map
                const cmc_map = findCmcMap(item.cmc_id);
                if(!cmc_map?.cmc_id || cmc_map?.cmc_id !== Number(item.cmc_id)){
                  throw Error(`Can not found currency map with id=${item.cmc_id}`);
                }
                const { data: coins, error } = await supabase.from('coins')
                  .insert({ 
                    name: item.coin_name,
                    cmc_id: cmc_map.cmc_id,
                    cmc_name: cmc_map.cmc_name,
                    cmc_slug: cmc_map.cmc_slug,
                    cmc_symbol: cmc_map.cmc_symbol,
                    userid,
                  })
                  .select();
                coinId = coins?.[0].id;
                cacheCoin[cacheCoinKey] = { coin: coins?.[0], transactions: [] };
              }
            }
            // default is buy
            newTransaction = {
              type: ETransactionType.BUY,
              tnx_date: item.tnx_date ? new Date(item.tnx_date).toISOString() : new Date().toISOString(),
              total: Math.abs(Number(item.total || 0)),
              amount: Math.abs(Number(item.amount || 0)),
              price_at: divide(item.total, item.amount),
              userid: userid || '',
              platform: convertStrToPlatFrom(item.platform),
              coin: coinId || 0,
              cmc_id: item.cmc_id,
            }
            if (item.type.toLocaleLowerCase() === ETransactionType.HOLDING) {
              newTransaction.total = 0;
              newTransaction.price_at = 0;
            } else if (item.type.toLocaleLowerCase() === ETransactionType.SELL) {
              newTransaction.type = ETransactionType.SELL;
              newTransaction.amount = 0 - Math.abs(Number(item.amount));
              newTransaction.price_at = divide(Math.abs(Number(item.total)), Math.abs(Number(item.amount)));
              newTransaction.total = 0 - Math.abs(Number(item.total));
            }
            await supabase.from('transactions').insert(newTransaction);
            cacheCoin[cacheCoinKey].transactions = cacheCoin[cacheCoinKey].transactions.concat(newTransaction);
            const updateCoin = averageCoinPrice(cacheCoin[cacheCoinKey]?.coin, cacheCoin[cacheCoinKey].transactions);
            await supabase.from('coins').update(updateCoin).eq('id', coinId);
            successed = successed + 1;
            successedIds.push(idx);
          } catch (error) {
            failedIdxs.push({
              [idx]: JSON.stringify(error),
            });
          }
          // check whether coin existed => k có thì tạo
          // save to object: coin.code, coin.id
          // create tnx
        }
        router.refresh();
        alert(`${successed}/${data.length} transactions have been imported.`);
        console.log(`${successed}/${data.length} have been imported.`)
        setLoading(true);
        setOpenModal(false);
        setFile(undefined);
        console.log('successedIds:', successedIds);
        console.log('failedIdxs:', failedIdxs);

      },
    });
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="px-2 text-sm bg-blue-200 rounded"
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
              <p className="text-sm text-grey-200">
                Please upload .csv file to import transactions and coins.
                <br></br>
                <a
                  href="https://docs.google.com/spreadsheets/d/1t1y4SmuuO5AeR02p9WHuwH98BEd_9jJREzFn57dT39g/edit?usp=drive_link"
                  target="_blank"
                  className="text-teal-500"
                >
                  Download the transactions template here
                </a>
              </p>
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