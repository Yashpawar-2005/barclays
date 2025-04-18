
import { TermsheetSection } from '../../components/comps/Rightsidebars/Rightsidebar'
import OrganizationSidebar from '../../components/comps/Sidebars.tsx/Leftsidebar2'
const Orgid = () => {
  return (
    <div className='flex flex-row'>
     <OrganizationSidebar/>
     <TermsheetSection/>
    </div>
  )
}

export default Orgid