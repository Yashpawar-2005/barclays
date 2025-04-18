
import SecondOrganisationcreation from '../../components/comps/AltRightside'
import CreateOrg from '../../components/comps/CreateOrg'
import OrganizationSidebar from '../../components/comps/Leftsidebar'
import OrganizationCreationPanel from '../../components/comps/Rightsidebar'
import { useState } from 'react'

const Organisationpage = () => {
 const [istoggled, setistoggled] = useState<boolean>(true)
  return (
    <div className="flex w-full min-h-screen">
        <OrganizationSidebar createorgtoggle={istoggled}/>
        {/* <OrganizationCreationPanel/> */}
        {istoggled?<><CreateOrg createorgtoggle={istoggled} setorgtoggle={setistoggled}/></>:<></>}
        <SecondOrganisationcreation createorgtoggle={istoggled}/>
    </div>
  )
}

export default Organisationpage