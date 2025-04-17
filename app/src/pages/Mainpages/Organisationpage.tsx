
import SecondOrganisationcreation from '../../components/comps/AltRightside'
import OrganizationSidebar from '../../components/comps/Leftsidebar'
import OrganizationCreationPanel from '../../components/comps/Rightsidebar'

const Organisationpage = () => {
  return (
    <div className="flex w-full min-h-screen">
        <OrganizationSidebar/>
        {/* <OrganizationCreationPanel/> */}
        <SecondOrganisationcreation/>
    </div>
  )
}

export default Organisationpage