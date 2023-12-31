'use client';
import { ICoin } from "@/interfaces"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";

const coinSchema = z.object({
  name: z.string().toUpperCase().min(1),
  code: z.string().toUpperCase().min(1),
});

interface ICoinModalProps {
  coin?: ICoin,
  userId?: string,
}
export const CoinModal = (props: ICoinModalProps) => {
  const { coin, userId } = props;
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof coinSchema>>({
    resolver: zodResolver(coinSchema),
    defaultValues: {
      name: coin?.name || '',
      code: coin?.code || '',
    }
  });
  const onSubmit = async (values: z.infer<typeof coinSchema>) => {
    if (!userId) {
      alert('User not found')
      return;
    }
    if (coin?.id) {
      // new
      try {
        await supabase.from('coins').update({
          name: values.name,
          code: values.code,
        }).eq('id', coin?.id).eq('userId', userId);
        router.refresh();
        setOpenModal(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      // new
      try {
        await supabase.from('coins').insert({
          name: values.name,
          code: values.code,
          userId,
        });
        router.refresh();
        setOpenModal(false);
      } catch (error) {
        console.log(error);
      }
    }
  }
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {
            coin?.id ? (
              <button
                className="w-5 h-5 text-sm bg-blue-200 rounded p-1 leading-3"
                onClick={() => {
                  setOpenModal(true)
                }}
              >
                &#9998;
              </button>
            ) : (
              <button
                className="w-5 h-5 text-sm bg-teal-500 rounded p-1 leading-3 text-white"
                onClick={() => {
                  form.reset();
                  setOpenModal(true);
                }}
              >
                +
              </button>
            )
          }
        </DialogTrigger>
        {openModal && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{coin?.name ? 'Edit' : 'Add'} coin</DialogTitle>
            </DialogHeader>
            <div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter coin name" {...field} onChange={(e) => {
                            form.setValue('name', e.target.value.toUpperCase());
                            form.setValue('code', e.target.value.toUpperCase())
                          }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter coin code" {...field} onChange={(e) => {
                            form.setValue('code', e.target.value.toUpperCase())
                          }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-2">
                    <Button type="submit" disabled={form.formState.isSubmitting}>Save</Button>
                    <Button variant='link' onClick={() => setOpenModal(false)}>Cancel</Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}