'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "../ui/input";
import Papa from "papaparse";
import supabase from "@/utils/supabase";
import { ICoinCsv } from "@/interfaces";
import { divide } from "@/helpers/calculater-helper";
import { csvValidator } from "@/helpers/validator.helper";

interface IUploadCoinModalProps {
  userid?: string,
}

export const UploadCoinModal = (props: IUploadCoinModalProps) => {
  const {userid} = props;
  const [openModal, setOpenModal] = useState(false);
  const [file, setFile] = useState<File>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleOnChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input?.files?.[0];
      if(file?.type.split("/")[1] !== 'csv'){
        alert('Please select .csv file');
        return;
      }
      setFile(input?.files?.[0]);
    }
  }
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!file){
      alert('Please select a file');
    }
    Papa.parse(file || '', {
      header: true,
      skipEmptyLines: true,
      complete: async function(results: any) {
        const data = results.data;
        if(!data.length){
          alert('Blank file');
          return;
        }
        setLoading(true);
        const validateResult = await csvValidator(data);
        if(Object.keys(validateResult).length){
          alert(`Please check items: ${Object.keys(validateResult).join(',')}`);
          setLoading(false);
          return;
        }
        let successed = 0;
        let idx=0;
        for (const item of data) {
          idx++;
          try {
            console.log('Importing', item);
            const { data: coins } = await supabase.from('coins')
              .select()
              .eq('userid', userid)
              .eq('name', item.name)
              .eq('cmc_id', item.cmc_id)
              .limit(1);
            // 
            const newCoin = {
              name: item.name.trim(),
              cmc_name: item.cmc_name.trim(),
              cmc_slug: item.cmc_slug.trim(),
              cmc_id: item.cmc_id.trim(),
              cmc_symbol: item.cmc_symbol.trim(),
              total_invested: Number(item?.total_invested || 0),
              total_amount: Number(item?.total_amount || 0),
              avg_price: divide(item?.total_invested, item?.total_amount),
              userid, 
            };
            if(!coins?.[0]?.id){// new
              const result = await supabase.from('coins').insert(newCoin);
              console.log(result);
              
              if(result?.status === 201){
                successed = successed + 1;
              }
            }else{ // update
              const result = await supabase.from('coins')
                .update(newCoin)
                .eq('userid', userid)
                .eq('cmc_id', item.cmc_id);
              console.log('result:', result);
              
              if(result?.status === 204){
                successed = successed + 1;
              }
            }
          } catch (error) {
            console.log(error);
          }
          console.log('idx:', idx, '- successed:', successed);
          if(idx === data.length){
            router.refresh();
            alert(`${successed}/${data.length} have been imported.`);
            setLoading(true);
            setOpenModal(false);
            setFile(undefined);
          }
        };
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
          &#8613; Coins
        </button>
      </DialogTrigger>
      {
        openModal && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload coin</DialogTitle>
                <p className="text-sm text-grey-200">
                  Please upload .csv file to import coins.
                  <br></br>
                  <a 
                    href="https://drive.google.com/file/d/10IKbGk0994fZNSyyXcRBj5W06ocjZpxz/view?usp=sharing"
                    target="_blank"
                    className="text-teal-500"
                  > 
                    Download the coins template here
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