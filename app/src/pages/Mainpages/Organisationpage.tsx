
import SecondOrganisationcreation from '../../components/comps/AltRightside'
import CreateOrg from './CreateOrg'
import OrganizationSidebar from '../../components/comps/Sidebars.tsx/Leftsidebar'

import { useState } from 'react'

const Organisationpage = () => {
 const [istoggled, setistoggled] = useState<boolean>(false)
  return (
    <div className="flex w-full min-h-screen">
      
        <OrganizationSidebar createorgtoggle={istoggled} setorgtoggle={setistoggled}/>
        {/* <OrganizationCreationPanel/> */}
        {istoggled?<><CreateOrg createorgtoggle={istoggled} setorgtoggle={setistoggled}/></>:<></>}
        <SecondOrganisationcreation createorgtoggle={istoggled} setorgtoggle={setistoggled}/>
    </div>
  )
}

export default Organisationpage