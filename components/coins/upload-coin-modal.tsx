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
      complete: function(results: any) {
        const data = results.data;
        if(!data.length){
          alert('Blank file');
          return;
        }
        let successed = 0;
        setLoading(true);
        data.map(async (item: ICoinCsv, idx: number) => {
          try {
            console.log('Importing', item);
            const { data: coins } = await supabase.from('coins')
              .select()
              .eq('userid', userid).eq('code', item.code)
              .limit(1);
            const newCoin = {
              name: item.name.trim(),
              code: item.code.trim(),
              total_invested: Number(item?.total_invested || 0),
              total_amount: Number(item?.total_amount || 0),
              avg_price: divide(item?.total_invested, item?.total_amount),
              userid, 
            };
            if(!coins?.[0].id){// new
              const result = await supabase.from('coins').insert(newCoin);
              if(result?.data){
                successed = successed + 1;
              }
            }else{ // update
              const result = await supabase.from('coins')
                .update(newCoin)
                .eq('userid', userid).eq('code', item.code);
              console.log('result:', result);
              
              if(result?.status === 204){
                successed = successed + 1;
              }
            }
          } catch (error) {
            console.log(error);
          }
          console.log('idx:', idx, '-data.length:', data.length)
          if(idx === (data.length -1)){
            router.refresh();
            alert(`${successed}/${data.length} have been imported.`);
            setLoading(true);
            setOpenModal(false);
            setFile(undefined);
          }
        });
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