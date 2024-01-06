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
import { divide } from "@/helpers/calculater-helper";

const coinSchema = z.object({
  name: z.string().toUpperCase().min(1),
  code: z.string().toUpperCase().min(1),
  total_amount: z.string().min(1),
  avg_price: z.string().min(1),
  total_invested: z.string().min(1),
});

interface ICoinModalProps {
  coin?: ICoin,
  userid?: string,
}
export const CoinModal = (props: ICoinModalProps) => {
  const { coin, userid } = props;
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof coinSchema>>({
    resolver: zodResolver(coinSchema),
    defaultValues: {
      name: coin?.name || '',
      code: coin?.code || '',
      total_amount: coin?.total_amount?.toString() || '',
      avg_price: coin?.avg_price.toString() || '',
      total_invested: coin?.total_invested?.toString() || '',
    }
  });
  const onSubmit = async (values: z.infer<typeof coinSchema>) => {
    if (!userid) {
      alert('User not found')
      return;
    }
    console.log('values:', values);
    
    const newCoin = {
      name: values.name.trim(),
      code: values.code.trim(),
      total_invested: Number(values.total_invested || 0),
      total_amount: Number(values.total_amount || 0),
      avg_price: Number(values.avg_price || 0),
    };
    if (coin?.id) {
      // update
      try {
        await supabase.from('coins').update(newCoin)
          .eq('id', coin?.id).eq('userid', userid);
        router.refresh();
        setOpenModal(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      // new
      try {
        await supabase.from('coins').insert({
          ...newCoin,
          userid,
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
                className="text-sm bg-blue-200 rounded py-1 px-2 leading-3"
                onClick={() => {
                  form.reset();
                  setOpenModal(true);
                }}
              >
                + Coin
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
                  <FormField
                    control={form.control}
                    name="total_invested"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Total invested</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter total invested" {...field} onChange={(e) => {
                            const val = e.target.value;
                            form.setValue('total_invested', val);
                            if (form.getValues('total_amount')) {
                              const avg_price = divide(
                                val,
                                form.getValues('total_amount'),
                              );
                              form.setValue('avg_price', avg_price.toString());
                            }
                          }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="total_amount"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Total amount</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter total amount" {...field} onChange={(e) => {
                            const val = e.target.value;
                            form.setValue('total_amount', val);
                            if (form.getValues('total_invested')) {
                              const avg_price = divide(
                                form.getValues('total_invested'),
                                val,
                              );
                              form.setValue('avg_price', avg_price.toString());
                            }
                          }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="avg_price"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Average price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter average price" {...field} disabled />
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