"use client";
import { EPlatform, ICmcMap, ICoin } from "@/interfaces";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { divide } from "@/helpers/calculater-helper";
import { findCmcMap } from "@/helpers/validator.helper";
import { Checkbox } from "../ui/checkbox";
import { addPlatform, removePlatform } from "@/helpers/string-helper";

const coinSchema = z.object({
  name: z.string().toUpperCase().min(1),
  cmc_name: z.string().min(1),
  cmc_id: z.number().min(1),
  total_amount: z.string().min(1),
  avg_price: z.string().min(1),
  total_invested: z.string().min(1),
  note: z.string(),
  platforms: z.string(),
});

interface ICoinModalProps {
  coin?: ICoin;
  userid?: string;
}
export const CoinModal = (props: ICoinModalProps) => {
  const { coin, userid } = props;
  const [openModal, setOpenModal] = useState(false);
  const [cmcMapSuggestions, setCmmMapSuggestions] = useState<ICmcMap[]>();
  const router = useRouter();
  const form = useForm<z.infer<typeof coinSchema>>({
    resolver: zodResolver(coinSchema),
    defaultValues: {
      name: coin?.name || '',
      cmc_name: coin?.cmc_name || '',
      cmc_id: coin?.cmc_id || 0,
      total_amount: coin?.total_amount?.toString() || '',
      avg_price: coin?.avg_price?.toString() || '',
      total_invested: coin?.total_invested?.toString() || '',
      note: coin?.note || '',
      platforms: coin?.platforms || '',
    },
  });
  const suggestCmcName = async (coin_name: string) => {
    const data = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}cmc-crypto-currency-map?coinName=${coin_name}`
    ).then((res) => res.json());
    if (!!data?.length) {
      setCmmMapSuggestions(data);
    }
  };
  const onSubmit = async (values: z.infer<typeof coinSchema>) => {
    if (!userid) {
      alert("User not found");
      return;
    }
    // console.log('values:', values);
    const cmc_id = values.cmc_id;
    const cmc_map = findCmcMap(cmc_id);
    if (!cmc_map?.cmc_id) {
      alert(`Based on cmc name=${cmc_id}, Coinmarketcap id is not found`);
      return;
    }
    const newCoin = {
      name: values.name.trim(),
      cmc_id: cmc_id,
      cmc_name: cmc_map?.cmc_name,
      cmc_slug: cmc_map?.cmc_slug,
      cmc_symbol: cmc_map?.cmc_symbol,
      total_invested: Number(values.total_invested || 0),
      total_amount: Number(values.total_amount || 0),
      avg_price: Number(values.avg_price || 0),
      note: values.note,
      platforms: values.platforms,
    };
    console.log("newCoins", newCoin);
    if (coin?.id) {
      // update
      try {
        const { data: existedCoins } = await supabase
          .from("coins")
          .select()
          .eq("userid", userid)
          .eq("name", newCoin.name)
          .eq("cmc_id", newCoin.cmc_id)
          .neq("id", coin?.id)
          .limit(1);
        if (existedCoins?.[0]?.id) {
          alert(
            `Coin with name=${newCoin.name} and cmc_id=${newCoin.cmc_id} is existed.`
          );
          return;
        }
        await supabase
          .from("coins")
          .update(newCoin)
          .eq("id", coin?.id)
          .eq("userid", userid);
        router.refresh();
        setOpenModal(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      // new
      try {
        const { data: existedCoins } = await supabase
          .from("coins")
          .select()
          .eq("userid", userid)
          .eq("name", newCoin.name)
          .eq("cmc_id", newCoin.cmc_id)
          .limit(1);
        if (existedCoins?.[0]?.id) {
          alert(
            `Coin with name=${newCoin.name} and cmc_id=${newCoin.cmc_id} is existed.`
          );
          return;
        }
        await supabase.from("coins").insert({
          ...newCoin,
          userid,
        });
        router.refresh();
        setOpenModal(false);
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {coin?.id ? (
            <button
              className="w-5 h-5 text-sm bg-blue-200 rounded p-1 leading-3"
              onClick={() => {
                setOpenModal(true);
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
          )}
        </DialogTrigger>
        {openModal && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{coin?.name ? "Edit" : "Add"} coin</DialogTitle>
            </DialogHeader>
            <div className="overscroll-y-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter coin name"
                            {...field}
                            onChange={(e) => {
                              form.setValue(
                                "name",
                                e.target.value.toUpperCase()
                              );
                            }}
                            onBlur={(e) => {
                              suggestCmcName(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cmc_name"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Cmc name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter cmc name"
                            {...field}
                            // onBlur={() => {
                            //   const cmc_map = findCmcMap(
                            //     form.getValues("cmc_name").trim()
                            //   );
                            //   if (!cmc_map?.cmc_id) {
                            //     alert(
                            //       `Based on cmc name=${form.getValues(
                            //         "cmc_name"
                            //       )}, Coinmarketcap id is not found`
                            //     );
                            //   }
                            // }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {
                    cmcMapSuggestions?.length && (
                    <div>
                      <label className="text-xs text-gray-400">
                        Suggested cmc_name
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {cmcMapSuggestions?.map((cmcMapSuggestion) => (
                          <>
                            <label
                              className="px-2 bg-blue-200 rounded text-sm cursor-pointer"
                              onClick={() => {
                                form.setValue("cmc_name", cmcMapSuggestion.name);
                                form.setValue("cmc_id", cmcMapSuggestion.id);
                              }}
                            >
                              {cmcMapSuggestion.id + '-' +cmcMapSuggestion.name}
                            </label>
                          </>
                        ))}
                      </div>
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="total_invested"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Total invested</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter total invested"
                            {...field}
                            onChange={(e) => {
                              const val = e.target.value;
                              form.setValue("total_invested", val);
                              if (form.getValues("total_amount")) {
                                const avg_price = divide(
                                  val,
                                  form.getValues("total_amount")
                                );
                                form.setValue(
                                  "avg_price",
                                  avg_price.toString()
                                );
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
                          <Input
                            placeholder="Enter total amount"
                            {...field}
                            onChange={(e) => {
                              const val = e.target.value;
                              form.setValue("total_amount", val);
                              if (form.getValues("total_invested")) {
                                const avg_price = divide(
                                  form.getValues("total_invested"),
                                  val
                                );
                                form.setValue(
                                  "avg_price",
                                  avg_price.toString()
                                );
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
                          <Input
                            type="number"
                            placeholder="Enter average price"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="platforms"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Platforms</FormLabel>
                        <FormControl>
                          <div className="flex gap-4">
                            {
                              (Object.keys(EPlatform) as Array<keyof typeof EPlatform>).map(platformKey => (
                                <div>
                                  <div className="flex items-center">
                                    <Checkbox
                                      id={EPlatform[platformKey]}
                                      checked={field.value.includes(EPlatform?.[platformKey])}
                                      onCheckedChange={(isChecked) => {
                                        let platforms = form.getValues('platforms');
                                        if(isChecked){
                                          form.setValue('platforms', addPlatform(EPlatform?.[platformKey], platforms));
                                        } else {
                                          form.setValue('platforms', removePlatform(EPlatform?.[platformKey], platforms));
                                        }
                                      }}
                                    />
                                    <label htmlFor={EPlatform[platformKey]} className="ml-1 text-sm capitalize">
                                      {EPlatform[platformKey]}
                                    </label>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Note</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter note"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-2">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting || !form.formState.isValid}
                    >
                      Save
                    </Button>
                    <Button variant="link" onClick={() => setOpenModal(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};
