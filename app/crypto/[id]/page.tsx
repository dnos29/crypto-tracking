export default function Page({params}: {params: {id: string}}){
  return (
    <>
      <p className="text-center uppercase">{params.id}</p>
      <p className='text-xs	mt-4'>
        Est total value
      </p>
      <p className='text-2xl font-bold'>
        <span className=''>12308</span><span className="ml-2 uppercase">{params.id}</span> - <span>500,122</span><span className="ml-2">USDT</span>
      </p>
      <div className='mt-2'>
        <p className=''>History</p>
      </div>
      <div className="list">
          <div className='w-full'>
            <div className="flex text-xs text-gray-400">
              <div className='w-32'>Date</div>
              <div className='w-10'><span className="text-teal-500">Buy</span>/<span className="text-red-500">Sell</span></div>
              <div className='w-1/3 text-right'>Amount</div>
              <div className='w-1/3 text-right'>Price</div>
              <div className='w-20 text-right'>Platform</div>
            </div>
            <div className="flex text-sm mb-2 py-2">
              <div className='w-32'>2023/12/20</div>
              <div className='w-10 text-teal-500'>Buy</div>
              <div className='w-1/3 text-right'>100</div>
              <div className='w-1/3 text-right'>2.5</div>
              <div className='w-20 text-right'>
                <span className="bg-slate-500 text-white rounded p-1">Okx</span>
              </div>
            </div>
            <div className="flex text-sm mb-2 py-2">
              <div className='w-32'>2023/12/20</div>
              <div className='w-10 text-teal-500'>Buy</div>
              <div className='w-1/3 text-right'>100</div>
              <div className='w-1/3 text-right'>2.5</div>
              <div className='w-20 text-right'>
                <span className="bg-yellow-500 text-white rounded p-1">Binance</span>
              </div>
            </div>
            <div className="flex text-sm mb-2 py-2">
              <div className='w-32'>2023/12/20</div>
              <div className='w-10 text-red-500'>Sell</div>
              <div className='w-1/3 text-right'>100</div>
              <div className='w-1/3 text-right'>2.5</div>
              <div className='w-20 text-right'>
                <span className="bg-blue-500 text-white rounded p-1">Mexc</span>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}