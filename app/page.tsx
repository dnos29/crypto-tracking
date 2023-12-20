import Image from 'next/image'

export default function Home() {
  return (
    <div className='mt-4'>
      Hi there!
      <p className='text-xs	mt-4'>
        Est total value
      </p>
      <p className=''>
        <span className='text-2xl font-bold'>5,686.18</span><sup> USDT</sup>
      </p>
      <div className='mt-2'>
        <p className=''>Assets</p>
        <div className="list">
          <div className='w-full'>
            <div className="flex text-xs text-gray-400">
              <div className='w-32'>Name</div>
              <div className='w-1/2 text-right'>Avg/Market price</div>
              <div className='w-1/2 text-right'>Avg/Market price</div>
            </div>
            <div className="flex text-sm mb-2">
              <div className='w-32'>FTM</div>
              <div className='w-1/2 text-right'>
                  <p>12.12</p>
                  <p>18.12</p>
              </div>
              <div className='w-1/2 text-right'>
                  <p>100</p>
                  <p className='text-teal-500'>+120(20/20%)</p>
              </div>
            </div>
            <div className="flex text-sm mb-2">
              <div className='w-32'>AR</div>
              <div className='w-1/2 text-right'>
                  <p>12.12</p>
                  <p>18.12</p>
              </div>
              <div className='w-1/2 text-right'>
                  <p>100</p>
                  <p className='text-red-500'>-80(20/20%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  )
}
