import React from 'react'
import { FaEnvelope, FaEnvelopeOpenText, FaRocket } from 'react-icons/fa6'
const Newsletter = () => {
  return (
    <div>
        <div>
            <h3 className='text-lg font-bold mb-2 flex items-center gap-2'>
                <FaEnvelopeOpenText/>
                Email For Jobs</h3>
                <p className='text-primary/75 text-base mb-4'>Please register your email address to receive job updates from JamJobs. 
                    This will ensure that you stay informed whenever new job opportunities become available.</p>
                    <div className='w-full space-y-4'>
                        <input type="email" name='email' id='email' placeholder='name@mail.com' 
                        className='w-full block py-2 pl-3 border focus:outline-none' />
                        <input type="submit" value={"Subcribe"}  className='w-full block py-2 pl-3 border focus:outline-none bg-green rounded-sm text-white
                        cursor-pointer font-semibold'  />
                    </div>
        </div>

        {/* 2nd Part*/}
        <div className='mt-20'>
            <h3 className='text-lg font-bold mb-2 flex items-center gap-2'>
                <FaRocket/>
                Get Noticed Faster</h3>
                <p className='text-primary/75 text-base mb-4'>Enhance your visibility and expedite your job search process by uploading your resume to JamJobs.
                 This proactive step will increase your chances of being noticed for new job opportunities promptly.</p>
                    <div className='w-full space-y-4'>
                        
                        <input type="submit" value={"Upload Resume Here"}  className='w-full block py-2 pl-3 border focus:outline-none bg-green rounded-sm text-white
                        cursor-pointer font-semibold'  />
                    </div>
        </div>
    </div>
  )
}

export default Newsletter