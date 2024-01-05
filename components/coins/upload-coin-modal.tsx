'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "../ui/input";
import Papa from "papaparse";
import supabase from "@/utils/supabase";
import { ICoinCsv } from "@/interfaces";

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
            const { data: coin } = await supabase.from('coins')
              .select()
              .eq('userid', userid).eq('code', item.code)
              .limit(1)
              .single();
            if(!coin?.id){
              const result = await supabase.from('coins').insert({
                name: item.name.trim(),
                code: item.code.trim(),
                userid, 
              });
              if(result?.data){
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
          className="px-2 font-semibold text-sm bg-blue-200 rounded"
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